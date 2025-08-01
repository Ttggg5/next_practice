'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './pageNavBar.module.css';
import { IoAddOutline } from "react-icons/io5";
import { HiHome } from "react-icons/hi2";
import { FaBell } from "react-icons/fa";
import { IoIosChatbubbles } from "react-icons/io";
import { IoPerson } from "react-icons/io5";
import socket from '@/lib/socket';
import { useMessageStore, MessageType } from '@/store/useMessageStore';
import { Notif, UserAction } from '@/app/notificationBlock';

interface Respon {
  isLoggedIn: boolean,
  userId: string
}

enum Pages {
  home = 'home',
  notification = 'notification',
  chat = 'chat',
  profile = 'profile',
  others = 'others',
}

export default function PageNavBar() {
  const addMessage = useMessageStore((state) => state.addMessage);
  
  const [curLogin, setCurLogin] = useState<Respon | null>(null);
  const [selected, setSelected] = useState<Pages>(Pages.others);
  const pathname = usePathname();

  const [notificationRead, setNotificationRead] = useState<boolean>(true);
  const [chatRead, setChatRead] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');

        return res.json();
      })
      .then((data: Respon) => {
        setCurLogin(data);
      });
  }, []);

  useEffect(() => {
    if (pathname === '/')
      setSelected(Pages.home);
    else if (pathname === '/notification')
      setSelected(Pages.notification);
    else if (pathname === '/chat')
      setSelected(Pages.chat);
    else if (pathname.startsWith('/profile') && curLogin?.userId === pathname.split('/')[2])
      setSelected(Pages.profile);
    else
      setSelected(Pages.others);
  }, [pathname]);

  // Notification socket
  useEffect(() => {
    if (!curLogin?.isLoggedIn) return;

    socket.connect();
    socket.emit('register', curLogin?.userId);

    const handleReceiveNotification = (noti: Notif) => {
      const action = noti.verb === UserAction.posted ? 'post someting.' : 'comment the post.';
      addMessage(`${noti.actor_id} ${action}`, MessageType.info);
      setNotificationRead(false);
    };
    socket.on('notification', handleReceiveNotification);
    socket.on('message-noti', (noti: { from_user_id: string }) => {
      addMessage(`${noti.from_user_id} send a message to you.`, MessageType.info);
      setChatRead(false);
    });

    return () => {
      socket.off('notification', handleReceiveNotification);
      socket.disconnect();
    };
  }, [curLogin]);

  useEffect(() => {
    if (!curLogin?.isLoggedIn) return;

    fetch(`${process.env.serverBaseUrl}/api/notifications/unread-count`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data: { count: number}) => {
        if (data.count > 0) setNotificationRead(false);
        else setNotificationRead(true);
      });

      fetch(`${process.env.serverBaseUrl}/api/chat/any-unread`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data: { anyUnread: boolean}) => setChatRead(!data.anyUnread));
  }, [curLogin, pathname]);

  return (
    <nav className={styles.pageNav}>
      <ul>
        <li className={styles.navBtn}>
          <div className={selected === Pages.home ? styles.selected : ''}>
            <Link href='/'><HiHome /></Link>
          </div>
        </li>

        <li className={styles.navBtn}>
          <div className={selected === Pages.notification ? styles.selected : ''}>
            <Link href={curLogin?.isLoggedIn ? '/notification' : '/login'}><FaBell /></Link>
          </div>
          {!notificationRead && <p className={styles.dot}></p>}
        </li>

        <li>
          <div className={styles.createBtn}>
            <Link href={curLogin?.isLoggedIn ? '/create-post' : '/login'}><IoAddOutline /></Link>
          </div>
        </li>

        <li className={styles.navBtn}>
          <div className={selected === Pages.chat ? styles.selected : ''}>
            <Link href={curLogin?.isLoggedIn ? '/chat' : '/login'}><IoIosChatbubbles /></Link>
          </div>
          {!chatRead && <p className={styles.dot}></p>}
        </li>

        <li className={styles.navBtn}>
          <div className={selected === Pages.profile ? styles.selected : ''}>
            <Link href={curLogin?.isLoggedIn ? `/profile/${curLogin?.userId}` : "/login"}>
              {curLogin?.isLoggedIn ? <img src={`${process.env.serverBaseUrl}/api/profile/avatar/${curLogin?.userId}`} alt='Profile'/> : <IoPerson/>}
            </Link>
          </div>
        </li>
      </ul>
    </nav>
  );
}