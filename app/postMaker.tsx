'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import { MeRespon, Post } from '@/app/postBlock';
import styles from './postMaker.module.css';
import { useRouter } from 'next/navigation';
import { RiImageAddFill } from "react-icons/ri";
import { BiSolidVideoPlus } from "react-icons/bi";
import { MdOutlinePostAdd } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Loading from './loading';

interface CreateRespon {
  success: boolean;
  message: string;
  postId: string | null;
}

const isImage = (filename: string) => /\.(jpe?g|png|gif|webp)$/i.test(filename);

// if postId is not null, that means it in edit mode
export default function PostMaker({ postId }: { postId?: string }) {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);
  const [serverMedia, setServerMedia] = useState<string[]>([]); // from API
  const [deletedServerMedia, setDeletedServerMedia] = useState<string[]>([]);

  const addMessage = useMessageStore((state) => state.addMessage);

  useEffect(() => {
    // check login
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
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

  useEffect(() => {
    // get post content if postId exist
    if (postId) {
      fetch(`${process.env.serverBaseUrl}/api/posts/${postId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data: Post) => setContent(data.content));

      fetch(`${process.env.serverBaseUrl}/api/posts/${postId}/media`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data: {urls: string[]}) => {
          if (data.urls)
            setServerMedia(data.urls.map((url) => `${process.env.serverBaseUrl}${url}`));
        });
    }
  }, [curLogin]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...fileArray]);

    const urls = fileArray.map(file => URL.createObjectURL(file));
    setLocalPreviews((prev) => [...prev, ...urls]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('content', content);
    deletedServerMedia.forEach(url => formData.append('deletedMedia', url));
    selectedFiles.forEach(file => formData.append('files', file));

    const url = postId
      ? `${process.env.serverBaseUrl}/api/posts/${postId}`
      : `${process.env.serverBaseUrl}/api/posts/create`;

    const method = postId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: formData,
        credentials: 'include'
      });

      const data: CreateRespon = await res.json();
      setLoading(false);

      if (postId) {
        if (data.success) {
          addMessage('Post edit success', MessageType.success);
          setTimeout(() => window.location.href = '/', 1000);
          
        } else {
          addMessage(data.message, MessageType.error);
        }
        return;
      }

      if (data.postId) {
        addMessage(data.message, MessageType.success);
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        addMessage(data.message, MessageType.error);
      }
    } catch (err) {
      setLoading(false);
      addMessage('Something went wrong', MessageType.error);
    }
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
              rows={10}
              placeholder="Write something..."
            />
            <div className={styles.fileInputs}>
              <label><RiImageAddFill /><input type="file" multiple onChange={(e) => handleFileChange(e)} accept={'image/jpg, image/jpeg, image/png, image/webp, image/gif'} /></label>
              <label><BiSolidVideoPlus /><input type="file" multiple onChange={(e) => handleFileChange(e)} accept={'video/mp4, video/webm'} /></label>
            </div>
          </div>

          <div className={styles.previewContainer}>
            {/* Existing server media */}
            {serverMedia.map((url, index) => (
              <div key={`server-${index}`} className={styles.preview}>
                <button
                  type='button'
                  className={styles.cancelBtn}
                  onClick={() => {
                    setDeletedServerMedia(prev => [...prev, serverMedia[index]]);
                    setServerMedia(prev => prev.filter((_, i) => i !== index));
                  }}
                ><IoClose /></button>
                {isImage(url) ? (
                  <img src={url} alt={`preview-server-${index}`} />
                ) : (
                  <video src={url} controls />
                )}
              </div>
            ))}

            {/* New local media */}
            {localPreviews.map((url, index) => {
              const file = selectedFiles[index];
              const isImage = file.type.startsWith('image/');
              const isVideo = file.type.startsWith('video/');

              return (
                <div key={`local-${index}`} className={styles.preview}>
                  <button
                    type='button'
                    className={styles.cancelBtn}
                    onClick={() => {
                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      setLocalPreviews(prev => prev.filter((_, i) => i !== index));
                    }}
                  ><IoClose /></button>
                  {isImage && <img src={url} alt={`preview-${index}`} />}
                  {isVideo && <video src={url} controls />}
                </div>
              );
            })}
        </div>


          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <Loading /> : <><MdOutlinePostAdd /> {postId ? 'Edit' : 'Post'}</>}
          </button>
        </form>
      }
    </>
  );
}
