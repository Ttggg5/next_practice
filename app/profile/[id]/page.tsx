'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Loading from '@/app/loading';
import styles from './page.module.css';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import InfiniteScroll from '@/app/infiniteScroll';
import PostBlock, { MeRespon, Post } from '@/app/postBlock';
import { BiCalendar } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import { TbLogout2 } from "react-icons/tb";
import FollowButton from '@/app/followButton';
import UserListModal from '../userListModal';
import Link from 'next/link';
import { IoChatbubblesSharp } from "react-icons/io5";
import ChatBox from '@/app/chatBox';
import { User } from '@/app/userBlock';

export interface Profile {
  id: string;
  username: string;
  email: string;
  create_time: Date;
  bio?: string;
}

const fetchUserPosts = (userId: string) => async (page: number) => {
  const res = await fetch(`${process.env.serverBaseUrl}/api/posts/user/${userId}?page=${page}`, {
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
  const userId = decodeURIComponent(params.id as string);
  const [followCount, setFollowCount] = useState({ followerCount: 0, followingCount: 0 });
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const [showChatbox, setShowChatbox] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = '';
  }, []);

  useEffect(() => {
    const fetchFollowCount = async () => {
      const res = await fetch(`${process.env.serverBaseUrl}/api/user/${encodeURIComponent(userId)}/follow-count`);
      const data = await res.json();
      setFollowCount(data);
    };

    fetchFollowCount();
  }, [userId]);

  const handleLogout = () => {
    fetch(`${process.env.serverBaseUrl}/api/auth/logout`, {
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
    fetch(`${process.env.serverBaseUrl}/api/profile/${userId}`, { credentials: 'include' })
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
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>Loading Profile<Loading /></div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.profile}>
        <div className={styles.avatarNameContainer}>
          <img className={styles.avatar} src={`${process.env.serverBaseUrl}/api/profile/avatar/${userId}`} alt="avatar" />
          <div className={styles.infoContainer}>
            <h1>{profile.username}</h1>
            <p>{profile.id}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <div className={styles.followInfo}>
            <p><button className={styles.followerBtn} onClick={() => {
              setShowFollowers(true);
              document.documentElement.style.overflow = 'hidden';
            }}>{followCount.followerCount} Followers</button></p>
            <p>|</p>
            <p><button className={styles.followingBtn} onClick={() => {
              setShowFollowing(true);
              document.documentElement.style.overflow = 'hidden';
            }}>{followCount.followingCount} Following</button></p>
          </div>

          {curLogin?.userId !== profile.id && <div style={{ alignSelf: 'end' }}><FollowButton curLogin={curLogin} followingUserId={userId} /></div>}
        </div>

        <div className={styles.bio}>
          {profile.bio ? <p>{profile.bio}</p> : <p>Nothing has been written here.</p>}
        </div>

        {curLogin?.userId !== profile.id && <button className={styles.chatBtn} onClick={() => {
          if (!curLogin?.isLoggedIn) return addMessage('Please login', MessageType.error);
          setShowChatbox(true);
          document.documentElement.style.overflow = 'hidden';
        }}><IoChatbubblesSharp /> Chat</button>}

        <p className={styles.createDate}>
          <BiCalendar style={{ fontSize: '20px', marginRight: '5px' }} />Create at: {new Date(profile.create_time).toDateString()}
        </p>

        {curLogin?.userId === profile.id && (
          <div className={styles.functionBtns}>
            <Link className={styles.editBtn} href={'/profile/edit'}><MdEdit style={{ marginRight: '5px' }} />Edit profile</Link>
            <button className={styles.logoutBtn} onClick={handleLogout}><TbLogout2 style={{ marginRight: '5px' }} />Logout</button>
          </div>
        )}
      </div>

      {showFollowers && (<UserListModal userId={userId} type="followers" onClose={() => { setShowFollowers(false); document.documentElement.style.overflow = ''; }} />)}
      {showFollowing && (<UserListModal userId={userId} type="following" onClose={() => { setShowFollowing(false); document.documentElement.style.overflow = ''; }} />)}
      {showChatbox && (
        <div style={{ position: 'fixed', top: 0, left: 0, background: '#0000008b', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => {setShowChatbox(false); document.documentElement.style.overflow = '';}}>
          <div style={{ background: 'var(--background-hover)', maxWidth: '500px', width: '90%', height: '75vh', borderRadius: '10px', padding: '10px' }} onClick={(e) => e.stopPropagation()}>
            <ChatBox targetUser={{id: profile.id, username: profile.username} as User} />
          </div>
        </div>
        )}

      <InfiniteScroll<Post> fetchContent={fetchUserPosts(userId)} renderItem={(post, idx, onItemDeleted) => <PostBlock key={post.id} post={post} curLogin={curLogin} onDeleted={onItemDeleted} />} />
    </>
  );
};