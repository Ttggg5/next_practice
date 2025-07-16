'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import styles from './page.module.css';
import { MeRespon } from '@/app/postBlock';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import AvatarCropper from './avatarCropper';
import { MdEdit } from "react-icons/md";
import Loading from '@/app/loading';

export default function Page() {
  const [me, setMe] = useState<MeRespon | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPrev] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const addMessage = useMessageStore((state) => state.addMessage);

  /* fetch current profile */
  useEffect(() => {
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(r => r.json())
      .then((u: MeRespon) => {
        if (!u.isLoggedIn)
          return window.location.href = `../login`;

        setMe(u);
        setUsername(u.username);
        setBio(u.bio ?? '');
      });
  }, []);

  const onFileChange = (e: any) => {
    const f = e.target.files?.[0];
    if (f) setCropSrc(URL.createObjectURL(f)); // open crop modal
  }

  const chooseFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'
    input.addEventListener('change', onFileChange);
    input.click();
  }

  const handleCropped = (blob: Blob, previewUrl: string) => {
    setFile(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
    setPrev(previewUrl);
    setCropSrc(null); // close modal
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) return;

    const fd = new FormData();
    fd.append('username', username);
    fd.append('bio', bio);
    if (file) fd.append('avatar', file);

    setSaving(true);
    const res = await fetch(`${process.env.serverBaseUrl}/api/profile/edit`, {
      method: 'PUT',
      body: fd,
      credentials: 'include'
    });
    setSaving(false);

    if (res.ok) {
      addMessage('Profile updated!', MessageType.success);
      setTimeout(() => window.location.reload(), 1000);
    }
    else addMessage('Failed to update profile', MessageType.error);
  };

  if (!me) return <p>Loading…</p>;

  return (
    <div className={styles.wrap}>
      <h2>Edit profile</h2>
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.avatar}>
          <img
            src={
              preview ??
              `${process.env.serverBaseUrl}/api/profile/avatar/${encodeURIComponent(me.userId)}?${Date.now()}`
            }
            alt='avatar'
          />
          <button type='button' onClick={chooseFile}><MdEdit /></button>
        </div>

        <label className={styles.username}>
          Username<br />
          <input value={username} onChange={(e) => setUsername(e.target.value)} max={50} />
        </label>

        <label className={styles.bio}>
          Bio<br />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} maxLength={300} />
        </label>

        <button className={styles.submitBtn} type='submit' disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>

      {cropSrc && (
        <AvatarCropper
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
}
