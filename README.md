# WorkPulse — Employee Management System

## Overview
**WorkPulse** is a full-stack enterprise employee management platform designed to manage staff directories and organizational departments. It pairs a responsive React Single Page Application (SPA) built with Material UI with a Spring Boot 3 REST API secured by stateless JWT authentication and backed by MySQL.

---

## Architecture

```
[ React SPA (Vite + Material UI) ]
                │
                ▼ (HTTP / JSON + JWT Bearer)
[ Spring Boot REST Controllers ]
                │
                ▼ (Validation & DTOs)
[ Service & Business Logic Layer ]
                │
                ▼ (Spring Data JPA)
[ Hibernate ORM / Flyway Migrations ]
                │
                ▼ (JDBC Driver)
[ MySQL 8.0 Database ]
```

---

## Features

- **JWT Authentication**: User registration, login, and stateless token-based authentication with expiration handling.
- **Organization Dashboard**: KPI summary cards displaying total employees, department distribution, and quick navigation.
- **Employee Directory**:
  - Full CRUD operations (Create, Read, Update, Delete).
  - Server-side pagination and multi-field sorting.
  - Live debounced search across first name, last name, and email.
  - Confirmation modals for safe deletion.
- **Department Management**:
  - Full CRUD lifecycle with dynamic employee count aggregation.
  - Strict foreign key business validation (cannot delete departments with assigned employees).
- **Centralized Error Handling**: Unified error response model (`GlobalExceptionHandler`) hiding internal stack traces and database details.
- **Responsive Layout**: Material UI design with desktop drawer, mobile navigation, and feedback snackbars.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Material UI (MUI v6/v7), Emotion, React Router DOM v7, Axios |
| **Backend** | Java 17, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate 6, Flyway |
| **Security** | JSON Web Tokens (JJWT 0.12.6), BCrypt Password Hashing |
| **Database** | MySQL 8.x |
| **API Docs** | Springdoc OpenAPI 3 / Swagger UI |
| **DevOps / Containers** | Multi-stage Dockerfiles, Docker Compose, Nginx Alpine |

---

## Database Model

```mermaid
erDiagram
    USERS {
        binary(16) id PK
        varchar(50) username UK
        varchar(100) email UK
        varchar(255) password
        varchar(20) role
        datetime(6) created_at
    }

    DEPARTMENTS {
        binary(16) id PK
        varchar(100) name UK
        datetime(6) created_at
    }

    EMPLOYEES {
        binary(16) id PK
        varchar(50) first_name
        varchar(50) last_name
        varchar(100) email UK
        varchar(20) phone
        decimal(12,2) salary
        date joining_date
        binary(16) department_id FK
        datetime(6) created_at
    }

    DEPARTMENTS ||--o{ EMPLOYEES : "1-to-Many (department_id)"
```

- **Department (1) $\rightarrow$ Employee (N)**: Each employee belongs to exactly one department via a foreign key reference (`department_id`).
- **Integrity Constraints**: Unique constraints on `users(username, email)`, `departments(name)`, and `employees(email)`.

---

## Authentication

1. **User Registration**: `POST /api/auth/register` hashes passwords with BCrypt before persisting the user record.
2. **User Login**: `POST /api/auth/login` validates credentials and issues an HMAC-SHA256 signed JWT token containing the username claim and expiration timestamp.
3. **Protected Requests**: The React Axios interceptor attaches the token as `Authorization: Bearer <token>`. The backend `JwtAuthenticationFilter` validates the signature, extracts the user details, and sets the Spring `SecurityContext`.
4. **Session Expiry**: Expired tokens return `401 Unauthorized`, prompting the frontend auth interceptor to clear the session and route to the login screen.

---

## API

Interactive Swagger / OpenAPI UI is accessible at:
- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Endpoint Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Application health status probe |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT |
| `GET` | `/api/employees` | Authenticated | Paginated & searchable employee list |
| `POST` | `/api/employees` | Authenticated | Create a new employee record |
| `GET` | `/api/employees/{id}` | Authenticated | Get employee details by UUID |
| `PUT` | `/api/employees/{id}` | Authenticated | Update employee details |
| `DELETE` | `/api/employees/{id}` | Authenticated | Delete employee record |
| `GET` | `/api/departments` | Authenticated | List all departments with employee counts |
| `POST` | `/api/departments` | Authenticated | Create a new department |
| `GET` | `/api/departments/{id}` | Authenticated | Get department details by UUID |
| `PUT` | `/api/departments/{id}` | Authenticated | Update department name |
| `DELETE` | `/api/departments/{id}` | Authenticated | Delete department (rejected if staff assigned) |

---

## Screenshots

| Dashboard View | Employee Directory |
| :---: | :---: |
| *(Dashboard KPI metrics & department distribution)* | *(Searchable, paginated employee table with actions)* |

| Department Management | Add / Edit Employee Form |
| :---: | :---: |
| *(Department cards with active employee counts)* | *(Validated employee form with department dropdown)* |

---

## Getting Started

### Prerequisites
- **Java 17+** & **Maven 3.8+**
- **Node.js 18+** & **npm**
- **MySQL 8.x** running locally

### 1. Database Setup
```sql
CREATE DATABASE IF NOT EXISTS employee_management;
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your credentials:
```bash
cp .env.example .env
```

### 3. Run Backend (Spring Boot)
```bash
# From repository root
mvn clean test
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`.*

### 4. Run Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## Docker

Run the entire application stack (MySQL, Spring Boot backend, and React frontend served via Nginx) using Docker Compose.

### 1. Start Stack
```bash
docker compose up --build -d
```

### 2. Service Access URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:3000](http://localhost:3000) | React SPA via Nginx with SPA routing |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Spring Boot REST API |
| **Swagger UI** | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | Interactive OpenAPI documentation |
| **Health Probe** | [http://localhost:8080/api/health](http://localhost:8080/api/health) | Backend health check endpoint |

### 3. Stop Stack
```bash
# Stop containers and preserve MySQL data volume
docker compose down

# Stop containers and wipe database volume
docker compose down -v
```

---

## Testing

### Backend Unit & Integration Tests (48 Tests)
```bash
mvn clean test
```
*Executes all controller integration tests, security filter tests, validation tests, and JPA repository queries.*

### Frontend Production Build
```bash
cd frontend
npm run build
```
*Compiles the React application with Vite into optimized production bundles in `frontend/dist/`.*

---

## Security

- **BCrypt Password Encryption**: Strong salt rounds hashing for user passwords.
- **Stateless JWT**: Standard Authorization Bearer headers with environment-configured signing secrets.
- **Sanitized Error Responses**: Zero SQL or internal stack trace leakage in client error responses.
- **Container Isolation**: Backend runs as an unprivileged non-root user (`workpulse`); frontend runs inside a lightweight Nginx container.
- **Secret Isolation**: Configuration secrets are decoupled via environment variables; `.env` is ignored by Git and Docker context.

---

## Future Improvements

- **Refresh Token Rotation**: Short-lived access tokens combined with `HttpOnly` refresh cookies.
- **Role-Based Access Control (RBAC)**: Fine-grained `@PreAuthorize` authorization for `ADMIN` vs `HR_MANAGER` roles.
- **Automated CI/CD**: GitHub Actions workflow for automated test execution and multi-arch Docker image publishing.
