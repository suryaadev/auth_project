import React, { useState, useEffect } from "react";

import axios from "axios";

function App() {
  const API = "http://localhost:5000";

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);

  const [userData, setUserData] = useState(null);

  const [ttl, setTtl] = useState(0);

  const register = async () => {
    try {
      await axios.post(`${API}/register`, {
        username,
        password,
      });

      alert("User Registered");
    } catch {
      alert("Registration Failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);

      await loadDashboard();
    } catch {
      alert("Login Failed");
    }
  };

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/user-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserData(res.data);

      setLoggedIn(true);
    } catch {
      logout();
    }
  };

  const getSessionStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/session-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTtl(res.data.ttl);
    } catch {
      alert("Session Expired");

      logout();
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          `${API}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }
    } catch {}

    localStorage.removeItem("token");

    setLoggedIn(false);

    setUserData(null);

    setTtl(0);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      loadDashboard();
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    getSessionStatus();

    const interval = setInterval(getSessionStatus, 1000);

    return () => clearInterval(interval);
  }, [loggedIn]);

  if (loggedIn) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Dashboard</h1>

        <h2>
          Session Remaining:
          {ttl} sec
        </h2>

        <hr />

        <h3>Username</h3>

        <p>{userData?.username}</p>

        <h3>Password Hash</h3>

        <p>{userData?.password}</p>

        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login / Register</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />
      <button onClick={register}>Register</button>{" "}
      <button onClick={login}>Login</button>
    </div>
  );
}

export default App;
