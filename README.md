# Employee Resource Management (ERM) System

A modern, full-stack Employee Management System built with **Next.js 14**, featuring role-based access control, secure authentication, and real-time employee management capabilities.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Azure SQL](https://img.shields.io/badge/Azure%20SQL-Database-blue?style=for-the-badge&logo=microsoft-azure)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)

---

## 🚀 Live Demo

**Demo Application**: [https://employe-resource-management-erm.vercel.app/login](https://employe-resource-management-erm.vercel.app/login)

---

## 📋 Project Overview

This **Employee Resource Management (ERM)** system is a comprehensive solution for managing employees, attendance, and organizational hierarchy with secure **role-based access control (RBAC)**. It is built with a modern technology stack and deployed on Vercel with an Azure SQL database.

---

## ✨ Features

### 🔐 Authentication & Security
* **JWT-based Authentication** with secure token management.
* **Role-Based Access Control (RBAC)** with three distinct roles:
    * 👑 **Admin**: Full system access and user management.
    * 👥 **HR**: Employee data management and attendance tracking.
    * 💼 **Employee**: Personal dashboard and attendance marking.
* **ZOD Schema Validation** for robust data integrity.
* **Secure API Routes** with middleware protection.

### 👥 User Management
* Complete employee lifecycle management.
* Role assignment and permissions management.
* Profile management and updates.
* Secure user deletion and data management.

### 📊 Attendance System
* Real-time attendance tracking.
* Attendance history and reports.
* Leave management integration.
* Automated attendance records.

### 🛡️ Core Security Features
* Type-safe development with **TypeScript**.
* Input validation with **ZOD** schemas.
* Protected API routes and middleware.
* Secure password handling.
* CSRF protection.

---

## 🛠️ Technology Stack

| Category | Key Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router, Server Components), TypeScript, Tailwind CSS, React Hooks |
| **Backend** | Next.js API Routes, Prisma ORM, JWT, ZOD |
| **Database** | Azure SQL Database |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.x or higher
* Azure SQL Database instance

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Iroshpanday/Employe-Resource-management-ERM-.git](https://github.com/Iroshpanday/Employe-Resource-management-ERM-.git)
    cd Employe-Resource-management-ERM-
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables**

    Create a `.env.local` file in the root directory:
    ```
    DATABASE_URL="your-azure-sql-connection-string"
    JWT_SECRET="your-jwt-secret"
    NEXTAUTH_SECRET="your-nextauth-secret"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Set up database**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run development server**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` to view the application.

---

## 👥 Role-Based Access

| Role | Access Level |
| :--- | :--- |
| 👑 **Admin** | Full system control and user management. |
| 👥 **HR** | Employee data and attendance management. |
| 💼 **Employee** | Personal dashboard and attendance marking. |

---

## 🔗 Links

* **Live Demo**: [Vercel Deployment](https://employe-resource-management-erm.vercel.app/login)
* **GitHub Repository**: [Repository Link](https://github.com/Iroshpanday/Employe-Resource-management-ERM-/)
* **LinkedIn**: [Irosh Panday](https://www.linkedin.com/in/irosh-panday/)

---

## 🚀 Deployment

The application is automatically deployed to **Vercel** on a git push to the `main` branch. The database is hosted on **Azure SQL** with proper firewall configuration for secure access.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please check the issues page for details on how to get involved.

---

## 📄 License

This project is licensed under the **MIT License**.

Built with ❤️ by Irosh Panday

Connect with me on [LinkedIn](https://www.linkedin.com/in/irosh-panday/)
