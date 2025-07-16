'use client';

import styles from './commentBlock.module.css';
import Link from 'next/link';
import { FaTrash } from "react-icons/fa6";
import { useMessageStore, MessageType } from '@/store/useMessageStore';

export interface Comment {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: Date;
}

interface Props {
  comment: Comment;
  currentUserId?: string;
  onDeleted?: (id: string) => void;
}

export default function CommentBlock({ comment, currentUserId, onDeleted }: Props) {
  const addMessage = useMessageStore((state) => state.addMessage);
  const isOwner = currentUserId === comment.user_id;

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;

    const res = await fetch(`${process.env.serverBaseUrl}/api/posts/comment/${comment.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) onDeleted?.(comment.id);
    else addMessage('Delete failed', MessageType.error);
  };

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

      {isOwner && (
        <button className={styles.deleteBtn} onClick={handleDelete} title="Delete">
          <FaTrash size={18} />
        </button>
      )}
    </div>
  );
}
