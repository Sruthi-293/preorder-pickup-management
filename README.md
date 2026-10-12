# Pre-Order & Pickup Management System

A full-stack CRUD project using **React + CSS** for the frontend, **Spring Boot** for the backend, and an **H2 database** (file-backed) for storage.

## Features
- Menu item CRUD: create, view, edit, and delete menu items.
- Pre-order CRUD: create, view, edit, and delete pickup orders.
- Orders store customer name, phone, pickup date/time, status, and menu item/quantity.
- REST API validation and simple responsive UI.
- H2 console for inspecting stored data.

## Requirements
- Java 17+
- Maven 3.9+
- Node.js 18+ and npm

## Run backend
```bash
cd backend
mvn spring-boot:run
```
Backend: `http://localhost:8080`  
H2 console: `http://localhost:8080/h2-console`  
JDBC URL: `jdbc:h2:file:./data/preorderdb` · User: `sa` · Password: *(blank)*

## Run frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## Main API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/menu-items` | List menu items |
| GET | `/api/menu-items/{id}` | Get one menu item |
| POST | `/api/menu-items` | Create menu item |
| PUT | `/api/menu-items/{id}` | Update menu item |
| DELETE | `/api/menu-items/{id}` | Delete menu item |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/{id}` | Get one order |
| POST | `/api/orders` | Create pre-order |
| PUT | `/api/orders/{id}` | Update pre-order |
| DELETE | `/api/orders/{id}` | Delete pre-order |

## Suggested demo
1. Add a menu item such as “Veg Sandwich”.
2. Create a pre-order using that item and choose a pickup date/time.
3. Edit the order status to `READY` or update its pickup details.
4. Delete a test order and menu item to demonstrate all CRUD operations.

This is an educational starter project. Authentication, payment processing, and production deployment are not included.
