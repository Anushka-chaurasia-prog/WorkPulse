# WorkPulse — Employee Management System

## Overview
**WorkPulse** is a modern, full-stack enterprise employee management system designed for managing organizational structures, staff directories, and business departments. The platform features a responsive React Single Page Application (SPA) backed by a hardened Spring Boot REST API secured with stateless JSON Web Token (JWT) authentication.

---

## Architecture

```
[ React SPA (Vite + Material UI) ]
                │
                ▼ (HTTP / JSON + JWT Bearer)
[ Spring Boot REST Controllers (Spring Web) ]
                │
                ▼ (Security Context & Validation)
[ Service & Business Logic Layer ]
                │
                ▼ (Repository Abstraction)
[ Spring Data JPA / Hibernate ORM ]
                │
                ▼ (JDBC / MySQL Driver)
[ MySQL Relational Database ]
```

---

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Components & Icons**: Material UI (MUI v6/v7) & Emotion
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios (with centralized JWT interceptor)
- **State Management**: React Context API (`AuthContext`)

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.3.5
- **Security**: Spring Security & BCrypt password hashing
- **Authentication**: Stateless JSON Web Tokens (JJWT 0.12.6)
- **Persistence**: Spring Data JPA & Hibernate 6
- **Database**: MySQL 8.x
- **Validation**: Jakarta Bean Validation
- **Documentation**: Springdoc OpenAPI / Swagger UI

---

## Core Features

- **JWT Authentication**: User registration, login, and protected routes with token expiration checks.
- **Organization Dashboard**: Real-time KPI metrics displaying live employee counts, department distributions, and quick navigation.
- **Employee Directory**:
  - Full CRUD lifecycle (Create, Read, Update, Delete).
  - Server-side pagination and sorting.
  - Live debounced search across first name, last name, and email.
  - Safe delete confirmation dialog with automatic pagination re-indexing.
- **Department Management**:
  - Full CRUD lifecycle with dynamic employee count aggregation.
  - Strict business rule enforcement: departments with active employees cannot be deleted (HTTP 409).
- **Hardened Error Handling**: Centralized `GlobalExceptionHandler` returning consistent, sanitized error payloads with zero stack trace or SQL leakage.
- **Responsive Interface**: Mobile-friendly navigation drawer, adaptive grids, and scrollable data tables.

---

## Database Model & Relationships

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

    DEPARTMENTS ||--o{ EMPLOYEES : "1-to-Many"
```

- **Department 1 $\rightarrow$ N Employee**: `Department` has a `@OneToMany(mappedBy = "department")` mapping. `Employee` references `Department` via `@ManyToOne(fetch = FetchType.LAZY)`.
- **Foreign Key Integrity**: Deleting a department with active assigned employees is rejected at both service and database levels to prevent orphaned records.

---

## Authentication Mechanism

1. **Registration**: User registers via `/api/auth/register`. Passwords are encrypted with BCrypt before storage.
2. **Login**: User authenticates via `/api/auth/login`. On successful credential verification, the backend issues an HMAC-SHA256 signed JWT containing the username subject and expiration claim.
3. **Protected Requests**: The frontend Axios request interceptor injects `Authorization: Bearer <token>` on every API call. The backend `JwtAuthenticationFilter` validates signature and expiration before establishing the `SecurityContext`.
4. **Session Invalidation**: If an expired or invalid token is presented (HTTP 401), the Axios response interceptor clears client authentication state and redirects to `/login`.

---

## Local Setup & Installation

### Prerequisites
- Java 17+ (`java -version`)
- Maven 3.8+ (`mvn -version`)
- Node.js 18+ and npm (`node -v`, `npm -v`)
- Running MySQL 8.x instance

### 1. Database Setup
Create a MySQL database for the application:
```sql
CREATE DATABASE IF NOT EXISTS employee_management;
```

### 2. Configure Environment Variables
Set the following environment variables or use the development defaults:

| Variable | Description | Example / Placeholder |
| :--- | :--- | :--- |
| `DB_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/employee_management?createDatabaseIfNotExist=true&useSSL=false` |
| `DB_USERNAME` | Database username | `your_db_username` |
| `DB_PASSWORD` | Database password | `your_db_password` |
| `JWT_SECRET` | Base64 256-bit secret key | `your_base64_encoded_jwt_secret_key` |
| `JWT_EXPIRATION` | Token TTL in milliseconds | `3600000` (1 hour) |

### 3. Run Backend Service
```bash
# From repository root
mvn clean test
mvn spring-boot:run
```
The backend API starts on `http://localhost:8080`.

### 4. Run Frontend Application
```bash
# Navigate to frontend directory
cd frontend

# Copy environment example
cp .env.example .env

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```
The frontend starts on `http://localhost:5173`.

---

## API Documentation & Endpoints

Interactive Swagger / OpenAPI UI is accessible when the backend is running:
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

### REST Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health probe |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/employees` | Authenticated | Paginated employee list (`?search=`, `?page=`, `?size=`, `?sort=`) |
| `POST` | `/api/employees` | Authenticated | Create a new employee |
| `GET` | `/api/employees/{id}` | Authenticated | Get employee details by ID |
| `PUT` | `/api/employees/{id}` | Authenticated | Update employee by ID |
| `DELETE` | `/api/employees/{id}` | Authenticated | Delete employee by ID |
| `GET` | `/api/departments` | Authenticated | List all departments with employee counts |
| `POST` | `/api/departments` | Authenticated | Create a new department |
| `GET` | `/api/departments/{id}` | Authenticated | Get department details by ID |
| `PUT` | `/api/departments/{id}` | Authenticated | Update department name |
| `DELETE` | `/api/departments/{id}` | Authenticated | Delete department (fails 409 if staff assigned) |

---

## Running Tests & Builds

### Backend Test Suite
```bash
mvn clean test
```
Executes all 48 unit and integration tests (Spring Boot test slice, JPA mapping, Auth & CRUD integration).

### Frontend Production Build
```bash
cd frontend
npm run build
```
Generates production-optimized static bundles into `frontend/dist/`.

---

## Project Structure

```
d:/WorkPulse/
├── pom.xml                               # Backend Maven configuration
├── Dockerfile                            # Multi-stage backend Docker build (Temurin 17 JRE)
├── docker-compose.yml                    # Multi-service orchestration (MySQL, Backend, Frontend)
├── .dockerignore                         # Docker build context exclusions
├── .env.example                          # Root environment template (secrets excluded)
├── .gitignore                            # Git repository ignore rules
├── README.md                             # Project documentation & architecture guide
├── src/                                  # Spring Boot Backend Source
│   ├── main/
│   │   ├── java/com/employee/management/
│   │   │   ├── config/                   # SecurityConfig & OpenApiConfig
│   │   │   ├── controller/               # Auth, Employee, Department, Health Controllers
│   │   │   ├── dto/                      # Immutable Record DTOs (Requests & Responses)
│   │   │   ├── entity/                   # JPA Entities (User, Employee, Department)
│   │   │   ├── exception/                # GlobalExceptionHandler & Custom Exceptions
│   │   │   ├── repository/               # Spring Data JPA Repositories
│   │   │   ├── security/                 # JwtService, Filter, UserDetailsService
│   │   │   └── service/                  # Business Logic Services
│   │   └── resources/
│   │       ├── db/migration/
│   │       │   └── V1__initial_schema.sql # Flyway baseline schema migration
│   │       └── application.properties    # Environment-driven Spring configuration
│   └── test/                             # 48 Unit and Integration Tests
│       ├── java/com/employee/management/ # Controller, Service, and Repository test suites
│       └── resources/
│           └── application.properties    # Isolated test profile configuration
└── frontend/                             # React Single Page Application Source
    ├── package.json                      # Frontend dependencies and build scripts
    ├── vite.config.js                    # Vite configuration
    ├── Dockerfile                        # Multi-stage frontend Docker build (Node 20 -> Nginx)
    ├── nginx.conf                        # Nginx SPA fallback routing configuration
    ├── .dockerignore                     # Frontend Docker context exclusions
    ├── .env.example                      # Frontend environment template
    ├── .gitignore                        # Frontend ignore rules
    └── src/
        ├── api/                          # Axios client & centralized API service modules
        ├── components/                   # Reusable UI (ConfirmDialog, EmptyState, etc.)
        ├── context/                      # AuthContext & Session management
        ├── hooks/                        # Custom hooks (useAuth)
        ├── layouts/                      # MainLayout with responsive navigation drawer
        ├── pages/                        # Dashboard, Employee & Department views
        ├── routes/                       # AppRoutes, ProtectedRoute, PublicRoute
        └── utils/                        # Token storage and JWT expiration helpers
```

---

---

## Docker & Container Deployment

WorkPulse provides production-oriented multi-stage Dockerfiles and a `docker-compose.yml` specification for running the complete application stack (MySQL, Spring Boot backend, and React frontend) with a single command.

### Prerequisites
- [Docker Engine](https://docs.docker.com/engine/install/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

### 1. Configure Environment Variables
Copy the root `.env.example` template:
```bash
cp .env.example .env
```
Edit `.env` to supply local database credentials and your 256-bit JWT secret:
```properties
DB_NAME=employee_management
DB_USERNAME=employee_app
DB_PASSWORD=YourStrongDbPassword123!
DB_ROOT_PASSWORD=YourStrongRootPassword123!
JWT_SECRET=c3VwZXJzZWNyZXRqd3RrZXlmb3JlbXBsb3llZW1hbmFnZW1lbnRzeXN0ZW0yMDI2IWtleQ==
JWT_EXPIRATION=3600000
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Build and Start All Containers
```bash
docker compose up --build -d
```
Docker Compose will:
1. Start the **MySQL 8.0** container and wait for its healthcheck to report `healthy`.
2. Build the **Spring Boot backend** via a multi-stage Dockerfile (Maven build $\rightarrow$ lightweight JRE 17 Alpine runtime) and execute Flyway schema migrations on startup.
3. Build the **React frontend** via a multi-stage Dockerfile (Node.js build $\rightarrow$ Nginx Alpine server with SPA routing fallback).

### 3. Access Dockerized Services

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:3000` | React UI served via Nginx with SPA fallback |
| **Backend REST API** | `http://localhost:8080` | Spring Boot REST API |
| **Swagger UI** | `http://localhost:8080/swagger-ui/index.html` | Interactive OpenAPI documentation |
| **Health Probe** | `http://localhost:8080/api/health` | Backend service health endpoint |

### 4. Stopping and Managing Data

- **Stop containers (preserve database volume)**:
  ```bash
  docker compose down
  ```
  *Your database records remain safely preserved in the named Docker volume `workpulse_mysql_data`.*

- **Stop containers and purge all database volume data**:
  ```bash
  docker compose down -v
  ```
  *(Destructive: removes the named volume and erases all database tables).*

---

## Security Notes
- **Password Protection**: BCrypt hashing with salt rounds handled by Spring Security's `PasswordEncoder`. Plaintext passwords are never logged or stored.
- **JWT Protection**: Tokens are signed using HMAC-SHA256 with environment-configurable secret keys.
- **CORS Whitelisting**: Configurable origin whitelisting (`CORS_ALLOWED_ORIGINS`) with credentials enabled. Wildcard origins (`*`) are disallowed for authenticated endpoints.
- **Sanitized Errors**: SQL exceptions, stack traces, and internal database class names are intercepted by `GlobalExceptionHandler` and hidden from client responses.
- **Container Isolation**: Backend runs under an unprivileged non-root user (`workpulse`), and frontend is served via an optimized Nginx server with SPA security headers.

---

## Future Improvements
- **Refresh Token Rotation**: Implement short-lived access tokens accompanied by rotating refresh tokens stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- **Role-Based Access Control (RBAC)**: Expand user roles (`ADMIN`, `HR_MANAGER`, `EMPLOYEE`) with fine-grained endpoint method security (`@PreAuthorize`).
- **Kubernetes / Cloud Orchestration**: Helm charts or Kubernetes manifests for cloud cluster deployment.
- **Automated CI/CD**: Setup GitHub Actions workflow for automated testing and container image builds.

