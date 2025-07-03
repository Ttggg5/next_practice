'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './page-nav-bar.module.css';

interface Respon {
  isLoggedIn: boolean,
  userId: string
}

export default function PageNavBar() {
  const [loginRespon, setLoginRespon] = useState<Respon | null>(null);
  const [pagesIcon, setPagesIcon] = useState({ home: "", notification: "", chat: "", profile: "" });
  const fetchedRef = useRef(false); // ✅ block duplicate fetch
  
  const nav_icon_size = 45;
  const selectedPage = usePathname();

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');

        return res.json();
      })
      .then((data: Respon) => {
        setLoginRespon(data);

        if (selectedPage === '/')
          setPagesIcon({home: styles.selected, notification: "", chat: "", profile: ""});
        else if (selectedPage === '/notification')
          setPagesIcon({home: "", notification: styles.selected, chat: "", profile: ""});
        else if (selectedPage === '/chat')
          setPagesIcon({home: "", notification: "", chat: styles.selected, profile: ""});
        else if (selectedPage.startsWith('/profile') && data.userId === selectedPage.split('/')[2])
          setPagesIcon({home: "", notification: "", chat: "", profile: styles.selected});
      });
  });

  return (
    <nav className={styles.pageNav}>
      <ul>
        <li className={pagesIcon.home}>
          <Link href="/" onClick={() => setPagesIcon({home: styles.selected, notification: "", chat: "", profile: ""})}>
            <Image src="/house-solid.svg" alt="Home" width={nav_icon_size} height={nav_icon_size} />
          </Link>
        </li>

        <li className={pagesIcon.notification}>
          <Link href="/notification" onClick={() => setPagesIcon({home: "", notification: styles.selected, chat: "", profile: ""})}>
            <Image src="/bell-solid.svg" alt="Notification" width={nav_icon_size} height={nav_icon_size} />
          </Link>
        </li>

        <li className={pagesIcon.chat}>
          <Link href="/chat" onClick={() => setPagesIcon({home: "", notification: "", chat: styles.selected, profile: ""})}>
            <Image src="/comments-solid.svg" alt="Chat" width={nav_icon_size} height={nav_icon_size} />
          </Link>
        </li>

        <li className={pagesIcon.profile}>
          <Link href={loginRespon?.isLoggedIn ? `/profile/${loginRespon?.userId}` : "/login"} onClick={() => loginRespon?.isLoggedIn ? setPagesIcon({home: "", notification: "", chat: "", profile: styles.selected}) : setPagesIcon({home: "", notification: "", chat: "", profile: ""})}>
            <img src={loginRespon?.isLoggedIn ? `http://${window.location.hostname}:${process.env.serverPort}/api/profile/avatar/${loginRespon?.userId}` : "/user-solid.svg"} alt="Profile" width={nav_icon_size} height={nav_icon_size} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}