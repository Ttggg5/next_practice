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
    <Link 
      className={notif.is_read ? `${styles.read} ${styles.block}` : styles.block}
      href={notif.comment_id ? `/post/${notif.post_id}?cId=${notif.comment_id}` : `/post/${notif.post_id}`}
      onClick={handleRead}>
      <div className={styles.wrapper}>
        <img className={styles.avatar} alt="avatar" src={`${process.env.serverBaseUrl}/api/profile/avatar/${notif.actor_id}`}></img>

        <div className={styles.userInfo}>
          <strong>{notif.actor_name}</strong>
          <small>{notif.actor_id}</small>
        </div>

        <div className={styles.content}>
          {notif.verb === UserAction.posted ? 'Published a new post.' : 'Commented on a post.'}
        </div>

        {!notif.is_read && <div className={styles.dot}></div>}
      </div>

      <small className={styles.date}>{new Date(notif.created_at).toLocaleString()}</small>
    </Link>
  );
}
