# Personal Expense Tracker

A comprehensive, full-stack web application designed to help users efficiently manage and visualize their personal finances. Built for seamless presentation and real-world utility, this Tracker features a sleek dashboard, dynamic reporting, and robust data persistence.

## 🚀 Features

- **User Authentication:** Secure JWT-based registration and login system.
- **Interactive Dashboard:** Real-time summary figures and dynamic chart visualizations.
- **Granular Analytics:** Filter and view spending trends by specific timeframes (Daily, Weekly, Monthly).
- **Expense Management:** Fully featured CRUD functionality (Create, Read, Update, Delete) to easily log and fix expenses.
- **Dynamic CSV Reports:** Securely download categorized financial reports straight to Microsoft Excel or CSV viewers.

## 🛠 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Recharts (for data visualization), Lucide-React (icons).
- **Backend:** Node.js, Express.js.
- **Database:** MySQL.
- **Tooling:** Axios, React Router v6.

## ⚙️ Local Setup Instructions

This project requires [Node.js](https://nodejs.org/) and [MySQL](https://www.mysql.com/) to be installed on your machine.

### 1. Database Configuration
1. Open your MySQL client and create a new database:
   ```sql
   CREATE DATABASE expense_tracker;
   ```
2. Navigate to `/server/db/schema.sql` and run the contained SQL commands to generate the `users` and `expenses` tables.
3. In the `/server` folder, ensure you have a `.env` file configured with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=expense_tracker
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

### 2. Install Dependencies
Run the installation script from the **root** folder, which uses concurrently to install dependencies for both the frontend client and the backend server:

```bash
npm run install-all
```

### 3. Start the Application
To run both the React frontend and the Express backend simultaneously:

```bash
npm start
```

- The React application will be accessible at: `http://localhost:5173`
- The Express API server will listen on: `http://localhost:5000`

## 📊 Presentation Mode

The project is natively bound to `0.0.0.0`, allowing active cross-device testing. You can access the interface on your smartphone or another computer connected to the same WiFi network by navigating to `http://<YOUR_LOCAL_IP>:5173`.
