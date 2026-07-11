import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { BottomNavWrapper } from '@/components/layout/BottomNavWrapper';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'YOLA - Your Life Assistant',
  description: 'AI-powered life planner for weddings, holidays, and baby preparation',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YOLA',
  },
  applicationName: 'YOLA',
  keywords: ['wedding planner', 'travel planner', 'baby planner', 'life assistant', 'AI planner'],
  authors: [{ name: 'YOLA Team' }],
  openGraph: {
    title: 'YOLA - Your Life Assistant',
    description: 'Plan your wedding, holiday, and baby with AI assistance',
    type: 'website',
    locale: 'id_ID',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ec4899',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
        <Providers>
          <main className="pb-20 safe-bottom">
            {children}
          </main>
          <BottomNavWrapper />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1f2937',
                color: '#fff',
                fontSize: '14px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}