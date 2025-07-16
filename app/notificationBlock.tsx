'use client';

import Link from 'next/link';
import styles from './notificationBlock.module.css';

export interface Notif {
  id: number;
  user_id: string;          // receiver
  actor_id: string;
  actor_name: string;
  verb: 'posted' | 'commented';
  post_id: string;
  is_read: 0 | 1;
  created_at: string;
}

export default function NotificationBlock({ notif }: { notif: Notif }) {
  return (
    <div className={`${styles.wrap} ${notif.is_read ? styles.read : ''}`}>
      <Link href={`/profile/${encodeURIComponent(notif.actor_id)}`}>
        <strong>@{notif.actor_name}</strong>
      </Link>{' '}
      {notif.verb === 'posted' ? 'published a new post' : 'commented on a post'}
      .
      <Link href={`/post/${notif.post_id}`}> View</Link>
      <small>{new Date(notif.created_at).toLocaleString()}</small>
    </div>
  );
}
