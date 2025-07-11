'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
}

export default function FollowerList({ params }: { params: { id: string } }) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);

  const userId = decodeURIComponent(params.id);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/user/${encodeURIComponent(userId)}/followers`)
      .then(res => res.json())
      .then(setFollowers);

    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/user/${encodeURIComponent(userId)}/following`)
      .then(res => res.json())
      .then(setFollowing);
  }, [userId]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{userId}'s Followers</h2>
      <ul>
        {followers.map(user => (
          <li key={user.id}>
            <img src={`http://${window.location.hostname}:${process.env.serverPort}/api/profile/avatar/${user.id}`} alt="" width={32} height={32} />
            <Link href={`/profile/${user.id}`}>{user.username}</Link>
          </li>
        ))}
      </ul>

      <h2>Following</h2>
      <ul>
        {following.map(user => (
          <li key={user.id}>
            <img src={`http://${window.location.hostname}:${process.env.serverPort}/api/profile/avatar/${user.id}`} alt="" width={32} height={32} />
            <Link href={`/profile/${user.id}`}>{user.username}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
