'use client'

import React, { useEffect, useState } from 'react';
import styles from "./page.module.css";
import { useMessageStore, MessageType } from '@/store/useMessageStore';
import Loading from '@/app/loading';
import { MeRespon } from '@/app/postBlock';
import Layout from '../layout'

export default function Page() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
  const [btnDisabled, setBtnDisabled] = useState(false);
  const addMessage = useMessageStore((state) => state.addMessage);

  useEffect(() => {
    // check login
    fetch(`${process.env.serverBaseUrl}/api/admin/auth/me`, { credentials: 'include' })
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
    const res = await fetch(`${process.env.serverBaseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 🔐 important
      body: JSON.stringify(loginInfo),
    });
    const data = await res.json();
    if (!data.success) {
      addMessage(data.message, MessageType.error);
    }
    else {
      addMessage('Login success', MessageType.success);
      window.location.href = './';
    }
  };

  return (
    <Layout>
      {curLogin &&
        <form onSubmit={e => {
          e.preventDefault();

          setBtnDisabled(true);
          handleLogin()
            .then(() => setBtnDisabled(false));
        }} className={styles.form}>
          <h2>Supervisor login</h2>
          <input type="email" placeholder="Email" onChange={e => setLoginInfo({ ...loginInfo, email: e.target.value })} required />
          <input type="password" placeholder="Password" onChange={e => setLoginInfo({ ...loginInfo, password: e.target.value })} required />
          <button type="submit" disabled={btnDisabled} className='submitBtn'>{btnDisabled && <Loading width={20} />}Login</button>
        </form>}
    </Layout>
  );
}
