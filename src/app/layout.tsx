import type { Metadata, Viewport } from 'next';
import Link from 'next/link';

import { AuthButton } from '@/components/AuthButton';
import { MainNav } from '@/components/MainNav';
import { PwaRuntime } from '@/components/PwaRuntime';
import { getUser } from '@/lib/auth';

import './globals.css';

export const metadata: Metadata = {
  title: 'Primicos World Cup',
  description: 'A private World Cup score prediction game.',
  manifest: '/manifest.webmanifest',
  icons: {
    apple: '/icons/apple-touch-icon.png',
    icon: [
      {
        url: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Primicos WC',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#16784b',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <PwaRuntime authenticated={Boolean(user)} />
        <header className="app-header border-b border-ink/10 bg-white">
          <div className="app-shell mx-auto grid max-w-6xl gap-3 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="text-lg font-bold text-ink">
                Primicos World Cup
              </Link>
              <AuthButton />
            </div>
            <div>
              <MainNav />
            </div>
          </div>
        </header>
        <main className="app-main app-shell mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
