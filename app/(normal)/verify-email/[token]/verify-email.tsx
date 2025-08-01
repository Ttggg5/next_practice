'use client'

import React, { useEffect, useRef, useState } from 'react';

interface Props {
  token: string;
}

const VerifyEmail: React.FC<Props> = ({ token }) => {
  const [message, setMessage] = useState('Verifying...');
  const calledRef = useRef(false); // <-- prevent double call

  useEffect(() => {
    if (!token) {
      setMessage('❌ No token provided.');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        const res = await fetch(`${process.env.serverBaseUrl}/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
          setMessage('✅ Email verified successfully!');
        } else {
          setMessage(`❌ Verification failed: ${data.message}`);
        }
      } catch {
        setMessage('❌ An error occurred during verification.');
      }
    };

    verify();
  }, [token]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
