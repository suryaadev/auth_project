# React + Node.js + MySQL + Redis Authentication System

## Overview

This project demonstrates a complete authentication system using:

- React Frontend
- Node.js + Express Backend
- MySQL Database
- Redis Session Store
- JWT Authentication
- Docker & Docker Compose

The application allows users to:

- Register a new account
- Login using username and password
- Store passwords securely using bcrypt hashing
- Generate JWT tokens upon successful login
- Maintain active sessions in Redis
- Display user details on a dashboard
- Track real-time session expiration using Redis TTL
- Automatically logout when the session expires
- Manually logout using the Logout button

---

## Architecture

```text
React Frontend
      |
      v
Node.js Express API
      |
      +------ MySQL
      |
      +------ Redis
```

---

## Technology Stack

### Frontend

- React
- Axios

### Backend

- Node.js
- Express.js
- JWT
- bcrypt

### Database

- MySQL 8

### Cache / Session Store

- Redis 7

### Containerization

- Docker
- Docker Compose

---

## Project Structure

```text
react-node-auth/

├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        └── index.js
```

---

## Authentication Flow

### Registration

1. User enters username and password.
2. Backend hashes password using bcrypt.
3. User data is stored in MySQL.

### Login

1. User submits credentials.
2. Backend validates credentials.
3. JWT token is generated.
4. Redis session is created.

Example Redis key:

```text
session:1
```

TTL:

```text
120 seconds
```

---

## Session Management

The application uses Redis as the source of truth for active sessions.

When a user logs in:

```text
Redis Key:
session:<user_id>
```

Example:

```text
session:1
```

The session is configured with:

```text
TTL = 120 seconds
```

The frontend polls the backend every second to retrieve the current Redis TTL.

Dashboard countdown reflects the actual Redis session lifetime.

When Redis removes the session key:

```text
TTL = 0
```

the user is automatically logged out.

---

## JWT Structure

JWT contains:

```json
{
  "id": 1,
  "iat": 123456789,
  "exp": 123456909
}
```

The token is verified on every protected request.

---

## API Endpoints

### Register

```http
POST /register
```

Request:

```json
{
  "username": "rohit",
  "password": "password123"
}
```

---

### Login

```http
POST /login
```

Request:

```json
{
  "username": "rohit",
  "password": "password123"
}
```

Response:

```json
{
  "token": "<jwt-token>"
}
```

---

### User Details

```http
GET /user-details
```

Authorization Header:

```text
Bearer <jwt-token>
```

Response:

```json
{
  "username": "rohit",
  "password": "$2b$10$..."
}
```

---

### Session Status

```http
GET /session-status
```

Response:

```json
{
  "ttl": 97
}
```

---

### Logout

```http
POST /logout
```

Deletes Redis session.

---

## Running the Application

### Build and Start

```bash
docker compose up --build
```

---

### Stop Containers

```bash
docker compose down
```

---

### Remove Containers and Volumes

```bash
docker compose down -v
```

---

## Access URLs

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

MySQL:

```text
localhost:3306
```

Redis:

```text
localhost:6379
```

---

## Useful Redis Commands

Enter Redis:

```bash
docker compose exec redis redis-cli
```

List sessions:

```redis
KEYS session:*
```

View session token:

```redis
GET session:1
```

View TTL:

```redis
TTL session:1
```

---

## Useful MySQL Commands

Enter MySQL:

```bash
docker compose exec mysql mysql -u root -p
```

Use database:

```sql
USE authdb;
```

View users:

```sql
SELECT * FROM users;
```

---

## Security Notes

This project is intended for learning purposes.

In production:

- Do not expose password hashes to the frontend.
- Store JWT secret in environment variables.
- Use HTTPS.
- Implement refresh tokens.
- Add rate limiting.
- Use Redis session invalidation strategies.
- Add role-based access control.

---

## Learning Outcomes

This project demonstrates:

- React fundamentals
- Express.js APIs
- JWT Authentication
- Password hashing with bcrypt
- Redis session management
- MySQL integration
- Docker Compose orchestration
- Container networking
- Real-time session expiration handling
- Full-stack application development

```

```
