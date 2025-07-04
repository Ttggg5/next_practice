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
  const [currentPage, setCurrentPage] = useState<string>("");
  const fetchedRef = useRef(false); // ✅ block duplicate fetch
  
  const nav_icon_size = 45;
  const pathname = usePathname();

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
      });
  });

  useEffect(() => {
    if (currentPage === pathname)
      return;

    setCurrentPage(pathname);
    if (pathname === '/')
      setPagesIcon({home: styles.selected, notification: "", chat: "", profile: ""});
    else if (pathname === '/notification')
      setPagesIcon({home: "", notification: styles.selected, chat: "", profile: ""});
    else if (pathname === '/chat')
      setPagesIcon({home: "", notification: "", chat: styles.selected, profile: ""});
    else if (pathname.startsWith('/profile') && loginRespon?.userId === pathname.split('/')[2])
      setPagesIcon({home: "", notification: "", chat: "", profile: styles.selected});
    else
      setPagesIcon({home: "", notification: "", chat: "", profile: ""});
  });

  return (
    <nav className={styles.pageNav}>
      <ul>
        <li className={styles.navBtn}>
          <div className={pagesIcon.home}>
            <Link href="/">
              <img src="/house-solid.svg" alt="Home"/>
            </Link>
          </div>
        </li>

        <li className={styles.navBtn}>
          <div className={pagesIcon.notification}>
            <Link href="/notification">
              <img src="/bell-solid.svg" alt="Notification"/>
            </Link>
          </div>
        </li>

        <li>
          <div className={styles.createBtn}>
            {loginRespon?.isLoggedIn ? (
              <div onClick={() => {

              }}>
                <img src="/plus-solid.svg" alt="Create post"/>
              </div>
            ) : (
              <Link href="/login">
                <img src="/plus-solid.svg" alt="Create post"/>
              </Link>
            )}
          </div>
        </li>

        <li className={styles.navBtn}>
          <div className={pagesIcon.chat}>
            <Link href="/chat">
              <img src="/comments-solid.svg" alt="Chat"/>
            </Link>
          </div>
        </li>

        <li className={styles.navBtn}>
          <div className={pagesIcon.profile}>
            <Link href={loginRespon?.isLoggedIn ? `/profile/${loginRespon?.userId}` : "/login"}>
              <img src={loginRespon?.isLoggedIn ? `http://${window.location.hostname}:${process.env.serverPort}/api/profile/avatar/${loginRespon?.userId}` : "/user-solid.svg"} alt="Profile"/>
            </Link>
          </div>
        </li>
      </ul>
    </nav>
  );
}