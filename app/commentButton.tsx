'use client';

import { useCallback, useState } from 'react';
import InfiniteScroll from '@/app/infiniteScroll';
import CommentBlock, { Comment } from '@/app/commentBlock';
import styles from './commentButton.module.css';
import { FaRegComment } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MeRespon } from './postBlock';
import { useMessageStore, MessageType } from '@/store/useMessageStore';

interface Props {
  postId: string;
  count: number;
  curLogin: MeRespon | null;
}

export default function CommentButton({ postId, count, curLogin }: Props) {
  const [open, setOpen] = useState(false);
  const [cmtCount, setCmtCount] = useState(count);
  const [newText, setNewText] = useState('');

  const addMessage = useMessageStore((state) => state.addMessage);

  /* ---------- modal helpers ---------- */
  const toggle = () => {
    if (!open) document.documentElement.style.overflow = 'hidden';
    else document.documentElement.style.overflow = '';
    setOpen(!open);
  }
  const close = () => {
    setOpen(false); 
    document.documentElement.style.overflow = '';
  }

  /* ---------- fetchers ---------- */
  const fetchComments = useCallback(async (page: number) => {
    const res = await fetch(
      `${process.env.serverBaseUrl}/api/posts/${postId}/comments?page=${page}&`,
      { credentials: 'include' }
    );
    return res.json() as Promise<Comment[]>;
  }, [postId]);

  const submitComment = async () => {
    if (!curLogin?.isLoggedIn) return addMessage('Login first', MessageType.error);
    if (!newText.trim()) return;

    const res = await fetch(`${process.env.serverBaseUrl}/api/posts/${postId}/create-comment`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newText })
    });
    if (res.ok) {
      setNewText('');
      setCmtCount((n) => n + 1);
    }
  };

  return (
    <>
      {/* trigger */}
      <div className={styles.btn}>
        <button onClick={toggle}>
          <FaRegComment />
        </button>
        <span>{cmtCount}</span>
      </div>

      {/* modal */}
      {open && (
        <div className={styles.overlay} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h3>Comments</h3>
              <button onClick={close}><IoClose style={{ fontSize: '20px' }} /></button>
            </div>

            <section className={styles.list}>
              <InfiniteScroll<Comment>
                key={`comments-${postId}-${cmtCount}`} // remount on refresh
                fetchContent={fetchComments}
                renderItem={(c, idx, onItemDeleted) => <CommentBlock key={c.id} comment={c} currentUserId={curLogin?.userId} onDeleted={() => {
                  onItemDeleted(c.id);
                  setCmtCount((prev) => prev - 1);
                }}/>}
              />
            </section>

            <footer className={styles.inputRow}>
              <input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder='Write a comment'
              />
              <button onClick={submitComment}>Post</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}