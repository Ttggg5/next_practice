'use client'

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Loading from '@/app/loading';
import styles from './page.module.css';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import InfiniteScroll from '@/app/infinite-scroll';
import { MeRespon } from '@/app/postBlock';
import { BiCalendar } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import { TbLogout2 } from "react-icons/tb";

interface Profile {
  id: string;
  username: string;
  email: string;
  create_time: Date;
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

  const handleLogout = () => {
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message);
        }
        return res.json();
      })
      .then((data) => {
        addMessage(data.message, MessageType.success);
        window.location.href = `http://${window.location.host}/`;
      })
      .catch((err: Error) => addMessage(err.message, MessageType.error));
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>Loading Profile<Loading></Loading></div>
      </div>
    );
  };

  return (
    <div>
      <div className={styles.profile}>
        <div className={styles.avatarNameContainer}>
          <img className={styles.avatar} src={`http://${window.location.hostname}:${process.env.serverPort}/api/profile/avatar/${userId}`} alt="avatar" />
          <div className={styles.infoContainer}>
            <h2>{profile.username}</h2>
            <p>{profile.id}</p>
          </div>
        </div>
        <p className={styles.createDate}><BiCalendar style={{ fontSize: '20px', marginRight: '5px' }} />Create at: {new Date(profile.create_time).toDateString()}</p>

        <div className={styles.bio}>
          {profile.bio ? <p>{profile.bio}</p> : <p>Nothing has been written here.</p>}
        </div>

        {curLogin?.userId === profile.id && (
          <div className={styles.functionBtns}>
            <button className={styles.editBtn}><MdEdit style={{ marginRight: '5px' }} />Edit profile</button>
            <button className={styles.logoutBtn} onClick={handleLogout}><TbLogout2 style={{ marginRight: '5px' }} />Logout</button>
          </div>
        )}
      </div>

      <InfiniteScroll fetchContent={fetchUserPosts(userId)}></InfiniteScroll>
    </div>
  );
};