# CoreInventory — Inventory Management System (MERN)

A modern full-stack web application designed to help businesses manage products, categories, stock levels, and inventory operations in real-time from a centralized dashboard.

---

## 🚀 Tech Stack

- **Frontend**: React 18, React Router DOM v6, Axios, Lucide React, Modern CSS3 Glassmorphic Design System
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT Authentication, bcryptjs, Multer
- **Dev Tooling**: Vite, Dotenv, CORS

---

## 📁 Project Structure

```text
inventory-system/
│
├── frontend/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, ProtectedRoute, ProductCard, StockModal, StatsCard
│   │   ├── pages/                # Login, Dashboard, Products, AddProduct, EditProduct, Categories, Inventory
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── services/             # Axios API client & endpoints
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Glassmorphic dark design system
│   ├── .env
│   ├── index.html
│   └── package.json
│
├── backend/                      # Express & Node.js Backend
│   ├── config/                   # db.js MongoDB connection
│   ├── controllers/              # auth, product, category, dashboard controllers
│   ├── middleware/               # JWT auth, error handler, Multer uploads
│   ├── models/                   # User, Product, Category, StockLog
│   ├── routes/                   # auth, product, category, dashboard routes
│   ├── uploads/                  # Uploaded product images
│   ├── .env                      # Backend configuration
│   ├── server.js                 # Express server & seed runner
│   └── package.json
│
└── README.md
```

---

## ⚡ Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

* Backend server runs on `http://localhost:5000`
* Default Admin User is seeded automatically:
  - **Email:** `admin@example.com`
  - **Password:** `password123`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

* Frontend application will be available at `http://localhost:5173`

---

## 🛡️ Key Features

1. **JWT Authentication & Protection**: Secure admin registration, bcrypt password hashing, token expiration, and route guards.
2. **Dashboard Analytics**: Real-time KPI cards, total stock valuation, category distribution breakdown, low-stock watchlist, and recent activity feed.
3. **Product Catalog**: Live search, category filtering, stock level filtering, grid and table view toggles, image upload, and SKU generation.
4. **Interactive Stock Adjustments**: Instant **Stock IN**, **Stock OUT**, and **Audit SET** with auto-status evaluation (In Stock / Low Stock / Out of Stock).
5. **Category Management**: Create, edit, and delete categories with product-association safety checks.
6. **Stock Audit Trail**: Immutable transaction history tracking every unit addition, reduction, and product change.
