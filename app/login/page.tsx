'use client'

import React, { useEffect, useState } from 'react';
import styles from "./page.module.css";
import Link from 'next/link';
import { useMessageStore, MessageType } from '@/store/useMessageStore';
import { MeRespon } from '../postBlock';

export default function Page() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
  const [btnDisabled, setBtnDisabled] = useState(false);
  const addMessage = useMessageStore((state) => state.addMessage);

  useEffect(() => {
    // check login
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => {
        if (data.isLoggedIn) window.location.href = './';
        else setCurLogin(data);
      });
  }, []);

  const handleLogin = async () => {
    const res = await fetch(`${process.env.serverBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 🔐 important
      body: JSON.stringify(loginInfo),
    });
    const data = await res.json();
    if (!data.userId) {
      addMessage(data.message, MessageType.error);
    }
    else {
      addMessage(data.message, MessageType.success);
      window.location.href = './';
    }
  };

  return (
    <>
      {curLogin &&
        <form onSubmit={e => {
          e.preventDefault();

          setBtnDisabled(true);
          handleLogin()
            .then(() => setBtnDisabled(false));
        }} className={styles.form}>
          <input type="email" placeholder="Email" onChange={e => setLoginInfo({ ...loginInfo, email: e.target.value })} required />
          <input type="password" placeholder="Password" onChange={e => setLoginInfo({ ...loginInfo, password: e.target.value })} required />
          <button type="submit" disabled={btnDisabled} className={styles.submitBtn}>Login</button>
          <div className={styles.links}>
            <Link href='/forgot-password'>Forgot password</Link>
            <Link href='/register'>Register</Link>
          </div>
        </form>}
    </>
  );
}
