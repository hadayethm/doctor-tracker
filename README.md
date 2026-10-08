# Doctor Tracker

A secure and responsive full-stack web application for managing doctors and their patients. The system provides authenticated access, doctor management, patient management, dashboard analytics, search, filtering, pagination, and data visualization.

## 🚀 Features

### Authentication
- Admin registration and login
- JWT-based authentication
- Protected API routes
- Protected dashboard pages
- Logout functionality

### Doctor Management
- Create new doctors
- View doctor list
- Search doctors
- Pagination
- Edit doctor information
- Delete doctors
- View doctor details
- View patients assigned to a doctor

### Patient Management
- Add patients under a doctor
- View all patients
- Search patients
- Filter by condition
- Filter by date
- Pagination
- Edit patient information
- Delete patients
- View patients from individual doctor pages

### Dashboard
- Total doctors
- Total patients
- Average patients per doctor
- Patients per doctor
- Recent patients
- 7-day patient activity chart
- Responsive dashboard UI

### UI / UX
- Responsive design
- Mobile, tablet and desktop support
- Clean dashboard layout
- Responsive tables
- Modal-based forms
- Loading and error states
- Empty states
- Responsive navigation

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Helmet
- CORS

---

## 🏗️ System Architecture

```text
┌──────────────────────┐
│      Next.js         │
│      Frontend        │
│                      │
│ React + Tailwind     │
│ Axios + Recharts     │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│    Express.js API    │
│                      │
│ Authentication       │
│ Controllers          │
│ Middleware           │
│ Validation           │
└──────────┬───────────┘
           │
           │ Mongoose
           ▼
┌──────────────────────┐
│       MongoDB        │
│                      │
│ Users                │
│ Doctors              │
│ Patients             │
└──────────────────────┘

doctor-tracker/
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── doctors/
│   │   │   └── [id]/
│   │   ├── patients/
│   │   └── page.tsx
│   │
│   ├── lib/
│   │   └── api.js
│   │
│   ├── public/
│   ├── .env.local
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md

⚙️ Installation & Setup
1. Clone the repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd doctor-tracker
2. Backend setup
cd backend
npm install

Create a .env file inside the backend folder:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000

Start the backend:

npm run dev

Backend will run on:

http://localhost:5000
3. Frontend setup

Open another terminal:

cd frontend
npm install

Create .env.local:

NEXT_PUBLIC_API_URL=http://localhost:5000/api

Start the frontend:

npm run dev

Frontend will run on:

http://localhost:3000
🔐 Authentication Flow

The application uses JWT-based authentication.

User
  │
  ▼
Login
  │
  ▼
Express Authentication API
  │
  ▼
JWT Token
  │
  ▼
Frontend
  │
  ▼
Protected API Requests
  │
  ▼
Auth Middleware
  │
  ▼
Controller

Protected API endpoints require a valid Bearer token.

🔌 API Overview
Authentication
POST /api/auth/register
POST /api/auth/login
Doctors
GET    /api/doctors
POST   /api/doctors
GET    /api/doctors/:id
PUT    /api/doctors/:id
DELETE /api/doctors/:id

GET    /api/doctors/:id/patients
Patients
GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PUT    /api/patients/:id
DELETE /api/patients/:id
Dashboard
GET /api/dashboard
⚡ Performance & Optimization

The application includes several performance-focused implementations:

MongoDB indexes for frequently searched fields
Pagination for doctor and patient lists
Search and filter queries handled on the backend
Efficient MongoDB aggregation for dashboard statistics
Parallel dashboard queries using Promise.all
Limited API response payloads
Responsive and reusable frontend components
Avoidance of unnecessary data fetching
🔒 Security

Security-related implementations include:

JWT authentication
Protected API routes
Password hashing using bcryptjs
Helmet security middleware
CORS configuration
Request body size limit
Environment variables for sensitive configuration
.env files excluded from Git
🧠 Technical Decisions
1. Separate Frontend and Backend

The project uses Next.js and Express as separate applications.

This keeps the frontend and backend independently maintainable and allows the REST API to be reused by other clients in the future.

2. MongoDB Indexing + Server-side Pagination

Search, filtering and pagination are handled on the backend instead of loading the complete dataset into the browser.

MongoDB indexes are also used for frequently queried fields to improve query performance as the dataset grows.

📊 Dashboard Analytics

The dashboard provides:

Total doctor count
Total patient count
Average patients per doctor
Patients grouped by doctor
Recent patients
Patient activity over the last 7 days

The dashboard statistics are generated from MongoDB queries and aggregation pipelines.

📱 Responsive Design

The application has been tested across:

Desktop
Tablet
Mobile

Responsive behavior includes:

Mobile navigation
Responsive tables
Responsive dashboard cards
Responsive forms and modals
Mobile-friendly filters
Responsive charts
🖼️ Screenshots

Add project screenshots here before final submission.

Login
Add login screenshot here
Dashboard
Add dashboard screenshot here
Doctors
Add doctors screenshot here
Doctor Details
Add doctor details screenshot here
Patients
Add patients screenshot here
🔮 Future Improvements

Possible future improvements include:

HttpOnly cookie-based authentication
Role-based access control
Advanced reporting
Export patients/doctors to CSV or PDF
More detailed dashboard analytics
Server-side caching
Automated testing
Production deployment with CI/CD
👨‍💻 Author

Hedayet Ali

Frontend / Web Developer

GitHub: https://github.com/hadayethm
LinkedIn: https://www.linkedin.com/in/hadayet-ali-31aab115b/