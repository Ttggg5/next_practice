'use client'

import React, { useState } from 'react';

export default function Page() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    const res = await fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <input value={email} placeholder='Email' onChange={e => setEmail(e.target.value)} />
      <button onClick={submit}>Send Reset Link</button>
      <p>{message}</p>
    </div>
  );
};