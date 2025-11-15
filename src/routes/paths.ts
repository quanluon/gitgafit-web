import React from 'react';

export enum AppRoutePath {
  Root = '/',
  Login = '/login',
  Register = '/register',
  Onboarding = '/onboarding',
  WorkoutPreview = '/workout-preview',
  Profile = '/profile',
  Planner = '/planner',
  Training = '/training',
  Statistics = '/statistics',
  MealPlanner = '/meal-planner',
}

export interface AppRouteConfig {
  path: AppRoutePath;
  element: React.ReactElement;
  isProtected?: boolean;
}

