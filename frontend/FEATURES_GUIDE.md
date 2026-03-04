# 🎯 LoanGuard Frontend - Complete Feature Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Features Overview](#features-overview)
3. [Page Descriptions](#page-descriptions)
4. [User Workflows](#user-workflows)
5. [Data Flow](#data-flow)
6. [Testing](#testing)

---

## Getting Started

### Quick Start (5 minutes)
```powershell
cd frontend
npm install
npm run dev
```

### First Time Login
- Email: `test@example.com`
- Password: `password123`
- Or create a new account via Register page

---

## Features Overview

### 1. 🔐 Authentication System

#### Login Features
- ✅ Email & password validation
- ✅ Remember me option
- ✅ Forgot password link (placeholder)
- ✅ Sign up link
- ✅ Session persistence
- ✅ Loading states
- ✅ Error messages with toast

#### Register Features
- ✅ Full name, email, password
- ✅ Password confirmation matching
- ✅ Terms & conditions agreement
- ✅ Automatic login after registration
- ✅ Input validation
- ✅ Error feedback

#### Session Management
- ✅ User data stored in localStorage
- ✅ Session time tracking
- ✅ Auto-login on page refresh
- ✅ Logout clears session
- ✅ Protected routes (PrivateRoute)

---

### 2. 📊 Dashboard

#### Dashboard Features
- **Statistics Cards** (4 total)
  - Total Predictions (count)
  - Average Risk Score (%)
  - Approvals Today (count)
  - Risk Flags (count)

- **Recent Predictions List**
  - Latest 5 predictions displayed
  - Shows: Date, Risk Score, Status
  - Status badges: Approved/Risky/Review
  - Link to View All history

- **Quick Actions Sidebar**
  - New Prediction button
  - View History button
  - Pro tip card (info)

#### Data Source
- Loads from localStorage predictions array
- Calculates statistics from history
- Filters for recent entries

---

### 3. ⚡ Loan Prediction

#### Input Fields (11 total)

**Applicant Information**
- Number of Dependents (0-10)
- Education Level (Graduate/Not Graduate)
- Self Employed (Yes/No)
- Annual Income ($0-$10M)

**Loan Details**
- Loan Amount ($0-$10M)
- Loan Term (1-360 months)
- CIBIL Score (300-900)

**Asset Details**
- Residential Assets Value ($)
- Commercial Assets Value ($)
- Luxury Assets Value ($)
- Bank Asset Value ($)

#### Prediction Algorithm
```
Risk Score = 50 + (Loan/Income)*10 - (CIBIL/900)*20 - (Assets/Loan)*5
Capped between 20-100
```

#### Output
- **Risk Score**: 0-100%
- **Status**: Approved / Review / Risky
  - Approved: < 30%
  - Review: 30-70%
  - Risky: > 70%
- **Recommendation**: AI-generated text
- **Visual Indicator**: Progress bar

#### Data Saving
- Predictions stored in localStorage
- Includes: ID, Date, Risk Score, Status

---

### 4. 📋 Prediction History

#### Features
- **Search**: By ID, Date, or Risk Score
- **Filter**: By Status (All, Approved, Risky, Review)
- **Export**: CSV download of filtered results
- **Delete**: Remove individual predictions
- **Statistics**: 4-card stats overview

#### Table Display
| Column | Content |
|--------|---------|
| ID | Unique identifier |
| Date | Prediction date |
| Risk Score | % with progress bar |
| Status | Badge (colored) |
| Actions | Delete button |

#### Statistics Shown
- Total predictions count
- Approved count (green)
- Review count (yellow)
- Risky count (red)

---

### 5. 👤 Profile Settings

#### Account Information
- Display Full Name (read-only)
- Display Email (read-only)
- Edit Profile button (placeholder)

#### Security Section
- Change Password (placeholder)
- 2FA Status (placeholder)
- Security tips

#### Notifications
- 3 toggle options:
  - Prediction Alerts
  - High Risk Warnings
  - Weekly Summary

#### Account Status Card
- Shows account is "Active"
- Security indicator
- Tips for account security

#### Stats Section
- Total predictions count
- Account creation date
- Last activity (placeholder)

#### Logout
- Red button to logout
- Clears session
- Redirects to login

---

## Page Descriptions

### Login Page
```
┌────────────────────────────────┐
│    ⚡ LoanGuard Logo           │
│  Smart Loan Risk Prediction    │
│                                │
│  Welcome Back                  │
│  [Email Input] @  email        │
│  [Password Input] 🔒          │
│  ☐ Remember me  [Forgot?]    │
│  [Sign In Button] →            │
│                                │
│  ─── Don't have account? ───   │
│  [Create Account Button]       │
│                                │
│  Terms & Privacy Links         │
└────────────────────────────────┘
```

### Register Page
```
┌────────────────────────────────┐
│    ⚡ LoanGuard Logo           │
│    Join our platform today     │
│                                │
│  Create Account                │
│  [Name Input] 👤              │
│  [Email Input] @              │
│  [Password Input] 🔒          │
│  [Confirm Password] 🔒        │
│  ☐ I agree to Terms & Privacy │
│  [Create Account Button]       │
│                                │
│  ─── Already have account? ─── │
│  [Sign In Button]              │
│                                │
│  Contact support               │
└────────────────────────────────┘
```

### Dashboard Page
```
┌─────────────────────────────────────┐
│ Navigation Bar (Sticky)             │
├─────────────────────────────────────┤
│ Welcome back! Here's overview       │
│                                     │
│ [Stat1]  [Stat2]  [Stat3]  [Stat4] │
│                                     │
│ Recent Predictions    | Quick       │
│ ───────────────────  | Actions:    │
│ Date   Risk  Status  | [New Pred]  │
│ [pred] [%]   [badge] | [History]   │
│ [pred] [%]   [badge] | Pro Tip ✨  │
│ [pred] [%]   [badge] |             │
│ View All →                          │
└─────────────────────────────────────┘
```

### Prediction Page
```
┌─────────────────────────────────────┐
│ Navigation Bar (Sticky)             │
├─────────────────────────────────────┤
│ Enter Loan Application Details      │
│                                     │
│ [Form Sections]    | [Result Card] │
│ Applicant Info:    | Status: ✓     │
│ ☐ Dependents      | Risk: 45%      │
│ ☐ Education       | Progress bar   │
│ ☐ Self Employed   |                │
│ ☐ Income          | Recommend:     │
│                   | "Strong profile│
│ Loan Details:     |  approved"     │
│ ☐ Loan Amount     |                │
│ ☐ Loan Term       |                │
│ ☐ CIBIL Score     |                │
│                   |                │
│ Asset Details:    |                │
│ ☐ Residential     |                │
│ ☐ Commercial      |                │
│ ☐ Luxury          |                │
│ ☐ Bank Assets     |                │
│                   |                │
│ [Get Prediction]                   │
└─────────────────────────────────────┘
```

### History Page
```
┌─────────────────────────────────────┐
│ Navigation Bar (Sticky)             │
├─────────────────────────────────────┤
│ Prediction History                  │
│                                     │
│ [Search Input] [Filter] [Export]   │
│                                     │
│ [Stat Cards: Total, Approved, etc]  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ID  Date  Risk Score  Status  ✕ │ │
│ │ ─────────────────────────────── │ │
│ │ 123 1/15  ▓▓░░░░░░░░ 25% ✓    │ │
│ │ 124 1/14  ▓▓▓░░░░░░░ 45% ◐    │ │
│ │ 125 1/13  ▓▓▓▓▓░░░░░ 75% ✗    │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Profile Page
```
┌─────────────────────────────────────┐
│ Navigation Bar (Sticky)             │
├─────────────────────────────────────┤
│ Profile Settings                    │
│                                     │
│ Account Info    | Account Status    │
│ [Name Input]    | ✓ Active Account  │
│ [Email Input]   |                   │
│ [Edit Button]   | Your Stats:       │
│                 | Predictions: 42   │
│ Security        | Created: Today    │
│ [Change Pwd]    |                   │
│ [2FA Toggle]    | [Logout]          │
│                 |                   │
│ Notifications   |                   │
│ ☑ Alerts        |                   │
│ ☑ Warnings      |                   │
│ ☑ Weekly        |                   │
└─────────────────────────────────────┘
```

---

## User Workflows

### Workflow 1: First Time User
```
1. Load app → Redirected to /login
2. Click "Create Account"
3. Fill register form
4. Accept terms & register
5. Auto-login to dashboard
6. View tutorial/dashboard
7. Click "New Prediction"
8. Fill form & submit
9. View result
10. Check history
```

### Workflow 2: Make a Prediction
```
1. Login (if not already)
2. Dashboard displayed
3. Click "New Prediction" or go to /predict
4. Fill form:
   - 4 applicant fields
   - 3 loan fields
   - 4 asset fields
5. Click "Get Prediction"
6. Loading state (1.5s)
7. Result appears in card:
   - Risk score %
   - Status badge
   - Recommendation
8. Can view history or make another
```

### Workflow 3: Review History
```
1. Navigate to /history
2. View all predictions in table
3. Search by ID/date/risk
4. Filter by status
5. Export to CSV
6. Delete individual records
7. View statistics
```

### Workflow 4: Manage Profile
```
1. Click profile name in navbar
2. Go to /profile
3. View account info
4. Manage notifications
5. Access security settings
6. Logout
```

---

## Data Flow

### Authentication Flow
```
User Input
    ↓
LoginPage / RegisterPage
    ↓
AuthContext (login/register functions)
    ↓
localStorage.setItem('user', userData)
    ↓
Navigate to /dashboard
    ↓
PrivateRoute checks isAuthenticated
    ↓
Dashboard loads user data
```

### Prediction Flow
```
Form Input (11 fields)
    ↓
handleSubmit()
    ↓
Validation
    ↓
Calculate Risk Score (algorithm)
    ↓
Generate Status & Recommendation
    ↓
Set Result State
    ↓
Display Result Card
    ↓
Save to localStorage.predictions
```

### History Data Flow
```
localStorage.predictions array
    ↓
HistoryPage useEffect()
    ↓
Parse & load predictions
    ↓
User applies search/filter
    ↓
Filter array
    ↓
Render table
    ↓
CSV export or delete operations
```

---

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error)
- [ ] Register new account
- [ ] Password validation works
- [ ] Remember me functions
- [ ] Logout works
- [ ] Session persists on refresh

#### Dashboard
- [ ] Statistics load correctly
- [ ] Recent predictions show
- [ ] Quick action buttons work
- [ ] Links navigate correctly
- [ ] Empty state shows (no predictions)

#### Prediction
- [ ] All 11 inputs validate
- [ ] Form submission works
- [ ] Loading state displays
- [ ] Result card appears
- [ ] Data saves to history
- [ ] Risk score calculates
- [ ] Status badge correct
- [ ] Recommendation generates

#### History
- [ ] Table displays all predictions
- [ ] Search filters correctly
- [ ] Status filter works
- [ ] CSV export works
- [ ] Delete removes items
- [ ] Statistics update
- [ ] Responsive table

#### Profile
- [ ] User info displays
- [ ] Toggle switches work
- [ ] Logout works
- [ ] Stats accurate

#### Responsive
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640-1024px)
- [ ] Desktop view (> 1024px)
- [ ] Mobile menu works
- [ ] Forms stack properly
- [ ] Buttons clickable
- [ ] Readability good

---

## Performance Tips

### Optimization
- Use React.memo for heavy components
- Lazy load route components
- Debounce search input
- Cache prediction results
- Optimize images/icons

### Monitoring
- Check bundle size
- Monitor localStorage usage
- Track API response times
- Use Lighthouse audit

---

## Known Limitations & TODOs

### Current (Development)
- [ ] No actual backend API
- [ ] Mock authentication
- [ ] LocalStorage only (not persistent across browsers)
- [ ] No JWT tokens
- [ ] No real predictions

### Next Phase
- [ ] Backend API integration
- [ ] Real JWT authentication
- [ ] Database persistence
- [ ] Real ML predictions
- [ ] Email verification
- [ ] Password reset
- [ ] 2FA implementation
- [ ] Advanced analytics
- [ ] Export to PDF
- [ ] Print predictions

---

## Support & Resources

### Documentation Files
- `README.md` - Project overview
- `SETUP.md` - Installation & setup
- `DESIGN_SYSTEM.md` - UI/UX guide
- This file - Feature guide

### Key Files
- `src/App.tsx` - Main routing
- `src/context/AuthContext.tsx` - Auth logic
- `src/pages/PredictionPage.tsx` - Prediction logic
- `src/components/Navbar.tsx` - Navigation

### External Links
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)

---

## FAQ

**Q: How do I change the API endpoint?**
A: Update `VITE_API_BASE_URL` in `.env` file and replace mock API calls with axios requests.

**Q: How do I add more input fields to the prediction form?**
A: Add to `LoanApplication` interface and add input field in form section.

**Q: How do I customize colors?**
A: Edit `tailwind.config.js` in the colors section.

**Q: How do I add new pages?**
A: Create `.tsx` file in `src/pages/`, add route in `App.tsx`, add nav link in `Navbar.tsx`.

**Q: How do I deploy?**
A: Run `npm run build`, then deploy the `dist/` folder to hosting provider.

---

**Happy coding! Build amazing things! 🚀✨**
