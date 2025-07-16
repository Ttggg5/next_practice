'use client';

import { useEffect, useState } from 'react';
import InfiniteScroll from '@/app/infiniteScroll';
import NotificationBlock, { Notif } from '@/app/notificationBlock';
import styles from './page.module.css';

export default function Page() {
  const [unreadIds, setUnreadIds] = useState<number[]>([]);

  /* --- fetch paged notifications --- */
  const fetchNotifs = async (page: number) => {
    const res = await fetch(`${process.env.serverBaseUrl}/api/notifications?page=${page}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    const data: Notif[] = await res.json();

    // collect unread ids (for later mark‑read)
    setUnreadIds((prev) => [
      ...prev,
      ...data.filter((n) => !n.is_read).map((n) => n.id),
    ]);

    return data;
  };

  /* --- mark all fetched unread as read on unmount --- */
  useEffect(() => {
    return () => {
      if (unreadIds.length) {
        fetch(`${process.env.serverBaseUrl}/api/notifications/mark-read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: unreadIds }),
        });
      }
    };
  }, [unreadIds]);

  return (
    <>
      <InfiniteScroll<Notif>
        fetchContent={fetchNotifs}
        renderItem={(n) => <NotificationBlock key={n.id} notif={n} />}
      />
    </>
  );
}
