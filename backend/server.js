const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const redis = require("redis");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = "mysecret";

let db;

const redisClient = redis.createClient({
  url: "redis://redis:6379",
});

async function connectRedis() {
  while (true) {
    try {
      await redisClient.connect();

      console.log("Redis Connected");

      break;
    } catch (err) {
      console.log("Waiting for Redis...");

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function connectMySQL() {
  while (true) {
    try {
      db = await mysql.createConnection({
        host: "mysql",
        user: "root",
        password: "root123",
        database: "authdb",
      });

      console.log("MySQL Connected");

      break;
    } catch (err) {
      console.log("Waiting for MySQL...");

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function initializeDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);

  console.log("Users table ready");
}

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await db.execute("INSERT INTO users(username,password) VALUES (?,?)", [
      username,
      hash,
    ]);

    res.json({
      message: "User Registered",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Registration Failed",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.execute("SELECT * FROM users WHERE username=?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        message: "User Not Found",
      });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "120s" });

    await redisClient.set(`session:${user.id}`, token, {
      EX: 120,
    });

    res.json({
      token,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Login Failed",
    });
  }
});

app.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token Missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET);

    const session = await redisClient.get(`session:${decoded.id}`);

    if (!session) {
      return res.status(401).json({
        message: "Session Expired",
      });
    }

    res.json({
      message: "Welcome User",
      userId: decoded.id,
    });
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
});

app.get("/user-details", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET);

    const session = await redisClient.get(`session:${decoded.id}`);

    if (!session) {
      return res.status(401).json({
        message: "Session Expired",
      });
    }

    const [rows] = await db.execute(
      "SELECT username,password FROM users WHERE id=?",
      [decoded.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
});

app.get("/session-status", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET);

    const ttl = await redisClient.ttl(`session:${decoded.id}`);

    if (ttl <= 0) {
      return res.status(401).json({
        message: "Session Expired",
      });
    }

    res.json({
      ttl,
    });
  } catch (err) {
    res.status(401).json({
      message: "Session Expired",
    });
  }
});

app.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET);

    await redisClient.del(`session:${decoded.id}`);

    res.json({
      message: "Logged Out",
    });
  } catch (err) {
    res.status(401).json({
      message: "Logout Failed",
    });
  }
});

async function startApplication() {
  await connectRedis();

  await connectMySQL();

  await initializeDatabase();

  app.listen(5000, () => {
    console.log("Server Started On Port 5000");
  });
}

startApplication();
