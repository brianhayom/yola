'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { BottomNav } from './BottomNav';

// Paths where BottomNav should NOT appear (landing, auth pages)
const hiddenPaths = ['/auth/login', '/auth/register'];

export function BottomNavWrapper() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Hide on auth pages and landing page (when not authenticated)
  if (hiddenPaths.includes(pathname)) return null;
  if (!isAuthenticated && pathname === '/') return null;

  return <BottomNav />;
}