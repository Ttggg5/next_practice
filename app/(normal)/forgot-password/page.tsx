'use client'

import React, { useState } from 'react';
import styles from './page.module.css';
import { MessageType, useMessageStore } from '@/store/useMessageStore';
import Loading from '@/app/loading';

export default function Page() {
  const [email, setEmail] = useState('');
  const addMessage = useMessageStore((state) => state.addMessage);
  const [btnDisabled, setBtnDisabled] = useState(false);

  const submit = async () => {
    const res = await fetch(`${process.env.serverBaseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    addMessage(data.message || data.error, data.message ? MessageType.success : MessageType.error);
    setBtnDisabled(false);
  };

  return (
    <form className={styles.form} onSubmit={(e) => {
      e.preventDefault();

      setBtnDisabled(true);
      submit();
    }}>
      <h2>Forgot Password</h2>
      <input value={email} type='email' placeholder='Email' onChange={e => setEmail(e.target.value)} required />
      <button className='submitBtn' disabled={btnDisabled}>{btnDisabled && <Loading width={20}/>}Send Reset Link</button>
    </form>
  );
};