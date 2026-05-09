# 🚀 Live Demo
👉 https://heya-dresses.vercel.app/

---

# 🛒 Full Stack E-Commerce Platform

A modern full-stack e-commerce web application built with Next.js, providing a complete shopping experience including authentication, product management, cart system, payments, and admin dashboard.

---

## 🚀 Features

### 👤 Authentication & Authorization (NextAuth)
- Implemented using **NextAuth.js**
- User registration & login (Email / Phone)
- Social login (Google - bonus)
- Secure session handling
- JWT-based authentication strategy
- Multi-role system:
  - 👤 Customer
  - 🛠 Admin
- Protected routes with role-based access control
- Secure admin dashboard access using authentication middleware

---

### 🧑‍💼 User Features
- Profile management (name, address, payment details)
- Wishlist & favorites system
- Order history tracking
- Guest checkout option

---

### 🛍️ Product System
- Product listings with images, descriptions, and prices
- Categories management
- Stock availability tracking
- Search by name
- Filtering by:
  - Price
  - Category

---

### 🛒 Cart System
- Add / remove items
- Quantity adjustment
- Real-time cart updates
- Order summary with price breakdown

---

### 💳 Payment System
- Multiple payment methods:
  - Credit Card
  - Cash on Delivery
  - Wallet system
- Secure payment integration (Stripe / PayPal / Razorpay)
- Promo codes & discounts (bonus feature)

---

### 📦 Order System
- Order creation & tracking
- Automatic email notification after successful order
- Order history for users

---

### 🛠 Admin Dashboard
- Product management (CRUD)
- Category management
- User management (approve / restrict / soft delete)
- Stock control
- Role-based authorization (admin-only access)

---

## 🔐 Security
- NextAuth authentication system
- Protected API routes
- Role-based access control
- Middleware protection for dashboard routes
- Prevent unauthorized access to admin panel

---

## ⚙️ Tech Stack

### Frontend
- Next.js (App Router)
- React.js
- CSS / Tailwind
- Context API

### Backend
- Next.js API Routes
- MongoDB + Mongoose

### Authentication
- **NextAuth.js**

### Payments
- Stripe / PayPal integration

---

## ✨ Bonus Features
- Guest checkout flow
- Promo codes system
- Email notifications
- Soft delete users
- Advanced filtering system

---

## 🧠 What I Learned
- Full-stack architecture design
- Authentication & authorization with NextAuth
- Role-based system implementation
- Payment gateway integration
- Admin dashboard development
- Real-world e-commerce logic

---

## 📸 Screenshots
### 🏠 Home Page
![Home Page](./public/screenshots/home.png)

### 🛍 Products Page
![Products](./public/screenshots/products.png)
### 🛠 Admin Dashboard
![Cart](./public/screenshots/Cart.png)

---

## ⚙️ Setup

```bash
git clone git@github.com:esraa-abdo3/HEYA-DRESSES.git
cd your-repo
npm install
npm run dev