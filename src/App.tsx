import { Language } from '@/types/enums';
import { userService } from '@services/userService';
import { useAuthStore } from '@store/authStore';
import { useLocaleStore } from '@store/localeStore';
import { Suspense, lazy, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import {
  AuthPageSkeleton,
  DashboardSkeleton,
  InbodySkeleton,
  MealPlannerSkeleton,
  OnboardingSkeleton,
  PlannerSkeleton,
  ProfileSkeleton,
  RouteLoadingFallback,
  StatisticsSkeleton,
  TrainingSkeleton,
  WorkoutPreviewSkeleton,
} from './components/molecules';
import { IOSInstallPrompt } from './components/molecules/IOSInstallPrompt';
import { PWAInstallPrompt } from './components/molecules/PWAInstallPrompt';
import { FeedbackWidget } from './components/organisms/FeedbackWidget';
import { ErrorBoundary } from './components/organisms/ErrorBoundary';
import { MainLayout } from './components/templates/MainLayout';
import { useGenerationNotifications } from './hooks/useGenerationNotifications';
import { errorTracking, ErrorSeverity } from './services/errorTracking';
import { setAnalyticsUser, clearAnalyticsUser } from './services/firebase';
import { fcmService } from './services/fcmService';
import { useTranslation } from 'react-i18next';
import { AppRouteConfig, AppRoutePath } from './routes/paths';

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
  const { t } = useTranslation();

  const wrapWithLayout = (node: React.ReactElement): React.ReactElement => (
    <MainLayout>{node}</MainLayout>
  );

  const appRoutes: AppRouteConfig[] = [
    { path: AppRoutePath.Login, element: <LoginPage />, fallback: <AuthPageSkeleton /> },
    { path: AppRoutePath.Register, element: <RegisterPage />, fallback: <AuthPageSkeleton /> },
    { path: AppRoutePath.Root, element: <HomePage />, isProtected: true, fallback: wrapWithLayout(<DashboardSkeleton />) },
    { path: AppRoutePath.Onboarding, element: <OnboardingPage />, isProtected: true, fallback: <OnboardingSkeleton /> },
    { path: AppRoutePath.WorkoutPreview, element: <WorkoutPreviewPage />, isProtected: true, fallback: <WorkoutPreviewSkeleton /> },
    { path: AppRoutePath.Profile, element: <ProfilePage />, isProtected: true, fallback: wrapWithLayout(<ProfileSkeleton />) },
    { path: AppRoutePath.Planner, element: <PlannerPage />, isProtected: true, fallback: wrapWithLayout(<PlannerSkeleton />) },
    { path: AppRoutePath.Training, element: <TrainingPage />, isProtected: true, fallback: <TrainingSkeleton /> },
    { path: AppRoutePath.Statistics, element: <StatisticsPage />, isProtected: true, fallback: wrapWithLayout(<StatisticsSkeleton />) },
    { path: AppRoutePath.MealPlanner, element: <MealPlannerPage />, isProtected: true, fallback: wrapWithLayout(<MealPlannerSkeleton />) },
    { path: AppRoutePath.Inbody, element: <InbodyPage />, isProtected: true, fallback: wrapWithLayout(<InbodySkeleton />) },
  ];

  const withSuspense = (
    element: React.ReactElement,
    fallback?: React.ReactElement,
    isProtected?: boolean,
  ): React.ReactElement => {
    const wrapped = <Suspense fallback={fallback ?? <RouteLoadingFallback />}>{element}</Suspense>;
    return isProtected ? <ProtectedRoute>{wrapped}</ProtectedRoute> : wrapped;
  };
  
  // Initialize FCM notifications
  useGenerationNotifications();

  // Listen for service worker messages (notification clicks)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !isAuthenticated) {
      return;
    }

    const handleServiceWorkerMessage = (event: MessageEvent): void => {
      if (event.data?.type === 'GENERATION_NOTIFICATION_CLICK') {
        const { payload } = event.data;
        // Handle notification click - could navigate to relevant page
        // For now, just log it - navigation can be added later if needed
        console.log('[App] Notification clicked:', payload);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [isAuthenticated]);

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

          // Set analytics user
          if (user._id) {
            setAnalyticsUser(user._id, {
              email: user.email,
              language: user.language,
            });
          }

          // Request notification permission after login if not yet asked
          if (typeof Notification !== 'undefined') {
            const permission = Notification.permission;
            // Directly request permission if it's 'default' (not yet asked)
            if (permission === 'default') {
              // Small delay to ensure user sees the app first
              setTimeout(() => {
                Notification.requestPermission()
                  .then((result) => {
                    if (result === 'granted') {
                      toast.success(t('notification.permissionGranted'));
                      // Initialize FCM after permission is granted
                      void fcmService.initMessaging(true).catch((error) => {
                        console.warn('[App] FCM initialization failed:', error);
                        errorTracking.logError(error, ErrorSeverity.MEDIUM, { source: 'fcm_init_auto' });
                      });
                    } else if (result === 'denied') {
                      // User denied - don't show error, just silently fail
                      console.log('[App] Notification permission denied by user');
                    } else {
                      // 'default' - user dismissed
                      console.log('[App] Notification permission dismissed by user');
                    }
                  })
                  .catch((error) => {
                    console.error('[App] Failed to request notification permission:', error);
                    errorTracking.logError(error, ErrorSeverity.LOW, { source: 'notification_permission_auto' });
                  });
              }, 1000);
            }
          }
        } catch (error) {
          errorTracking.logError(error, ErrorSeverity.MEDIUM, { source: 'user_profile_fetch' });
          // If profile fetch fails, token might be invalid - clear auth
          if ((error as { response?: { status?: number } }).response?.status === 401) {
            useAuthStore.getState().clearAuth();
            clearAnalyticsUser();
          }
        }
      } else {
        // Clear analytics user on logout
        clearAnalyticsUser();
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
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<RouteLoadingFallback />}>
            {/* PWA install prompts - shows when installable (Android/Chrome) */}
            <PWAInstallPrompt />
            {/* iOS Safari install instructions */}
            <IOSInstallPrompt />
            {/* Beta feedback widget */}
            <FeedbackWidget />
            <Routes>
              {appRoutes.map(({ path, element, isProtected, fallback }) => (
                <Route key={path} path={path} element={withSuspense(element, fallback, isProtected)} />
              ))}
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </>
  );
}

export default App;

