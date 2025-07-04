'use client'

import React, { useState } from 'react';
import styles from "./page.module.css";
import Link from 'next/link';

export default function Page() {
  const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
  const [btnDisabled, setBtnDisabled] = useState(false);

  const handleLogin = async () => {
    const res = await fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 🔐 important
      body: JSON.stringify(loginInfo),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <>
      <form onSubmit={e => {
        e.preventDefault();

        setBtnDisabled(true);
        handleLogin()
          .then(() => setBtnDisabled(false));
      }} className={styles.form}>
        <input type="email" placeholder="Email" onChange={e => setLoginInfo({ ...loginInfo, email: e.target.value })} required />
        <input type="password" placeholder="Password" onChange={e => setLoginInfo({ ...loginInfo, password: e.target.value })} required />
        <button type="submit" disabled={btnDisabled}>Login</button>
        <Link href='/forgot-password'>forgot password</Link>
        <Link href='/register'>register</Link>
      </form>
    </>
  );
}
