'use client'

import { useEffect, useState } from 'react';
import { MeRespon } from '../postBlock';
import { User } from '../userBlock';
import InfiniteScroll from '../infiniteScroll';
import styles from './page.module.css';
import { useSearchParams } from 'next/navigation';
import ChatBox from '../chatBox';

export default function Page() {
  const params = useSearchParams();
  const targetUserId = params.get('targetUserId');

  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => setCurLogin(data));
  }, []);

  const fetchUsers = async (page: number) => {
    const res = await fetch(`${process.env.serverBaseUrl}/api/chat/used-chat-with?page=${page}`, { credentials: 'include' })
    const users = await res.json() as User[];
    return users
  };

  return (
    <>
      {
        curLogin?.isLoggedIn && (
          <div className={styles.wrapper}>
            <InfiniteScroll<User>
              fetchContent={fetchUsers}
              renderItem={(u) => {
                return (
                  <div className={selectedUser?.id === u.id ? `${styles.userBlock} ${styles.selected}` : styles.userBlock} key={u.id} onClick={() => setSelectedUser(u)} >
                    <img src={`${process.env.serverBaseUrl}/api/profile/avatar/${u.id}`}/>
                    <div>
                      <strong>{u.username}</strong>
                      <small>{u.id}</small>
                    </div>
                  </div>
                );
              }}
            />

            {selectedUser && <ChatBox targetUser={selectedUser} />}
          </div>
        )
      }
    </>
  );
}