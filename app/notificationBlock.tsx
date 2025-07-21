'use client';

import Link from 'next/link';
import styles from './notificationBlock.module.css';

export enum UserAction{
  posted = 'posted',
  commented = 'commented'
}

export interface Notif {
  id: string;
  user_id: string; // receiver
  actor_id: string; // sender
  verb: UserAction;
  post_id: string;
  comment_id: string;
  is_read: boolean;
  created_at: string;
  actor_name: string;
}

export default function NotificationBlock({ notif }: { notif: Notif }) {
  const handleRead = () => {
    fetch(`${process.env.serverBaseUrl}/api/notifications/mark-read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: notif.id })
    });
  };

  return (
    <div className={notif.is_read ? styles.read : ''} style={{ width: '100%' }}>
      <div className={styles.wrap}>
        <img className={styles.avatar} alt="avatar" src={`${process.env.serverBaseUrl}/api/profile/avatar/${notif.actor_id}`}></img>

        <Link className={styles.userInfo} href={`/profile/${encodeURIComponent(notif.actor_id)}`}>
          <strong>{notif.actor_name}</strong>
          <small>{notif.actor_id}</small>
        </Link>{' '}

        <div className={styles.content}>
          {notif.verb === UserAction.posted ? 'Published a new post.' : 'Commented on a post.'}
          <Link href={notif.comment_id ? `/post/${notif.post_id}?cId=${notif.comment_id}` : `/post/${notif.post_id}`} onClick={handleRead} style={{ color: 'var(--main)', textDecoration: 'underline', marginLeft: '10px' }}>View</Link>
        </div>

        {!notif.is_read && <div className={styles.dot}></div>}
      </div>

      <small className={styles.date}>{new Date(notif.created_at).toLocaleString()}</small>
    </div>
  );
}
