# Doctor Tracker

A secure and responsive full-stack admin dashboard for managing doctors, patients, and healthcare records.

## 🌐 Live Demo

**Frontend:** https://doctor-tracker-jet.vercel.app/

**Backend API:** https://doctor-tracker-api-frg9.onrender.com/

**GitHub:** https://github.com/hadayethm/doctor-tracker

---

## 🔑 Demo Credentials

**Email:** `admin@example.com`
**Password:** `Admin123456`

## 📌 Overview

Doctor Tracker is a full-stack healthcare management application built with **Next.js, Node.js, Express.js, and MongoDB**.

The application provides an authenticated admin dashboard where administrators can manage doctors and patients, search and filter records, view doctor-specific patients, and monitor patient activity through dashboard analytics.

---

## ✨ Features

### Authentication

* Admin registration and login
* JWT-based authentication
* Protected frontend routes
* Protected backend APIs
* Secure password hashing with bcrypt
* Logout functionality

### Doctor Management

* Create new doctors
* View all doctors
* Search doctors
* Filter doctors by date
* Pagination
* View doctor details
* View patients associated with a doctor
* Update doctor information
* Delete doctors
* Automatic deletion of associated patients when a doctor is deleted

### Patient Management

* Add patients
* View all patients
* Edit patient information
* Delete patients
* Search patients
* Filter by medical condition
* Filter by doctor
* Filter by date
* Pagination
* View patients under individual doctors

### Dashboard

* Total doctors
* Total patients
* Patients per doctor
* Recent patient activity
* 7-day patient activity chart
* Responsive analytics interface

### UI & UX

* Responsive design
* Mobile, tablet and desktop support
* Clean dashboard interface
* Loading states
* Error handling
* Empty states
* Reusable UI patterns

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* Recharts

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Helmet
* CORS

### Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database

---

## 🏗️ Architecture

```text
┌──────────────────────┐
│      Next.js         │
│      Frontend        │
│      Vercel          │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│   Node.js + Express  │
│       Backend        │
│       Render         │
└──────────┬───────────┘
           │
           │ Mongoose
           ▼
┌──────────────────────┐
│     MongoDB Atlas    │
│       Database       │
└──────────────────────┘
```

---

## 📂 Project Structure

```text
doctor-tracker/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── doctors/
│   │   ├── patients/
│   │   └── page.tsx
│   │
│   ├── lib/
│   │   └── api.js
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Development

### Prerequisites

Make sure you have:

* Node.js
* npm
* MongoDB Atlas account
* Git

### 1. Clone Repository

```bash
git clone https://github.com/hadayethm/doctor-tracker.git

cd doctor-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 🔐 Authentication Flow

```text
User
 │
 ▼
Login / Register
 │
 ▼
Express Authentication API
 │
 ▼
Password Verification
 │
 ▼
JWT Token Generated
 │
 ▼
Frontend stores authentication token
 │
 ▼
Axios sends Bearer Token
 │
 ▼
Protected API Routes
```

---

## 🔗 API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Doctors

```text
GET    /api/doctors
GET    /api/doctors/:id
POST   /api/doctors
PUT    /api/doctors/:id
DELETE /api/doctors/:id
GET    /api/doctors/:id/patients
```

### Patients

```text
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

### Dashboard

```text
GET /api/dashboard
```

All protected endpoints require a valid JWT Bearer token.

---

## ⚡ Performance Considerations

* MongoDB indexes for frequently searched fields
* Server-side pagination
* Server-side search and filtering
* Efficient MongoDB queries
* Parallel dashboard queries using `Promise.all`
* Limited API response payloads
* Reusable frontend API client
* Responsive layouts
* Optimized production builds

---

## 🛡️ Security

* JWT authentication
* Password hashing using bcrypt
* Protected API routes
* Authentication middleware
* Helmet security headers
* CORS configuration
* Environment variables for sensitive configuration
* Request body size limitation
* `.env` files excluded from Git

---

## 📊 Dashboard Analytics

The dashboard provides:

* Total doctor count
* Total patient count
* Patient distribution by doctor
* Recent patient records
* Seven-day patient activity visualization

Charts are implemented using **Recharts**.

---

## 📱 Responsive Design

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

The main dashboard, doctor management, doctor details and patient management pages were tested across different screen sizes.

---

## 🚀 Deployment

### Frontend

The Next.js frontend is deployed on Vercel.

**Live:** https://doctor-tracker-jet.vercel.app/

### Backend

The Express.js backend is deployed on Render.

**Live:** https://doctor-tracker-api-frg9.onrender.com/

### Database

MongoDB Atlas is used as the production database.

---

## 🔮 Future Improvements

* Role-based access control
* Advanced analytics
* Export patient/doctor data
* Email notifications
* Appointment management
* Audit logs
* More advanced filtering
* Automated testing
* CI/CD pipeline

---

## 👨‍💻 Author

**Hedayet Ali**

Frontend / Full-stack  Developer

* GitHub: https://github.com/hadayethm
* LinkedIn: https://www.linkedin.com/in/hadayet-ali-31aab115b/

---

## 📄 License

This project was created as a full-stack development assignment and demonstration project.
