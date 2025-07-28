'use client';

import { useEffect, useState } from 'react';
import InfiniteScroll from '@/app/infiniteScroll';
import NotificationBlock, { Notif } from '@/app/notificationBlock';
import styles from './page.module.css';
import { MeRespon } from '../postBlock';

export default function Page() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [key, setkey] = useState<string>('0');

  useEffect(() => {
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => setCurLogin(data));
  }, []);

  const readAll = () => {
    fetch(`${process.env.serverBaseUrl}/api/notifications/mark-read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId: curLogin?.userId })
    })
      .then(() => setkey(prev => prev === '0' ? '1' : '0'));
  };

  /* --- fetch paged notifications --- */
  const fetchNotifs = async (page: number) => {
    const res = await fetch(`${process.env.serverBaseUrl}/api/notifications?page=${page}`, {
      credentials: 'include',
    });
    const data: Notif[] = await res.json();

    return data;
  };

  return (
    <>
      {curLogin?.isLoggedIn && (
        <>
          <button className={styles.readAllBtn} onClick={readAll}>Read all</button>

          <InfiniteScroll<Notif>
            key={key}
            fetchContent={fetchNotifs}
            renderItem={(n) => <NotificationBlock key={n.id} notif={n} />}
          />
        </>
      )}
    </>
  );
}
