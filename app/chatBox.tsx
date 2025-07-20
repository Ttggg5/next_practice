'use client'

import { useEffect, useState } from 'react';
import socket from '@/lib/socket';
import styles from './chatBox.module.css'
import { IoSend } from "react-icons/io5";
import { User } from './userBlock';
import { MeRespon } from './postBlock';

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  created_at: Date;
}

export default function ChatBox({ targetUser }: { targetUser: User }) {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // check login
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => {
        setCurLogin(data);
      });
  }, []);

  // 🧠 Load chat history
  useEffect(() => {
    setMessages([]);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${process.env.serverBaseUrl}/api/chat/messages/${curLogin?.userId}/${targetUser.id}`);
        setMessages(await res.json() as Message[]);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    if (curLogin) fetchMessages();
  }, [curLogin]);

  // connect to chat socket server
  useEffect(() => {
    socket.connect();

    socket.emit('register', curLogin?.userId);

    const handleReceiveMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('receive message', handleReceiveMessage);

    return () => {
      socket.off('receive message', handleReceiveMessage);
      socket.disconnect();
    };
  }, [curLogin?.userId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!curLogin) return;

    const message: Message = {
      id: '',
      from_user_id: curLogin?.userId,
      to_user_id: targetUser.id,
      content: input,
      created_at: new Date()
    };

    socket.emit('send message', message);

    setMessages((prev) => [...prev, message]);
    setInput('');
  };

  return (
    <div className={styles.wrapper}>
      <h3>Chat with {targetUser.id}</h3>

      <div className={styles.historyWrapper}>
        {messages.map((msg, i) => (
          <div key={i} className={msg.from_user_id === curLogin?.userId ? `${styles.msgBlock} ${styles.mineMsgBlock}` : styles.msgBlock} >
            <span>{msg.content}</span>
          </div>
        ))}
      </div>

      <div className={styles.inputWrapper}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message"
        />
        <button onClick={sendMessage}><IoSend style={{ fontSize: '20px' }}/></button>
      </div>
    </div>
  );
}
