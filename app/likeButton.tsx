'use client'

import { useEffect, useState } from 'react';
import styles from './likeButton.module.css';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import { FaRegHeart, FaHeart } from "react-icons/fa";

export default function LikeButton({ isUserLogin, count, postId }: { isUserLogin: boolean, count: number, postId: string }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(count);
  const addMessage = useMessageStore((state) => state.addMessage);

  useEffect(() => {
    if (isUserLogin) {
      fetch(`${process.env.serverBaseUrl}/api/posts/${postId}/isLiked`, { credentials: 'include' })
        .then(async (res) => {
          if (!res.ok)
            throw new Error('Failed to fetch user');
          return res.json();
        })
        .then((data) => {
          setIsLiked(data.isLiked);
        });
    }
  }, [isUserLogin]);

  return (
    <div className={styles.container}>
      <button className={isLiked ? `${styles.btn} ${styles.pressed}` : styles.btn} onClick={() => {
        if (isUserLogin) {
          if (isLiked) {
            fetch(`${process.env.serverBaseUrl}/api/posts/${postId}/unlike`, {
              credentials: 'include',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            })
              .then(async (res) => {
                if (!res.ok)
                  throw new Error('Unlike failed');
                return res.json();
              })
              .then((data) => {
                if (data.isSuccessed) {
                  setIsLiked(false);
                  setLikeCount(prev => prev - 1);
                }
              });
          }
          else {
            fetch(`${process.env.serverBaseUrl}/api/posts/${postId}/like`, {
              credentials: 'include',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            })
              .then(async (res) => {
                if (!res.ok)
                  throw new Error('Like failed');
                return res.json();
              })
              .then((data) => {
                if (data.isSuccessed) {
                  setIsLiked(true);
                  setLikeCount(prev => prev + 1);
                }
              });
          }
        }
        else {
          addMessage('Login first', MessageType.error);
        }
      }}>
        {isLiked ? <FaHeart style={{fontSize: '20px'}} /> : <FaRegHeart style={{fontSize: '20px'}}/>}
      </button>
      <span className={styles.likeCount}>{likeCount}</span>
    </div>
  );
}