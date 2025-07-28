'use client'

import { useEffect, useState } from 'react';
import { MeRespon } from '../postBlock';
import { User } from '../userBlock';
import InfiniteScroll from '../infiniteScroll';
import styles from './page.module.css';
import ChatBox from '../chatBox';

export interface ChatWith {
  id: string;
  from_user_id: string;
  to_user_id: string;
  is_read: boolean;
  last_chat: Date;
  created_at: Date;
  target_username: string;
}

export default function Page() {
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
    const users = await res.json() as ChatWith[];
    return users
  };

  return (
    <>
      {
        curLogin?.isLoggedIn && (
          <div className={styles.wrapper} style={selectedUser ? {} : { gridTemplateColumns: '1fr' }}>
            <div>
              <InfiniteScroll<ChatWith>
                fetchContent={fetchUsers}
                renderItem={(cw) => {
                  return (
                    <div 
                      key={cw.id}
                      className={selectedUser?.id === cw.id ? `${styles.userBlock} ${styles.selected}` : styles.userBlock}
                      onClick={() => {
                        setSelectedUser({ id: cw.from_user_id, username: cw.target_username} as User);
                        cw.is_read = true;
                      }}>
                      <img src={`${process.env.serverBaseUrl}/api/profile/avatar/${cw.from_user_id}`}/>

                      <div>
                        <strong>{cw.target_username}</strong>
                        <small>{cw.from_user_id}</small>
                      </div>

                      {!cw.is_read && <p className={styles.dot}></p>}
                    </div>
                  );
                }}
              />
            </div>

            {selectedUser && <ChatBox key={selectedUser.id} targetUser={selectedUser} onClose={() => setSelectedUser(null)} />}
          </div>
        )
      }
    </>
  );
}