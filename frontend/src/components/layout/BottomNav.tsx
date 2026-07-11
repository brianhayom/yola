'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiHome, HiHeart, HiGlobe, HiUser, HiSparkles } from 'react-icons/hi2';

const navItems = [
  { href: '/', label: 'Home', icon: HiHome },
  { href: '/wedding', label: 'Wedding', icon: HiHeart },
  { href: '/trip', label: 'Trip', icon: HiGlobe },
  { href: '/baby', label: 'Baby', icon: HiSparkles },
  { href: '/profile', label: 'Profile', icon: HiUser },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 min-w-[64px] transition-all duration-200 ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'drop-shadow-lg' : ''}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}