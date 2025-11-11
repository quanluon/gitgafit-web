# GigaFit Frontend

> AI-Powered Fitness & Nutrition Management System - Progressive Web App

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat)](https://web.dev/progressive-web-apps/)

## 🚀 Features

### 💪 Workout Management
- **AI-Generated Plans** - Personalized workout plans from GPT-4o-mini
- **Weekly Calendar** - Visual workout scheduler
- **Exercise Preview** - Detailed exercise information with videos
- **Any-Day Training** - Start training on any scheduled day (not just today)
- **Workout Details Modal** - Preview exercises before starting

### 🏋️ Training Sessions
- **Active Session Detection** - Smart session management
- **Exercise Logging** - Log sets, reps, and weight for each exercise
- **Auto-Complete Past Sessions** - Automatically completes old sessions
- **Session Blocking** - Prevents multiple concurrent sessions
- **Progress Tracking** - Real-time exercise progress

### 🍽️ Meal Planning (NEW)
- **AI Meal Generation** - 🤖 GPT-powered personalized meal plans
- **Template Meals** - 📋 Pre-built meal templates
- **Full Week or Training Days** - Flexible planning options
- **TDEE Calculator** - Automatic calorie calculations
- **Macro Breakdown** - Protein, carbs, fat tracking
- **Bilingual Recipes** - All meals in English & Vietnamese

### 🌍 Multi-Language Support
- **English & Vietnamese** - Complete bilingual UI
- **170+ Translations** - All text translated
- **Dynamic Switching** - Change language anytime
- **Locale-Aware** - Date, number formatting

### 📊 Analytics & Progress
- **Weight Tracking** - Interactive charts with trends
- **Weight History** - 90-day weight visualization
- **Achievement System** - Earn awards for milestones
- **Progress Stats** - Comprehensive analytics

### 📱 Progressive Web App
- **Offline Support** - Works without internet
- **Install to Home Screen** - Native app experience
- **Push Notifications Ready** - Stay motivated
- **Fast & Responsive** - Optimized performance

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Features Guide](#-features-guide)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## 🛠 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.x |
| **TypeScript** | Type Safety | 5.x |
| **Vite** | Build Tool | 5.x |
| **TailwindCSS** | Styling | 3.x |
| **Shadcn UI** | Component Library | Latest |
| **Zustand** | State Management | 4.x |
| **React Router** | Navigation | 6.x |
| **React Hook Form** | Form Management | 7.x |
| **i18next** | Internationalization | 23.x |
| **Recharts** | Data Visualization | 2.x |
| **Lucide React** | Icons | Latest |
| **Axios** | HTTP Client | 1.x |
| **Vite PWA** | PWA Support | Latest |

---

## 🏗 Architecture

### Atomic Design Pattern

```
components/
├── atoms/           # Basic building blocks
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Label.tsx
│   └── Select.tsx
├── molecules/       # Simple combinations
│   ├── FormField.tsx
│   ├── DaySelector.tsx
│   ├── StatCard.tsx
│   └── MacrosCard.tsx
├── organisms/       # Complex components
│   ├── WorkoutCard.tsx
│   ├── WeightChart.tsx
│   ├── BottomNavigation.tsx
│   ├── WorkoutDetailsModal.tsx
│   ├── UpdateWeightModal.tsx
│   └── ExerciseLogModal.tsx
├── templates/       # Page layouts
│   └── MainLayout.tsx
└── pages/           # Full pages
    ├── HomePage.tsx
    ├── PlannerPage.tsx
    ├── TrainingPage.tsx
    ├── MealPlannerPage.tsx
    ├── ProfilePage.tsx
    └── StatisticsPage.tsx
```

### State Management (Zustand)

```typescript
// authStore.ts - User authentication
interface AuthState {
  user: User | null;
  token: string | null;
  login: (email, password) => Promise<void>;
  logout: () => void;
}

// workoutStore.ts - Workout plans
interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  todaysWorkout: WorkoutDay | null;
}

// trainingStore.ts - Active sessions
interface TrainingState {
  currentSession: TrainingSession | null;
}

// localeStore.ts - Language preference
interface LocaleState {
  language: 'en' | 'vi';
  setLanguage: (lang) => void;
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd giga-fit/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your backend API URL
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔧 Environment Variables

Create a `.env` file in the frontend root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3333/api

# Optional: Analytics
VITE_GA_TRACKING_ID=

# Optional: Sentry
VITE_SENTRY_DSN=
```

### Environment Files
- `.env` - Development (default)
- `.env.production` - Production build
- `.env.example` - Template (included in repo)

See `ENV_SETUP.md` for detailed configuration.

---

## 📁 Project Structure

```
frontend/
├── public/               # Static assets
│   ├── icons/           # PWA icons
│   └── manifest.json    # PWA manifest
├── src/
│   ├── components/      # UI components (Atomic Design)
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   ├── templates/
│   │   └── pages/       # Symlink to pages/
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   ├── PlannerPage.tsx
│   │   ├── TrainingPage.tsx
│   │   ├── MealPlannerPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── StatisticsPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── WorkoutPreviewPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── services/        # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── workoutService.ts
│   │   ├── trainingService.ts
│   │   ├── mealService.ts
│   │   └── analyticsService.ts
│   ├── store/           # Zustand stores
│   │   ├── authStore.ts
│   │   ├── workoutStore.ts
│   │   ├── trainingStore.ts
│   │   └── localeStore.ts
│   ├── types/           # TypeScript types
│   │   ├── enums.ts
│   │   ├── common.ts
│   │   ├── user.ts
│   │   ├── workout.ts
│   │   ├── meal.ts
│   │   └── analytics.ts
│   ├── i18n/            # Internationalization
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── vi.json
│   ├── utils/           # Utility functions
│   │   └── cn.ts
│   ├── App.tsx          # Main app component
│   ├── App.css          # Global styles
│   ├── main.tsx         # Entry point
│   └── vite-env.d.ts    # Vite types
├── .env.example         # Environment template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

---

## 🔨 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run coverage         # Generate coverage report

# Linting
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
```

### Hot Module Replacement (HMR)
Vite provides instant updates without losing state:
- Save a file → See changes immediately
- TypeScript errors in terminal
- Fast refresh for React components

### Path Aliases
```typescript
import { Button } from '@atoms/Button';
import { useAuthStore } from '@store/authStore';
import { User } from '@/types/user';
```

Configured aliases:
- `@/` → `src/`
- `@atoms/` → `src/components/atoms/`
- `@molecules/` → `src/components/molecules/`
- `@organisms/` → `src/components/organisms/`
- `@templates/` → `src/components/templates/`
- `@pages/` → `src/pages/`
- `@services/` → `src/services/`
- `@store/` → `src/store/`
- `@utils/` → `src/utils/`

---

## 📱 Features Guide

### 1. User Flow

```
Registration → Onboarding → Home
                    ↓
            Create Profile
            (Goals, Stats)
                    ↓
           Generate Plan
                    ↓
         Preview & Accept
                    ↓
              Home Page
```

### 2. Training Flow

```
Home/Planner → Select Day → Start Training → Log Exercises → Complete
                                                                  ↓
                                                         Track Progress
```

### 3. Active Session Management

**Problem:** User starts training on Monday, app crashed, returns Wednesday.

**Solution:**
- Backend auto-completes Monday session
- User can start new Wednesday session
- Clear visual feedback about active sessions
- Prevents multiple concurrent sessions

### 4. Meal Planning Flow

```
Profile → Set Age/Gender/Activity → Meal Planner
                                          ↓
                                   Choose Option:
                            🤖 AI Full Week
                            📋 Template Full Week
                            🤖 AI Training Days
                            📋 Template Training Days
                                          ↓
                                    View Plan
                                          ↓
                                   Regenerate?
```

### 5. Multi-Language Support

**Switching Languages:**
1. Click language toggle (EN/VI)
2. All text updates instantly
3. Preference saved in localStorage
4. Persists across sessions

**Translation Coverage:**
- ✅ All UI labels
- ✅ Error messages
- ✅ Form labels
- ✅ Button text
- ✅ Navigation
- ✅ Meal types
- ✅ Day names
- ✅ Profile fields

---

## 🎨 Styling

### TailwindCSS + Shadcn UI

**Theme Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
        accent: {...},
      },
    },
  },
};
```

**Dark Mode:**
- Automatic system preference detection
- Manual toggle (ready to implement)
- CSS variables for theming

**Responsive Design:**
```tsx
// Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Title
  </h1>
</div>
```

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test
```

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@atoms/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Component Testing
```bash
npm run test:ui
```

### Coverage Report
```bash
npm run coverage
```

---

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

Output: `dist/` directory

### Preview Production Build
```bash
npm run preview
```

### Build Optimization
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Asset optimization
- ✅ Lazy loading
- ✅ PWA caching

### Deployment Options

**1. Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

**2. Netlify**
```bash
npm run build
# Deploy dist/ folder
```

**3. GitHub Pages**
```bash
# Set base in vite.config.ts
base: '/repo-name/'
npm run build
```

**4. Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-p", "3000"]
```

### Environment Checklist
- [ ] Set production API URL
- [ ] Configure CORS on backend
- [ ] Enable HTTPS
- [ ] Set up CDN (optional)
- [ ] Configure PWA icons
- [ ] Test offline functionality
- [ ] Verify translations
- [ ] Check responsive design

---

## 📱 Progressive Web App

### PWA Features
- ✅ Service Worker
- ✅ Offline Support
- ✅ Install Prompt
- ✅ App Icon
- ✅ Splash Screen
- ✅ Theme Color

### Installation
Users can install GigaFit to their home screen:
1. Open in Chrome/Edge/Safari
2. Tap "Add to Home Screen"
3. Launch like a native app

### Offline Capabilities
- Cache static assets
- IndexedDB for data
- Queue API calls when offline
- Sync when back online

---

## 🌐 Internationalization

### Supported Languages
- 🇬🇧 English (en)
- 🇻🇳 Vietnamese (vi)

### Adding Translations

1. **Add to translation files:**
```json
// en.json
{
  "feature": {
    "newKey": "English text"
  }
}

// vi.json
{
  "feature": {
    "newKey": "Vietnamese text"
  }
}
```

2. **Use in components:**
```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <div>{t('feature.newKey')}</div>;
}
```

### Translation Structure
```
i18n/
└── locales/
    ├── en.json (170+ keys)
    │   ├── common
    │   ├── auth
    │   ├── profile
    │   ├── workout
    │   ├── training
    │   ├── meal
    │   ├── navigation
    │   ├── home
    │   ├── weight
    │   ├── days
    │   └── errors
    └── vi.json (170+ keys, parallel structure)
```

---

## 🔒 Security

### Implemented
- ✅ JWT token storage (localStorage)
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection ready
- ✅ Secure API communication
- ✅ Input validation

### Best Practices
- No sensitive data in localStorage
- HTTPS only in production
- Content Security Policy ready
- Sanitized user inputs

---

## 🎯 Performance Optimization

### Techniques Applied
1. **Code Splitting**
```typescript
const LazyPage = lazy(() => import('./pages/PageName'));
```

2. **Memoization**
```typescript
const MemoizedComponent = memo(Component);
```

3. **Lazy Loading**
```typescript
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

4. **Image Optimization**
- WebP format
- Lazy loading images
- Responsive images

5. **Bundle Optimization**
- Tree shaking
- Minification
- Compression (gzip/brotli)

### Performance Metrics
- ⚡ First Contentful Paint < 1.5s
- ⚡ Time to Interactive < 3s
- ⚡ Lighthouse Score > 90

---

## 🎨 UI/UX Features

### Design System
- **Consistent Colors** - Themed palette
- **Typography Scale** - 8 sizes
- **Spacing System** - 4px base
- **Border Radius** - 4 variants
- **Shadows** - 5 levels

### Animations
- Smooth transitions
- Loading skeletons
- Page transitions
- Hover effects
- Focus indicators

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast (WCAG AA)

---

## 📊 State Management

### Zustand Stores

**1. Auth Store**
```typescript
{
  user: User | null,
  token: string | null,
  login: (credentials) => Promise<void>,
  logout: () => void,
  updateUser: (updates) => void
}
```

**2. Workout Store**
```typescript
{
  currentPlan: WorkoutPlan | null,
  todaysWorkout: WorkoutDay | null,
  setCurrentPlan: (plan) => void,
  setTodaysWorkout: (workout) => void
}
```

**3. Training Store**
```typescript
{
  currentSession: TrainingSession | null,
  setCurrentSession: (session) => void,
  clearSession: () => void
}
```

**4. Locale Store**
```typescript
{
  language: 'en' | 'vi',
  setLanguage: (lang) => void
}
```

---

## 🐛 Debugging

### React DevTools
```bash
# Install browser extension
# Available for Chrome, Firefox, Edge
```

### Zustand DevTools
```typescript
// Auto-enabled in development
// View store state in Redux DevTools
```

### Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

---

## 📝 Code Style

### TypeScript Strict Mode
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

### ESLint Rules
- No `any` types
- Explicit function return types
- Consistent naming
- Import order

### Prettier
- 2 spaces indentation
- Single quotes
- Trailing commas
- 100 char line length

---

## 🆘 Troubleshooting

### Common Issues

**1. API Connection Failed**
```bash
# Check .env file
VITE_API_BASE_URL=http://localhost:3333/api

# Verify backend is running
curl http://localhost:3333/api/health
```

**2. Translations Not Showing**
```typescript
// Check language is loaded
import { useTranslation } from 'react-i18next';
const { t, ready } = useTranslation();
if (!ready) return <Loading />;
```

**3. Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
npm install
npm run build
```

---

## 📞 Support

For issues and questions:
- Check `ENV_SETUP.md` for configuration
- Review `MULTILANGUAGE_UPDATE.md` for translations
- See `IMPLEMENTATION_SUMMARY.md` for features

---

## 🎉 Features Summary

✅ AI-Powered Workout Plans  
✅ AI-Powered Meal Plans  
✅ Exercise Logging (Sets/Reps/Weight)  
✅ Active Session Management  
✅ Train on Any Scheduled Day  
✅ TDEE & Macro Tracking  
✅ Weight Tracking & Charts  
✅ Achievement System  
✅ Multi-Language (EN/VI) - 170+ translations  
✅ Progressive Web App  
✅ Offline Support  
✅ Responsive Design  
✅ Dark Mode Ready  
✅ Type-Safe (100% TypeScript)  
✅ Atomic Design Architecture  
✅ Production Ready  

**Built with ❤️ using React, TypeScript, and TailwindCSS**
