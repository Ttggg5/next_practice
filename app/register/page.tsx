'use client'

import React, { useState } from 'react';
import styles from "./page.module.css";

export default function Page() {
  const [registerInfo, setRegisterInfo] = useState({ id: '', username: '', email: '', password: '', confirmPassword: '' });
  const [btnDisabled, setBtnDisabled] = useState(false);

  const handleRegister = async () => {
    const res = await fetch(`${process.env.serverBaseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerInfo),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <>
      <form onSubmit={e => {
        e.preventDefault();

        setBtnDisabled(true);
        if (registerInfo.password !== registerInfo.confirmPassword) {
          alert("Confirm password is not correct");
          setBtnDisabled(false)
          return;
        }
        handleRegister()
          .then(() => setBtnDisabled(false));
      }} className={styles.form}>
        <h2>🔐 Register</h2>
        <div>
          <label>@</label>
          <input placeholder="Id" onChange={e => setRegisterInfo({ ...registerInfo, id: e.target.value })} required />
        </div>
        <input placeholder="Username" onChange={e => setRegisterInfo({ ...registerInfo, username: e.target.value })} required />
        <input type="email" placeholder="Email" onChange={e => setRegisterInfo({ ...registerInfo, email: e.target.value })} required />
        <input type="password" placeholder="Password" onChange={e => setRegisterInfo({ ...registerInfo, password: e.target.value })} required />
        <input type="password" placeholder="Confirm password" onChange={e => setRegisterInfo({ ...registerInfo, confirmPassword: e.target.value })} required />
        <button type="submit" disabled={btnDisabled}>Register</button>
      </form>
    </>
  );
}