import Link from 'next/link';
import { MeRespon } from './postBlock';
import styles from './userBlock.module.css'
import FollowButton from './followButton';
import { useEffect, useState } from 'react';

export interface User {
  id: string;
  username: string;
}

export default function UserBlock({curLogin, user}: {curLogin: MeRespon | null, user: User}) {
  const [updateTime, setUpdateTime] = useState<Date>(new Date(0));

  useEffect(() => {
    fetch(`${process.env.serverBaseUrl}/api/profile/update-time/${user.id}`, { credentials: 'include' })
      .then((respon) => respon.json())
      .then((ut) => setUpdateTime(ut.update_at));
  }, []);

  return (
    <div className={styles.userItem}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={`${process.env.serverBaseUrl}/api/profile/avatar/${user.id}?${updateTime.valueOf()}`}
          alt="avatar"
        />

        <Link key={user.id} href={`/profile/${encodeURIComponent(user.id)}`}>
          <div className={styles.userInfo}>
            <strong>{user.username}</strong>
            <small>{user.id}</small>
          </div>
        </Link>
      </div>

      {curLogin?.userId !== user.id && <FollowButton curLogin={curLogin} followingUserId={user.id} />}
    </div>
  );
}