# HealthTrack - Hospital Management System

A comprehensive hospital management system built with React, Firebase, and Material-UI.

## Features

- **Authentication**: Secure login/register with role-based access (Doctor/Patient)
- **Doctor/Patient Management**: Complete CRUD operations for managing doctor and patient data
- **Data Visualization**: Interactive charts for patient health data
- **Real-time Chat**: Live messaging between doctors and patients
- **Clean Architecture**: Reusable, maintainable components

## Tech Stack

- **React 18** - UI Framework
- **Firebase** - Backend (Authentication, Firestore, Realtime Database)
- **Material-UI (MUI)** - UI Component Library
- **Recharts** - Data Visualization
- **React Router** - Navigation
- **Vite** - Build Tool

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Create Realtime Database
   - Copy your Firebase config to `.env` file

3. Create `.env` file in the root directory with the following variables:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
```

   You can find these values in your Firebase Console under Project Settings > General > Your apps.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Common components (Layout, Navigation, etc.)
│   ├── forms/       # Form components
│   └── charts/      # Chart components
├── pages/           # Page components
├── services/         # Firebase services
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── context/         # React Context providers
└── App.jsx          # Main App component
```

## Features Overview

### Authentication
- User registration and login
- Role-based access control (Doctor/Patient)
- Protected routes

### Doctor/Patient Management
- Add, edit, delete doctors and patients
- View detailed information
- Search and filter functionality

### Data Visualization
- Patient health metrics charts
- Historical data tracking
- Interactive visualizations

### Real-time Chat
- Instant messaging
- Doctor-patient communication
- Message history

## License

MIT

