'use client';

import { usePathname } from 'next/navigation';

export default function Title() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith('/notification')) return '🔔 Notification';
    if (pathname.startsWith('/chat')) return '💬 Chat';
    if (pathname.startsWith('/profile')) return '👤 Profile';
    if (pathname.startsWith('/login')) return '🔑 Login';
    if (pathname.startsWith('/register')) return '🔐 Register';
    if (pathname.startsWith('/search')) return '🔎 Search';
    if (pathname === '/') return '🏠 Home';
    return '';
  };

  return(
    <h2>{getTitle()}</h2>
  );
}