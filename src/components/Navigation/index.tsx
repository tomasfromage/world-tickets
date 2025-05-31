'use client';

import { Home, CreditCard, User } from 'iconoir-react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * This component uses the UI Kit to navigate between pages
 * Bottom navigation is the most common navigation pattern in Mini Apps
 * We require mobile first design patterns for mini apps
 * Read More: https://docs.world.org/mini-apps/design/app-guidelines#mobile-first
 */

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/home',
    },
    {
      icon: CreditCard,
      label: 'Tickets',
      path: '/tickets',
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
    },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
