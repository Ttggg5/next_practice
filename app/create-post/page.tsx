'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import { MeRespon } from '@/app/postBlock';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

interface CreateRespon {
  message: string;
  postId: string | null;
}

export default function Page() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const addMessage = useMessageStore((state) => state.addMessage);
  const router = useRouter();

  useEffect(() => {
    // check login
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => {
        if (!data.isLoggedIn) window.location.href = './';
        else setCurLogin(data);
      });
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('content', content);
    files.forEach(file => formData.append('files', file));

    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/posts/create`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((res: CreateRespon) => {
        setLoading(false);
        if (res.postId) {
          setContent('');
          setFiles([]);
          addMessage(res.message, MessageType.success);
          router.push('./');
        } else {
          addMessage(res.message, MessageType.error);
        }
      });
  };

  return (
    <>
      {curLogin &&
        <form className={styles.createPostForm} onSubmit={handleSubmit}>
          <div>
            <label>Content:</label><br />
            <textarea
              className={styles.content}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Write something..."
            />
          </div>

          <div className={styles.fileInputs}>
            <input type="file" multiple onChange={(e) => handleFileChange(e)} accept={'image/*'} />
            <input type="file" multiple onChange={(e) => handleFileChange(e)} accept={'video/*'} />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      }
    </>
  );
}
