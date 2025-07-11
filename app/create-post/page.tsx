'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import { MeRespon } from '@/app/postBlock';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { RiImageAddFill } from "react-icons/ri";
import { BiSolidVideoPlus } from "react-icons/bi";
import { MdOutlinePostAdd } from "react-icons/md";

interface CreateRespon {
  message: string;
  postId: string | null;
}

export default function Page() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...fileArray]);

    const urls = fileArray.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...urls]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('content', content);
    selectedFiles.forEach(file => formData.append('files', file));

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
          setSelectedFiles([]);
          setPreviews([]);
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
          <label>Content:</label>
          <div className={styles.inputContainer}>
            <textarea
              className={styles.content}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Write something..."
            />
            <div className={styles.fileInputs}>
              <label><RiImageAddFill /><input type="file" multiple onChange={(e) => handleFileChange(e)} accept={'image/*'} /></label>
              <label><BiSolidVideoPlus /><input type="file" multiple onChange={(e) => handleFileChange(e)} accept={'video/*'} /></label>
            </div>
          </div>

          <div className={styles.previewContainer}>
            {previews.map((url, index) => {
              const file = selectedFiles[index];
              const isImage = file.type.startsWith('image/');
              const isVideo = file.type.startsWith('video/');

              return (
                <div key={index} className={styles.preview}>
                  {isImage && <img src={url} alt={`preview-${index}`} />}
                  {isVideo && <video src={url} controls />}
                </div>
              );
            })}
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Posting...' : (<><MdOutlinePostAdd /> Post</>)}
          </button>
        </form>
      }
    </>
  );
}
