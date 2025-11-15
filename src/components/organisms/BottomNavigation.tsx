import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, UtensilsCrossed, BarChart3, User } from 'lucide-react';
import { AppRoutePath } from '@/routes/paths';

export function BottomNavigation(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: t('navigation.home'), path: AppRoutePath.Root },
    { icon: UtensilsCrossed, label: t('navigation.mealPlanner'), path: AppRoutePath.MealPlanner },
    { icon: BarChart3, label: t('navigation.statistics'), path: AppRoutePath.Statistics },
    { icon: User, label: t('navigation.profile'), path: AppRoutePath.Profile },
  ];

  const isActive = (path: string): boolean => {
    if (path === AppRoutePath.Root) {
      return location.pathname === AppRoutePath.Root;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t z-40"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-around h-14">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={(): void => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

