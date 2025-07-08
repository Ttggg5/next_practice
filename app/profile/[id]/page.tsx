'use client'

import React, { useEffect, useState } from 'react';
import UploadAvatar from './upload-avatar';
import { useParams } from 'next/navigation';
import Loading from '@/app/loading';
import styles from './page.module.css';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import InfiniteScroll from '@/app/infinite-scroll';
import { MeRespon } from '@/app/postBlock';

interface Profile {
  id: string;
  username: string;
  email: string;
  bio?: string;
}

const fetchUserPosts = (userId: string) => async (page: number) => {
  const res = await fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/posts/user/${userId}?page=${page}`, {
    credentials: 'include',
  });
  return await res.json();
};

export default function Page() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const addMessage = useMessageStore((state) => state.addMessage);
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    if (!userId) {
      setError('No user ID provided.');
      return;
    }

    // Fetch user profile by ID
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/profile/${userId}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to fetch profile');
        }
        return res.json();
      })
      .then((data: Profile) => setProfile(data))
      .catch((err: Error) => setError(err.message));

    // check login
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => {
        setCurLogin(data);
      });
  }, [userId]);

  if (error) {
    addMessage(error, MessageType.error);
    return <></>;
  }
  if (!profile) {
    return (
      <div className={styles.page}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>Loading Profile<Loading></Loading></div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.profile}>
        <img className={styles.avatar} src={`http://${window.location.hostname}:${process.env.serverPort}/api/profile/avatar/${userId}`} alt="avatar" />
        {curLogin?.userId === profile.id && <button></button>}
        <h2>{profile.username}</h2>
        {profile.bio ? <p>{profile.bio}</p> : <p>Nothing has been written here.</p>}
      </div>
      
      <InfiniteScroll fetchContent={fetchUserPosts(userId)}></InfiniteScroll>
    </div>
  );
};