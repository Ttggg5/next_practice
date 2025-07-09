'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import { MeRespon, PostType } from '@/app/postBlock';
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
  const [type, setType] = useState<PostType>(PostType.text);
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
    formData.append('postType', type);
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
          setType(PostType.text);
          addMessage(res.message, MessageType.success);
          router.push('./');
        } else {
          addMessage(res.message, MessageType.error);
        }
      });
  };

  return (
    <div className={styles.page}>
      {curLogin &&
        <form onSubmit={handleSubmit}>
          <div>
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label>Content:</label><br />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              style={{ width: '100%', marginTop: '0.5rem' }}
              placeholder="Write something..."
            />
          </div>

          {type !== 'text' && (
            <div>
              <label>Media Files:</label><br />
              <input type="file" multiple onChange={handleFileChange} accept={type === 'image' ? 'image/*' : 'video/*'} />
            </div>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      }
    </div>
  );
}
