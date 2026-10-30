# Doctor Tracker

A secure, admin-only Doctor and Patient Management System built to simplify healthcare record management.

## Features

### Authentication
- Secure admin login and logout
- JWT-based authentication using HTTP-only cookies
- Protected admin routes

### Doctor Management
- Create, view, update, and delete doctors
- Search doctors
- Date filtering and pagination
- View patients assigned to each doctor

### Patient Management
- Create, view, update, and delete patients
- Search patients
- Filter by medical condition and date
- Filter patients by doctor
- Pagination

### Dashboard
- Total doctors and patients
- Patients per doctor
- Patient registration trends over the last 7 days
- Patients by medical condition

## Technology Stack

**Frontend**
- Next.js
- React
- Tailwind CSS
- Redux Toolkit
- Axios
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```text
doctor-tracker/
├── doctor-tracker-client/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── doctor-tracker-server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── validators/
│   └── package.json
│
└── README.md
```

## Installation and Setup

### 1. Clone the repositories

Clone the frontend and backend repositories into the same project folder.

### 2. Backend Setup

```bash
cd doctor-tracker-server
npm install
```

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd doctor-tracker-client
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Architecture and Data Flow

The application follows a client-server architecture.

1. The Next.js frontend sends HTTP requests using Axios.
2. Express.js receives API requests and validates authentication.
3. Controllers handle application logic.
4. Mongoose communicates with MongoDB.
5. The backend returns JSON responses.
6. The frontend displays the updated information.

### System Architecture

```mermaid
flowchart TD
    A[Admin] --> B[Next.js Frontend]
    B --> C[Axios HTTP Requests]
    C --> D[Express.js REST API]
    D --> E[Authentication Middleware]
    E --> F[Controllers]
    F --> G[Mongoose]
    G --> H[(MongoDB)]

    H --> G
    G --> F
    F --> D
    D --> B
    B --> A

## Technical Decisions

1. **HTTP-only JWT cookies:** Authentication tokens are stored in HTTP-only cookies to reduce exposure to client-side JavaScript.
2. **Separate frontend and backend:** Keeping Next.js and Express.js separate makes the application easier to maintain, test, and deploy independently.

## Screenshots

Screenshots will be added here.

## Live Demo

- Frontend: Coming soon
- Backend API: Coming soon

## Author

Md. Ferdous Ahmed

Junior Web Developer
