
# Grocery Service API

This project implements a REST API for managing users (managers, employees) and organizational nodes representing stores and regions.

---

## Features

- User authentication and role-based authorization
- CRUD operations for Employees and Managers
- Hierarchical node structure representing locations and stores
- Retrieval of users filtered by node and descendants
- JWT-based authentication

---

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB instance (local or remote)
- npm

---

### Installation

```bash
npm install
````

---

### Environment Variables

Create a `.env` file in the root directory and configure:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/grocery-service-db
JWT_SECRET=your_jwt_secret_here
```

---

### Running the Server

```bash
npm run start
# or for development with hot reload
npm run dev
```

The server will start on the port specified in `.env` (default 3000).

---

### Running Tests

Tests use an in-memory MongoDB instance for isolation.

```bash
npm run test
```

---

## Validation

**Current Status:**
Input validation on API requests is minimal or missing.

**Recommended Validators:**

* **AJV**
* **Joi** 

Adding validation will improve API robustness by ensuring data correctness and providing clear error messages to clients.

---
