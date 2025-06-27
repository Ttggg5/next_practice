'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface Respon {
  isLoggedIn: boolean,
  userId: string
}

export default function PageNavBar() {
  const [loginRespon, setLoginRespon] = useState<Respon | null>(null);
  const [pagesIcon, setPagesIcon] = useState({ home: "", notification: "", chat: "", profile: "" });

  let nav_icon_size = 45;
  let selectedPage = usePathname();

  useEffect(() => {
    if (!loginRespon) {
      fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
        .then(async (res) => {
          if (!res.ok)
            throw new Error('Failed to fetch user');
  
          return res.json();
        })
        .then((data: Respon) => {
          setLoginRespon(data);

          if (selectedPage === '/')
            setPagesIcon({home: "selected", notification: "", chat: "", profile: ""});
          else if (selectedPage === '/notification')
            setPagesIcon({home: "", notification: "selected", chat: "", profile: ""});
          else if (selectedPage === '/chat')
            setPagesIcon({home: "", notification: "", chat: "selected", profile: ""});
          else if (selectedPage.startsWith('/profile') && data.userId === selectedPage.split('/')[2])
            setPagesIcon({home: "", notification: "", chat: "", profile: "selected"});
        });

    }
  });

  return (
    <nav className="page-nav">
      <ul>
        <li className={pagesIcon.home}>
          <Link href="/" onClick={e => setPagesIcon({home: "selected", notification: "", chat: "", profile: ""})}>
            <Image src="/house-solid.svg" alt="Home" width={nav_icon_size} height={nav_icon_size} />
          </Link>
        </li>

        <li className={pagesIcon.notification}>
          <Link href="/notification" onClick={e => setPagesIcon({home: "", notification: "selected", chat: "", profile: ""})}>
            <Image src="/bell-solid.svg" alt="Notification" width={nav_icon_size} height={nav_icon_size} />
          </Link>
        </li>

        <li className={pagesIcon.chat}>
          <Link href="/chat" onClick={e => setPagesIcon({home: "", notification: "", chat: "selected", profile: ""})}>
            <Image src="/comments-solid.svg" alt="Chat" width={nav_icon_size} height={nav_icon_size} />
          </Link>
        </li>

        <li className={pagesIcon.profile}>
          <Link href={loginRespon?.isLoggedIn ? `/profile/${loginRespon?.userId}` : "/login"} onClick={e => setPagesIcon({home: "", notification: "", chat: "", profile: "selected"})}>
            <img src={loginRespon?.isLoggedIn ? `${process.env.serverBaseUrl}/api/profile/avatar/${loginRespon?.userId}` : "/user-solid.svg"} alt="Profile" width={nav_icon_size} height={nav_icon_size} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}