import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthButton } from '@/components/AuthButton';
import { MainNav } from '@/components/MainNav';

import './globals.css';

export const metadata: Metadata = {
  title: 'Primicos World Cup',
  description: 'A private World Cup score prediction game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-ink/10 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <Link href="/" className="text-lg font-bold text-ink">
              Primicos World Cup
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <MainNav />
              <AuthButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
