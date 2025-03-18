# Quest - Video Challenge Platform

## Tech Stack
- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Styling**: Tailwind CSS
- **State Management**: Recoil
- **Data Validation**: Zod
- **Icons**: React Icons / Heroicons
- **UI Components**: DaisyUI

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Project Structure
```
Quest/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Recoil state management
│   │   ├── hooks/        # Custom React hooks
│   │   ├── assets/       # Application assets (images,videos) 
│   │   └── data/         # Static data and constants
│   └── package.json
│
├── backend/           # Node.js backend application
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── db/    
│   │   │   │── models/    #Database Models    
│   │   │   │── Connection.js    #Database connection logic   
│   │   ├── route/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   ├── validation/   # Zod Validation Schema
│   │   ├── service/      # Helper Functions
│   │   └── config/       # Configuration files
│   └── package.json
│
└── docs/             # Project documentation
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend/src directory with the following variables:
   ```
   PORT=5050
   MONGODB_URI=your_mongodb_connection_string
   JWT_KEY=your_jwt_secret
   ROLES=ADMIN,USER
   ADMIN_EMAIL = set_up_admin_email
   ADMIN_PASSWORD = set_up_admin_password (example : Admin@1234)
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
5. **Run Tests**:
   ```bash
   npm test
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend/src directory with the following variables:
   ```
   VITE_ROLES=ADMIN,USER
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## API Documentation
The API documentation is available at `http://localhost:5050/api-docs` when the backend server is running. 

## Test Coverage Report
The Test Coverage Report is available at `http://127.0.0.1:5500/backend/coverage/lcov-report/backend/index.html` when the backend server is running.