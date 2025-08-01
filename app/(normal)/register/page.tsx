'use client'

import React, { useState } from 'react';
import styles from "./page.module.css";
import Link from 'next/link';
import { useMessageStore, MessageType } from '@/store/useMessageStore';
import Loading from '@/app/loading';

export default function Page() {
  const [registerInfo, setRegisterInfo] = useState({ id: '', username: '', email: '', password: '', confirmPassword: '' });
  const [btnDisabled, setBtnDisabled] = useState(false);
  const addMessage = useMessageStore((state) => state.addMessage);

  const handleRegister = async () => {
    const res = await fetch(`${process.env.serverBaseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerInfo),
    });
    const data = await res.json();
    addMessage(data.message || data.error, data.message ? MessageType.success : MessageType.error);
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
        <h2>Register</h2>
        <div>
          <label>@</label>
          <input placeholder="Id" onChange={e => setRegisterInfo({ ...registerInfo, id: e.target.value })} required style={{flexGrow: 1, marginTop: 0, marginLeft: 10}} />
        </div>
        <input placeholder="Username" onChange={e => setRegisterInfo({ ...registerInfo, username: e.target.value })} required />
        <input type="email" placeholder="Email" onChange={e => setRegisterInfo({ ...registerInfo, email: e.target.value })} required />
        <input type="password" placeholder="Password" onChange={e => setRegisterInfo({ ...registerInfo, password: e.target.value })} required />
        <input type="password" placeholder="Confirm password" onChange={e => setRegisterInfo({ ...registerInfo, confirmPassword: e.target.value })} required />

        <button className='submitBtn' type="submit" disabled={btnDisabled}>{btnDisabled && <Loading width={20}/>}Register</button>

        <p style={{marginTop: 10}}>Already have an account? <Link href='/login' style={{color: 'var(--main)'}}>Login</Link></p>
      </form>
    </>
  );
}