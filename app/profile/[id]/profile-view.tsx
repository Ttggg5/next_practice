'use client'

import React, { useEffect, useState } from 'react';
import UploadAvatar from './upload-avatar';

interface Props {
  userId: string;
}

interface Profile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  location?: string;
}

const ProfileView: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  }, [userId]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <img src={`http://${window.location.hostname}:${process.env.serverPort}/api/profile/avatar/${userId}`} width={200} alt="avatar" />
      <UploadAvatar userId={userId}></UploadAvatar>
      <h2>{profile.username}</h2>
      {profile.bio && <p>{profile.bio}</p>}
      {profile.location && <p>{profile.location}</p>}
    </div>
  );
};

export default ProfileView;
