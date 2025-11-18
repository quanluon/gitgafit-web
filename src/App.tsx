import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { useLocaleStore } from '@store/localeStore';
import { useSocket } from './hooks/useSocket';
import { userService } from '@services/userService';
import { Language } from '@/types/enums';
import { PWAInstallPrompt } from './components/molecules/PWAInstallPrompt';
import { IOSInstallPrompt } from './components/molecules/IOSInstallPrompt';
import { RouteLoadingFallback } from './components/molecules/RouteLoadingFallback';
import { FeedbackWidget } from './components/organisms/FeedbackWidget';
import { AppRoutePath, AppRouteConfig } from './routes/paths';
import './App.css';

const HomePage = lazy(async () => {
  const module = await import('./pages/HomePage');
  return { default: module.HomePage };
});

const LoginPage = lazy(async () => {
  const module = await import('./pages/LoginPage');
  return { default: module.LoginPage };
});

const RegisterPage = lazy(async () => {
  const module = await import('./pages/RegisterPage');
  return { default: module.RegisterPage };
});

const ProfilePage = lazy(async () => {
  const module = await import('./pages/ProfilePage');
  return { default: module.ProfilePage };
});

const PlannerPage = lazy(async () => {
  const module = await import('./pages/PlannerPage');
  return { default: module.PlannerPage };
});

const TrainingPage = lazy(async () => {
  const module = await import('./pages/TrainingPage');
  return { default: module.TrainingPage };
});

const StatisticsPage = lazy(async () => {
  const module = await import('./pages/StatisticsPage');
  return { default: module.StatisticsPage };
});

const OnboardingPage = lazy(async () => {
  const module = await import('./pages/OnboardingPage');
  return { default: module.OnboardingPage };
});

const WorkoutPreviewPage = lazy(async () => {
  const module = await import('./pages/WorkoutPreviewPage');
  return { default: module.WorkoutPreviewPage };
});

const MealPlannerPage = lazy(async () => {
  const module = await import('./pages/MealPlannerPage');
  return { default: module.MealPlannerPage };
});

const InbodyPage = lazy(async () => {
  const module = await import('./pages/InbodyPage');
  return { default: module.InbodyPage };
});

function ProtectedRoute({ children }: { children: React.ReactNode }): React.ReactElement {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to={AppRoutePath.Login} />;
}

function App(): React.ReactElement {
  const { isAuthenticated, updateUser } = useAuthStore();
  const { setLanguage } = useLocaleStore();

  const appRoutes: AppRouteConfig[] = [
    { path: AppRoutePath.Login, element: <LoginPage /> },
    { path: AppRoutePath.Register, element: <RegisterPage /> },
    { path: AppRoutePath.Root, element: <HomePage />, isProtected: true },
    { path: AppRoutePath.Onboarding, element: <OnboardingPage />, isProtected: true },
    { path: AppRoutePath.WorkoutPreview, element: <WorkoutPreviewPage />, isProtected: true },
    { path: AppRoutePath.Profile, element: <ProfilePage />, isProtected: true },
    { path: AppRoutePath.Planner, element: <PlannerPage />, isProtected: true },
    { path: AppRoutePath.Training, element: <TrainingPage />, isProtected: true },
    { path: AppRoutePath.Statistics, element: <StatisticsPage />, isProtected: true },
    { path: AppRoutePath.MealPlanner, element: <MealPlannerPage />, isProtected: true },
    { path: AppRoutePath.Inbody, element: <InbodyPage />, isProtected: true },
  ];
  
  // Initialize Socket.IO connection
  useSocket();

  // Initialize auth state from persisted storage on app load
  useEffect(() => {
    const initializeAuth = (): void => {
      // Zustand persist middleware automatically hydrates state from localStorage
      // But we need to ensure isAuthenticated is set correctly based on token presence
      // This is important for Android WebView where localStorage might not restore state properly
      const authState = useAuthStore.getState();
      if (authState.token && !authState.isAuthenticated) {
        // Token exists but isAuthenticated is false (from persisted state)
        // This can happen on Android when localStorage is restored but state isn't hydrated properly
        useAuthStore.setState({ isAuthenticated: true });
      } else if (!authState.token && authState.isAuthenticated) {
        // No token but isAuthenticated is true - clear invalid state
        useAuthStore.getState().clearAuth();
      }
    };

    // Small delay to ensure localStorage is available (especially on Android WebView)
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch user profile and set language on app load
  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      if (isAuthenticated) {
        try {
          const user = await userService.getProfile();
          updateUser(user);
          
          // Set language from user profile
          if (user.language) {
            setLanguage(user.language as Language);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // If profile fetch fails, token might be invalid - clear auth
          if ((error as { response?: { status?: number } }).response?.status === 401) {
            useAuthStore.getState().clearAuth();
          }
        }
      }
    };

    initializeApp();
  }, [isAuthenticated, updateUser, setLanguage]);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
        gutter={8}
      />
      <Router>
        <Suspense fallback={<RouteLoadingFallback />}>
          {/* PWA install prompts - shows when installable (Android/Chrome) */}
          <PWAInstallPrompt />
          {/* iOS Safari install instructions */}
          <IOSInstallPrompt />
          {/* Beta feedback widget */}
          <FeedbackWidget />
          <Routes>
            {appRoutes.map(({ path, element, isProtected }) => (
              <Route
                key={path}
                path={path}
                element={
                  isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element
                }
              />
            ))}
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;

