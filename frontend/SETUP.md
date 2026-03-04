# LoanGuard Frontend - INSTALLATION & SETUP GUIDE

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn installed
- Backend server running on `http://localhost:8000`

### Installation Steps

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example -Destination .env

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

---

## 📦 Available Scripts

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module reloading.

### Build
```bash
npm run build
```
Creates an optimized production build.

### Preview
```bash
npm run preview
```
Preview the production build locally.

### Type Check
```bash
npm run type-check
```
Run TypeScript type checking.

### Linting
```bash
npm run lint
```
Check code for linting errors.

---

## 🎨 Features

### ✨ Dark Theme UI
- Beautiful dark gradient backgrounds
- Smooth animations and transitions
- Custom Tailwind CSS configuration
- Glass morphism effects
- Responsive design (mobile-first)

### 🔐 Authentication
- **Login Page**: Email + Password
- **Register Page**: Full registration with validation
- **Session Management**: LocalStorage persistence
- **Private Routes**: Protected pages

### 📊 Dashboard
- Overview statistics (Total predictions, risk scores, etc.)
- Recent predictions list
- Quick action buttons
- Pro tips section

### ⚡ Loan Prediction
- Comprehensive form with all loan details
- Real-time validation
- Mock ML predictions with risk scoring
- Recommendation system
- Instant results display

### 📋 Prediction History
- Search functionality
- Filter by status (Approved/Risky/Review)
- CSV export capability
- Delete records
- Statistics dashboard

### 👤 Profile Settings
- Account information display
- Security settings section
- Notification preferences
- Logout functionality

---

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx          # Login form
│   │   ├── RegisterPage.tsx       # Registration form
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── PredictionPage.tsx     # Prediction form
│   │   ├── HistoryPage.tsx        # Predictions history
│   │   └── ProfilePage.tsx        # Profile settings
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation bar
│   │   ├── PrivateRoute.tsx       # Route protection
│   │   └── LoadingSpinner.tsx     # Loading indicator
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication state
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
└── .env.example                   # Environment variables template
```

---

## 🔌 API Integration

### Current Status
- **Authentication**: Mock implementation using localStorage
- **Predictions**: Mock ML model simulation
- **Data Storage**: LocalStorage (for development)

### To Connect with Backend

1. **Update API endpoints** in components:
```typescript
// Example in LoginPage.tsx
const response = await axios.post('/api/auth/login', {
  email,
  password,
})
```

2. **Configure API base URL** in `.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

3. **Replace mock functions**:
- `AuthContext.tsx`: `login()` and `register()` functions
- `PredictionPage.tsx`: `handleSubmit()` function
- `HistoryPage.tsx`: Data fetching logic

4. **Add error handling**:
```typescript
try {
  // API call
} catch (error) {
  toast.error('API Error: ' + error.message)
}
```

---

## 🎯 Key Features Explained

### Login/Register
- Email validation
- Password strength checking
- Confirm password matching
- Terms & conditions checkbox
- Remember me option (login only)

### Dashboard
- Statistics cards with icons
- Recent predictions list
- Quick action links
- Pro tip section

### Prediction Form
- 11 input fields for loan details
- Real-time validation
- Visual result with status badge
- Risk score with progress bar
- AI recommendation text

### History Page
- Search by ID or date
- Filter by status
- CSV export
- Delete functionality
- Statistics overview

### Profile Settings
- Display user information
- Security settings (placeholder)
- Notification preferences
- Account status
- Logout button

---

## 🎨 Tailwind CSS Customization

### Custom Colors
```javascript
// In tailwind.config.js
colors: {
  primary: { 500: '#0ea5e9', ... },  // Cyan blue
  dark: { 900: '#0f172a', ... },     // Dark navy
  success: { 500: '#22c55e', ... },  // Green
  warning: { 500: '#eab308', ... },  // Yellow
  danger: { 500: '#ef4444', ... },   // Red
}
```

### Custom Classes
```css
/* In index.css */
.btn-primary { /* Primary button */ }
.input { /* Input styling */ }
.card { /* Card styling */ }
.glass { /* Glass morphism */ }
.gradient-text { /* Gradient text */ }
```

---

## 📱 Responsive Design

- **Mobile**: Full-width, stacked layout
- **Tablet**: 2-column grids
- **Desktop**: 3-4 column grids, sidebar layouts
- **Navigation**: Mobile hamburger menu, desktop navbar

---

## 🔒 Security Notes

### Current Implementation
- Session stored in localStorage
- Client-side validation only
- No actual password hashing

### For Production
- ✅ Use HTTP-only cookies for sessions
- ✅ Implement JWT tokens with secure storage
- ✅ Server-side validation
- ✅ Password hashing (bcrypt)
- ✅ HTTPS only
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Input sanitization

---

## 🐛 Troubleshooting

### Port already in use
```powershell
# Change port in vite.config.ts
server: {
  port: 3001
}
```

### Module not found errors
```bash
npm install  # Reinstall dependencies
```

### TypeScript errors
```bash
npm run type-check  # Check all errors
```

### Styling not working
```bash
npm install -D tailwindcss postcss autoprefixer
npm run build:css
```

---

## 📚 Technologies

| Technology | Purpose |
|-----------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Axios | HTTP Client |
| Lucide React | Icons |
| React Hot Toast | Notifications |

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Push to GitHub, auto-deploy
- **Netlify**: Connect Git repo
- **Docker**: Use Dockerfile in root
- **Azure**: App Service deployment
- **AWS**: S3 + CloudFront

### Environment Variables
Update `.env` before building for production with actual API URLs.

---

## 💡 Tips & Tricks

1. **Hot Reload**: Changes auto-reflect without refresh
2. **DevTools**: React Developer Tools extension
3. **TypeScript**: Better IDE support and error catching
4. **Debugging**: Use browser DevTools and VS Code debugger
5. **Performance**: Build is optimized with code splitting

---

## 📞 Support

For issues or questions:
1. Check the README.md in frontend folder
2. Review component comments
3. Check TypeScript error messages
4. Test with mock data first

---

## 🎓 Next Steps

1. ✅ Install and run the frontend
2. ✅ Explore the UI and features
3. ✅ Connect backend API endpoints
4. ✅ Add JWT authentication
5. ✅ Deploy to production

Enjoy your beautiful loan risk prediction platform! 🎉
