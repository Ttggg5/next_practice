'use client'

import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useMessageStore, MessageType } from '@/store/useMessageStore';
import styles from './page.module.css';
import Loading from '@/app/loading';

export default function Page() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [btnDisabled, setBtnDisabled] = useState(false);
  const addMessage = useMessageStore((state) => state.addMessage);

  const submit = async () => {
    if (password !== confirmPassword) {
        addMessage("Confirm password is not correct", MessageType.error);
        setBtnDisabled(false);
        return;
    }

    const res = await fetch(`${process.env.serverBaseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    addMessage(data.message || data.error, data.message ? MessageType.success : MessageType.error);
    setBtnDisabled(false);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();

      setBtnDisabled(true);
      submit();
    }} className={styles.form}>
      <h2>Reset Password</h2>
      <input type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required />
      <input type="password" placeholder='Confirm password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      <button className='submitBtn' type='submit' disabled={btnDisabled}>{btnDisabled && <Loading width={20}/>}Reset</button>
    </form>
  );
}