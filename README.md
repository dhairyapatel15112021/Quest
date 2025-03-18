# Quest - Video Challenge Platform

Quest is a video challenge platform that enables users to participate in video-based challenges, interact with content, and earn rewards. The platform features a TikTok-inspired interface with keyboard shortcuts and social interaction capabilities.

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

## Features
- User Authentication (Signup/Login)
- Role-based Authorization
- Video Feed with TikTok-like Interface
- Keyboard Shortcuts for Video Interaction
- Like and Share Functionality
- Challenge Progress Tracking
- Leaderboard System
- Challenge Participants System
- Reward System
- Admin Dashboard
- User Profile Management

## Keyboard Shortcuts for Video Feed
- **→**: Like/Unlike Video
- **←**: Share Video
- **↓**: Next Video
- **↑**: Previous Video

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
- For installation and setup instructions, please refer to the <a href="/docs/SETUP.md">SETUP.md</a> file.

## Database Schema
- For Database Schema, please refer to the <a href="/docs/DB_Diagram.png">DB</a> file.

## Application Architecture
- For Application Architecture, please refer to the <a href="/docs/Architecture_Diagram.png">Architecture</a> Diagram.

## Test Coverage Report
The Test Coverage Report is available at `http://127.0.0.1:5500/backend/coverage/lcov-report/backend/index.html` when the backend server is running.
