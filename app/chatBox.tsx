'use client';

import { useEffect, useRef, useState } from 'react';
import socket from '@/lib/socket';
import styles from './chatBox.module.css';
import { IoSend, IoClose } from "react-icons/io5";
import { User } from './userBlock';
import { MeRespon } from './postBlock';

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  created_at: Date;
}

export default function ChatBox({ targetUser, onClose }: { targetUser: User, onClose?: () => void }) {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const historyRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Load login info
  useEffect(() => {
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => res.json())
      .then((data: MeRespon) => setCurLogin(data));
  }, []);

  // Set all messages to read
  const allMessageRead = () => {
    fetch(`${process.env.serverBaseUrl}/api/chat/read`, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ targetUserId: targetUser.id })
    });
  };

  useEffect(() => {
    if (!curLogin || !targetUser) return;
    allMessageRead();
  }, [curLogin, targetUser]);

  // Fetch paged messages
  const fetchMessages = async (pageNum: number, prepend = false) => {
    if (!curLogin || !hasMore || isLoadingRef.current) return;
    isLoadingRef.current = true;

    const res = await fetch(`${process.env.serverBaseUrl}/api/chat/history/${targetUser.id}?page=${pageNum}&limit=50`, { credentials: 'include' });
    const newMsgs = (await res.json() as Message[]).reverse();
    
    if (newMsgs.length === 0) setHasMore(false);

    setMessages(prev => prepend ? [...newMsgs, ...prev] : [...prev, ...newMsgs]);
    setPage(pageNum + 1);
    isLoadingRef.current = false;
  };

  // Scroll event listener
  useEffect(() => {
    const div = historyRef.current;
    if (!div) return;

    const handleScroll = () => {
      if (div.scrollTop === 0 && hasMore) {
        const prevScrollHeight = div.scrollHeight;
        fetchMessages(page, true).then(() => {
          requestAnimationFrame(() => {
            const newScrollHeight = div.scrollHeight;
            div.scrollTop = newScrollHeight - prevScrollHeight;
          });
        });
      }
    };

    div.addEventListener('scroll', handleScroll);
    return () => div.removeEventListener('scroll', handleScroll);
  }, [page, hasMore]);

  // Initial fetch
  useEffect(() => {
    if (!curLogin || !targetUser) return;

    setMessages([]);
    setPage(1);
    setHasMore(true);

    fetchMessages(1)
      .then(() => {
        const el = historyRef.current;
        if (el && el.scrollHeight <= el.clientHeight && hasMore) {
          fetchMessages(2, true)
            .then(() => {
              scrollToBottom();
            });
        }
        scrollToBottom();
      });
  }, [curLogin, targetUser]);

  // Socket
  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
      allMessageRead();
    };
    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [curLogin?.userId]);

  const sendMessage = () => {
    if (!input.trim() || !curLogin) return;

    const message: Message = {
      id: '',
      from_user_id: curLogin.userId,
      to_user_id: targetUser.id,
      content: input,
      created_at: new Date()
    };

    socket.emit('send-message', message);
    setMessages(prev => [...prev, message]);
    setInput('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const div = historyRef.current;
      if (div) div.scrollTop = div.scrollHeight;
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3>Chat with {targetUser.id}</h3>
        <button className={styles.closeBtn} onClick={onClose}><IoClose /></button>
      </div>

      <div className={styles.historyWrapper} ref={historyRef}>
        <div></div>
        {messages.map((msg, i) => (
          <div key={i} className={msg.from_user_id === curLogin?.userId ? `${styles.msgBlock} ${styles.mineMsgBlock}` : styles.msgBlock}>
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
        <button onClick={sendMessage}><IoSend style={{ fontSize: '20px' }} /></button>
      </div>
    </div>
  );
}
