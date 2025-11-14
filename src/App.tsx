import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { useLocaleStore } from '@store/localeStore';
import { useSocket } from './hooks/useSocket';
import { userService } from '@services/userService';
import { Language } from '@/types/enums';
import { GenerationProgress } from './components/organisms/GenerationProgress';
import { PWAInstallPrompt } from './components/molecules/PWAInstallPrompt';
import { IOSInstallPrompt } from './components/molecules/IOSInstallPrompt';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlannerPage } from './pages/PlannerPage';
import { TrainingPage } from './pages/TrainingPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { WorkoutPreviewPage } from './pages/WorkoutPreviewPage';
import { MealPlannerPage } from './pages/MealPlannerPage';
import './App.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App(): React.ReactElement {
  const { isAuthenticated, updateUser } = useAuthStore();
  const { setLanguage } = useLocaleStore();
  
  // Initialize Socket.IO connection
  useSocket();

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
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
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
      />
      <Router>
        {/* Floating generation progress bubble - must be inside Router for useNavigate */}
        <GenerationProgress />
        {/* PWA install prompts - shows when installable (Android/Chrome) */}
        <PWAInstallPrompt />
        {/* iOS Safari install instructions */}
        <IOSInstallPrompt />
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout-preview"
          element={
            <ProtectedRoute>
              <WorkoutPreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <PlannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <TrainingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <StatisticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-planner"
          element={
            <ProtectedRoute>
              <MealPlannerPage />
            </ProtectedRoute>
          }
        />
        </Routes>
      </Router>
    </>
  );
}

export default App;

