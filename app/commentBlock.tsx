'use client';

import styles from './commentBlock.module.css';
import Link from 'next/link';

export interface Comment {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: Date;
}

export default function CommentBlock({ comment }: { comment: Comment }) {
  return (
    <div className={styles.wrapper}>
      <img
        className={styles.avatar}
        src={`${process.env.serverBaseUrl}/api/profile/avatar/${comment.user_id}`}
        alt="avatar"
      />

      <div className={styles.body}>
        <Link href={`/profile/${encodeURIComponent(comment.user_id)}`}>
          <strong>{comment.username}</strong>
          <small>{comment.user_id}</small>
        </Link>
        <p>{comment.content}</p>
        <small>{new Date(comment.created_at).toLocaleString()}</small>
      </div>
    </div>
  );
}
