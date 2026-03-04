# Frontend Setup Guide

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build

```bash
npm run build
```

## Features

✨ **Beautiful Dark Theme**
- Modern gradient-based design
- Smooth animations and transitions
- Responsive layout (mobile-first)

🔐 **Authentication**
- Login page with email validation
- Registration with password confirmation
- Persistent session storage

📊 **Dashboard**
- Overview of all predictions
- Quick statistics
- Recent predictions list

⚡ **Loan Prediction**
- Comprehensive form for loan details
- Real-time risk assessment
- Instant results with recommendations

📋 **History**
- View all past predictions
- Search and filter functionality
- Export to CSV
- Delete predictions

👤 **Profile**
- Account settings
- Security options
- Notification preferences

## Project Structure

```
src/
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── Dashboard.tsx
│   ├── PredictionPage.tsx
│   ├── HistoryPage.tsx
│   └── ProfilePage.tsx
├── components/         # Reusable components
│   ├── Navbar.tsx
│   ├── PrivateRoute.tsx
│   └── LoadingSpinner.tsx
├── context/           # React context
│   └── AuthContext.tsx
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## API Integration

To connect with the backend:

1. Update the API base URL in components
2. Replace mock authentication with actual API calls
3. Connect prediction API endpoints
4. Set up proper error handling

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
