# Smart Inventory System (React + MongoDB)

A modern, full-stack inventory management application migrated from Angular/Firebase to React/MongoDB. This system provides comprehensive features for managing products, tracking sales, generating invoices, and analyzing financial performance.

## 🚀 Features

- **JWT Authentication**: Secure login and registration with stateless JWT tokens.
- **POS-Style Billing**: Fast product search, barcode scanning support, and instant invoice generation.
- **Inventory Management**: Track stock levels, set low stock alerts, and manage product details.
- **Dashboard Analytics**: Real-time sales charts, stock insights, and financial summaries.
- **Customer Management**: Maintain a directory of customers and their transaction history.
- **Accounting**: Track income, expenses, and net profit with detailed transaction logs.
- **Settings**: Customize business name, currency, tax rates, and thresholds.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Bootstrap 5, Lucide Icons, Chart.js, Axios, React Router.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt.js.
- **Design**: Premium Clean UI with modern aesthetics.

## 📁 Project Structure

```text
Inventory_Software/
├── Client/             # React Frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # AuthContext & Global State
│   │   ├── pages/      # Feature-specific pages
│   │   └── main.jsx    # Entry point
├── Server/             # Node.js Backend
│   ├── src/
│   │   ├── models/     # Mongoose Schemas
│   │   ├── routes/     # API Endpoints
│   │   ├── middleware/ # Auth & Security
│   │   └── app.js      # Express server setup
└── README.md           # Documentation
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or via Atlas)

### Backend Setup (Server)
1. Navigate to the `Server` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup (Client)
1. Navigate to the `Client` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## 📸 Project Output

*(Note: Since I am an AI agent, I cannot take physical screenshots. Please run the application to see the stunning modern UI.)*

- **Dashboard**: Real-time analytics and stock alerts.
- **POS Billing**: Seamless product search and transaction flow.
- **Inventory**: Clean table layout with stock status indicators.

## 📄 License
MIT License
