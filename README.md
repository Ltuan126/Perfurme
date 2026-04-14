# Perfume Shop - MERN Stack

A fullstack e-commerce web application built with the MERN stack, featuring authentication (JWT), admin dashboard, order management, and interactive user features such as reviews and Q&A. Designed as a practical project for learning real-world architecture and deployment.

## 🚀 Live Demo
- **Frontend**: https://elegancefragrance.vercel.app
- **Backend**: Running on Render.

## ✨ Features
- **Frontend & UI**: Product list, product details, dark mode & responsive UI (Tailwind CSS).
- **Search & Filter**: Search products by name/description.
- **Shopping**: Shopping cart, COD ordering (orders saved to DB).
- **Authentication**: Secure Registration / Login using JWT (JSON Web Tokens).
- **Admin**: Dashboard, add/edit/delete products, manage orders & update status (Authorization via role + JWT).
- **Interaction**:
  - Product Reviews with an integrated star rating system.
  - Q&A System allowing administrators to respond to buyer inquiries.
- **Policies**: Loyalty points program and bundle purchases (mini bundles) for special offers.

## 🛠️ Tech Stack
- Frontend: React, React Router, Tailwind CSS.
- Backend: Node.js, Express.
- Database: MongoDB, Mongoose.

## 📦 Requirements
- Node.js >= 16
- MongoDB (Local or Atlas)

## ⚙️ Installation & Setup
1) Install dependencies
```bash
npm install
```

2) Database Configuration
- Default URI: `mongodb://localhost:27017/perfume`
- You can configure the URI in `src/db.js` to point to MongoDB Atlas.

3) Start MongoDB
- Ensure `mongod` is running (Compass connects successfully).

4) Import Sample Data (Optional)
```bash
node scripts/seedAll.js
```

5) Run Backend
```bash
node src/server.js
```

6) Run Frontend
```bash
npm start
```

Note:
- `package.json` is configured with a proxy to the backend at `http://localhost:5000` for calling `/api/*` from the frontend during development.

## 🔐 Authentication
The system has migrated to utilizing JWT.

Basic Flow:
1. Register: `POST /api/auth/register` body `{ username, password }`.
2. Login: `POST /api/auth/login` returns `{ token, user: { username, role } }`.
3. Save `token` on the frontend (current demo uses localStorage: `auth_token`).
4. Call protected/admin APIs by adding header:
   `Authorization: Bearer <token>`

Protected routes (requires admin + JWT):
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `PUT /api/orders/:id`

## 📂 Project Structure
```text
src/
|-- server.js                # Application entry point (Express app and global middlewares)
|-- db.js                    # MongoDB connection configuration using Mongoose
|-- routes/                  # API endpoints: auth, products, orders, qa, review
|-- controllers/             # Business logic handlers for route modules
|-- models/                  # Database schemas: Product, Order, User, QA, Review
|-- middleware/              # JWT authentication and error handlers
|-- components/              # React frontend components (Home, Auth, Cart, Admin, etc.)
`-- index.css                # Tailwind configuration and custom utility classes

scripts/
|-- seedAll.js
|-- seedMinis.js
`-- addSizes.js              # Data seeding and product size utility scripts
```

## 📧 Contact
- Author: Ltuan126
- Email: tuanlenguyen612@gmail.com

---
## 🔭 Roadmap
Detailed advanced development roadmap (architecture, JWT, pagination, stock, testing, deployment) can be found at: [docs/ROADMAP.md](./docs/ROADMAP.md)

---
## 🎁 Loyalty & Bundle
Rules for earning points (1 point per 10,000₫ after discount) and mini combo offers (3 mini bottles for -10%) can be found here: [docs/LOYALTY.md](./docs/LOYALTY.md)