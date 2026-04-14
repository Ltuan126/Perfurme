# Perfume Shop - MERN Stack

A simple e-commerce perfume shop with a modern UI (Tailwind) and MongoDB/Express backend. Ideal for learning and showcasing personal projects.

## 🚀 Live Demo
- **Frontend**: [https://ltuan126.github.io/Perfurme](https://ltuan126.github.io/Perfume) (Deployed on GitHub Pages / Vercel)
- **Backend**: Deployed on Render (with MongoDB Atlas)

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

## 🔐 Authentication & Sample Accounts
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

Example fetch to update a product:
```javascript
fetch('/api/products/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  },
  body: JSON.stringify({ name: 'New', price: 100 })
})
```

Sample Accounts (if seeded / pre-created):
- Admin: Manually create by registering, then update the role in the DB (`users` collection) to `admin`.

Security notes (planned upgrades):
- Access tokens currently have a short expiration (e.g., 15m) – no refresh token yet.
- May migrate from localStorage to httpOnly cookies to mitigate XSS vulnerabilities.
- Add rate limiting & password reset later.

## 📂 Project Structure
The project has been refactored into a standard MVC architecture, separating logic, routers, and database schemas for easier maintenance and scalability:
- `src/server.js`: Application entry point (Sets up Express app & global middlewares).
- `src/db.js`: MongoDB connection configuration using Mongoose.
- `src/routes/`: API Endpoints (`auth`, `products`, `orders`, `qa`, `review`).
- `src/controllers/`: Business logic handlers for specific routes.
- `src/models/`: Database schemas (Product, Order, User, QA, Review).
- `src/middleware/`: JWT Authentication & Error Handlers.
- `scripts/`: Tools to seed sample data (`seedAll.js`, `seedMinis.js`, `addSizes.js`).
- `src/components/`: React Frontend Components (Home, Auth, Cart, Admin, Product Details, etc.).
- `src/index.css`: Tailwind configuration and custom utility classes.

## 📝 Git Notes
If you encounter a non-fast-forward push error:
```bash
git fetch origin
git rebase origin/main
# If conflicts occur: resolve them in files, then
git add <file>
git rebase --continue
git push origin main
```

## 📧 Contact
- Author: Ltuan126
- Email: (add if necessary)

---
## 🔭 Roadmap
Detailed advanced development roadmap (architecture, JWT, pagination, stock, testing, deployment) can be found at: [docs/ROADMAP.md](./docs/ROADMAP.md)

Note: Upgraded to JWT. Refer to the roadmap for the next security steps (refresh token, CSRF, rate limiting, etc.).

---
## 🎁 Loyalty & Bundle
Rules for earning points (1 point per 10,000₫ after discount) and mini combo offers (3 mini bottles for -10%) can be found here: [docs/LOYALTY.md](./docs/LOYALTY.md)
