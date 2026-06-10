'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type NavItem = {
  href: string;
  icon: ReactNode;
  label: string;
  match?: (pathname: string) => boolean;
};

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
      <path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ScoreIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m12 7 4 3-1.5 4.5h-5L8 10l4-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M12 7V3M16 10l4-1M14.5 14.5l2.5 3.5M9.5 14.5 7 18M8 10 4 9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ResultsIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
      <path d="M9 5h6M10 4h4a2 2 0 0 1 2 2v1H8V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M8 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="m8 12 1.5 1.5L12 11M14.5 12H17M8 17h1.5M12 17h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM9 18h6M10 14v4M14 14v4M6 6H4v2a4 4 0 0 0 4 4M18 6h2v2a4 4 0 0 1-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function PodiumIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
      <path d="M4 12h5v8H4zM10 6h4v14h-4zM15 10h5v10h-5z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

const items: NavItem[] = [
  { href: '/matches/today', icon: <CalendarIcon />, label: 'Today' },
  {
    href: '/matches',
    icon: <ScoreIcon />,
    label: 'Match Predictions',
    match: (pathname) => pathname === '/matches',
  },
  { href: '/my-predictions', icon: <TrophyIcon />, label: 'Tournament Predictions' },
  { href: '/submissions', icon: <ResultsIcon />, label: 'Results' },
  { href: '/leaderboard', icon: <PodiumIcon />, label: 'Leaderboard' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-5 gap-1 text-xs sm:gap-2">
      {items.map((item) => {
        const active = item.match ? item.match(pathname) : pathname.startsWith(item.href);

        return (
          <Link
            className={`grid h-16 min-w-0 place-items-center gap-1 rounded-md px-1 py-2 text-center font-semibold leading-tight transition sm:h-[4.5rem] sm:px-2 ${
              active
                ? 'bg-turf text-white shadow-sm'
                : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
            }`}
            href={item.href}
            key={item.href}
            title={item.label}
          >
            {item.icon}
            <span className="grid min-h-7 max-w-full place-items-center text-center text-[0.56rem] leading-[0.95rem] sm:text-[0.68rem]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
