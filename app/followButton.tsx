'use client'

import { useEffect, useState } from 'react';
import styles from './followButton.module.css';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import { MeRespon } from '@/app/postBlock';

export default function FollowButton({curLogin, followingUserId}: {curLogin: MeRespon | null, followingUserId: string}) {
  const addMessage = useMessageStore((state) => state.addMessage);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    if (!curLogin?.isLoggedIn || !followingUserId) return;

    fetch(`http://${location.hostname}:${process.env.serverPort}/api/user/following-status`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        followerId: curLogin.userId,
        followingId: followingUserId
      })
    })
      .then(res => res.json())
      .then(data => setIsFollowing(data.isFollowing));
  }, [curLogin, followingUserId]);

  const toggleFollow = async () => {
    if (!curLogin?.isLoggedIn) return addMessage("Please login", MessageType.error);

    const url = isFollowing ? 'unfollow' : 'follow';
    const res = await fetch(`http://${location.hostname}:${process.env.serverPort}/api/user/${url}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        followingId: followingUserId
      })
    });

    if (res.ok) setIsFollowing(prev => !prev);
  };

  return (
    <button className={styles.followBtn} onClick={toggleFollow}>
      {isFollowing ? (<p style={{ color: 'indianred' }}>Unfollow</p>) : 'Follow'}
    </button>
  );
}