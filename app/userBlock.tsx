import Link from 'next/link';
import { MeRespon } from './postBlock';
import styles from './userBlock.module.css'
import FollowButton from './followButton';

export interface User {
  id: string;
  username: string;
}

export default function UserBlock({curLogin, user}: {curLogin: MeRespon | null, user: User}) {
  return (
    <div className={styles.userItem}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={`http://${location.hostname}:${process.env.serverPort}/api/profile/avatar/${user.id}`}
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