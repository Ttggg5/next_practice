'use client';

import styles from './userFollowListModal.module.css';
import { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import { MeRespon } from '../postBlock';
import UserBlock, { User } from '../userBlock';
import InfiniteScroll from '../infiniteScroll';


interface Props {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

export default function UserListModal({ userId, type, onClose }: Props) {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);

  useEffect(() => {
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
  }, []);

  const fetchUsers = async (page: number) => {
    const res = await fetch(`http://${location.hostname}:${process.env.serverPort}/api/user/${encodeURIComponent(userId)}/${type}?page=${page}`, {
      credentials: 'include',
    });
    return res.json() as Promise<User[]>;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{type === 'followers' ? 'Followers' : 'Following'}</h3>
        <button className={styles.close} onClick={onClose}><IoClose /></button>

        <div className={styles.userList}>
          <InfiniteScroll fetchContent={fetchUsers} renderItem={(user) => <UserBlock key={user.id} curLogin={curLogin} user={user}/>}/>
        </div>
      </div>
    </div>
  );
}
