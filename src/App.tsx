import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { ProfilePage } from '@pages/ProfilePage';
import { PlannerPage } from '@pages/PlannerPage';
import { TrainingPage } from '@pages/TrainingPage';
import { StatisticsPage } from '@pages/StatisticsPage';
import { OnboardingPage } from '@pages/OnboardingPage';
import { WorkoutPreviewPage } from '@pages/WorkoutPreviewPage';
import { MealPlannerPage } from '@pages/MealPlannerPage';
import './App.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App(): React.ReactElement {
  return (
    <Router>
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
  );
}

export default App;

