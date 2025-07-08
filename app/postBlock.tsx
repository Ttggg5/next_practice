'use client'

import Link from 'next/link';
import styles from './postBlock.module.css';
import LikeButton from './like-button';
import { useEffect, useRef, useState } from 'react';

enum PostType {
  text = 'text',
  image = 'image',
  video = 'video'
}

export interface MeRespon {
  isLoggedIn: boolean,
  userId: string
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: PostType;
  like_count: number;
  dislike_count: number;
  share_count: number;
  created_at: Date;
  comment_count: number;
  username: string;
}

export default function PostBlock({ post, meRespon }: { post: Post, meRespon: MeRespon | null }) {
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fetchedRef = useRef(false); // ✅ block duplicate fetch
  
  
    useEffect(() => {
      if (post.post_type != PostType.text) {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
    
        // fetch media of post
        fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/posts/${post.id}/media`, { credentials: 'include' })
          .then(async (res) => {
            if (!res.ok)
              throw new Error('Failed to fetch media');
            return res.json();
          })
          .then((data: string[]) => {
            setMediaPaths(data);
          });
      }
    });

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setShowModal(true);
  };

  const closeViewer = () => {
    setShowModal(false);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaPaths.length) % mediaPaths.length);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaPaths.length);
  };

  let firstImage = '';
  let remainingCount = 0;
  if (mediaPaths.length > 0) {
    firstImage = mediaPaths[0];
    remainingCount = mediaPaths.length - 1;
  }


  return (
    <div key={post.id} className={styles.post}>
      <div className={styles.postUser}>
        <img alt="avatar" src={`http://${window.location.hostname}:${process.env.serverPort}/api/profile/avatar/${post.user_id}`}></img>
        <Link href={`/profile/${post.user_id}`}>
          <strong>{post.username}</strong>
          <small>{post.user_id}</small>
        </Link>
      </div>

      <p>{post.content}</p>

      {post.post_type === PostType.image && (
        <div className={styles.mediaContainer}>
          {/* Thumbnail */}
          <div
            style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
            onClick={() => openViewer(0)}
          >
            <img src={`http://${window.location.hostname}:${process.env.serverPort}${firstImage}`} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
            {remainingCount > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                +{remainingCount} more
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div onClick={closeViewer} style={{
              position: 'fixed', top: 0, left: 0, width: '100%',
              height: '100%', backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}>
              {remainingCount > 0 && (
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className={styles.navButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" fill='currentColor'>
                    <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"/>
                  </svg>
                </button>
              )}
              <img
                src={`http://${window.location.hostname}:${process.env.serverPort}${mediaPaths[currentIndex]}`}
                alt="Full"
                style={{ maxHeight: '90vh', maxWidth: '80%', margin: '0 20px' }}
                onClick={(e) => e.stopPropagation()}
              />
              {remainingCount > 0 && (
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className={styles.navButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" fill='currentColor'>
                    <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      <small>{new Date(post.created_at).toLocaleString()}</small>

      <div className={styles.actionsBar}>
        <LikeButton isUserLogin={meRespon?.isLoggedIn ? true : false} count={post.like_count} postId={post.id}></LikeButton>
      </div>
    </div>
  )
}