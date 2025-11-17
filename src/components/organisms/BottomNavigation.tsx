import { AppRoutePath } from '@/routes/paths';
import { BarChart3, Home, ScanLine, User, UtensilsCrossed } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export function BottomNavigation(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: t('navigation.home'), path: AppRoutePath.Root },
    { icon: UtensilsCrossed, label: t('navigation.mealPlanner'), path: AppRoutePath.MealPlanner },
    { icon: ScanLine, label: t('navigation.inbody'), path: AppRoutePath.Inbody },
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
      className="fixed left-0 right-0 bottom-0 pb-1 w-full bg-background border-t z-40"
    >
      <div className="w-full flex items-center justify-around h-14 sm:h-16 relative px-2 sm:px-4">
        {navItems.map((item) => {
          const isInbody = item.path === AppRoutePath.Inbody;
          const isItemActive = isActive(item.path);
          
          if (isInbody) {
            return (
              <button
                key={item.path}
                onClick={(): void => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-1 py-1 transition-all relative -mt-6 flex-1 max-w-[80px] sm:max-w-none"
              >
                <div className="bg-primary rounded-full p-2.5 sm:p-3 shadow-lg">
                  <item.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className={`text-[10px] sm:text-xs ${isItemActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          }
          
          return (
            <button
              key={item.path}
              onClick={(): void => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1.5 transition-colors flex-1 max-w-[80px] sm:max-w-none ${
                isItemActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] sm:text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

