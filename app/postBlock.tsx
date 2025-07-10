'use client'

import Link from 'next/link';
import styles from './postBlock.module.css';
import LikeButton from './like-button';
import { useEffect, useState } from 'react';
import LazyVideo from './lazyVideo';
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";

export interface MeRespon {
  isLoggedIn: boolean,
  userId: string
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  like_count: number;
  dislike_count: number;
  share_count: number;
  created_at: Date;
  comment_count: number;
  username: string;
}

const isImage = (filename: string) => /\.(jpe?g|png|gif|webp)$/i.test(filename);
const isVideo = (filename: string) => /\.(mp4|webm|ogg)$/i.test(filename);

export default function PostBlock({ post, meRespon }: { post: Post, meRespon: MeRespon | null }) {
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // fetch media of post
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/posts/${post.id}/media`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch media');
        return res.json();
      })
      .then((data) => {
        if (data.urls) {
          setMediaPaths(data.urls);
        }
      });
  }, []);

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setShowModal(true);
  };

  const closeViewer = () => {
    setShowModal(false);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaPaths.length) % mediaPaths.length);
  };

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaPaths.length);
  };

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

      <div className={styles.mediaContainer}>
        {mediaPaths.length > 0 && (() => {
          const mediaList = mediaPaths; // mix of image/video paths
          const showMedia = mediaList.slice(0, 4);
          const extraCount = mediaList.length - 4;

          // Single media
          if (mediaList.length === 1) {
            const fullUrl = `http://${window.location.hostname}:${process.env.serverPort}${mediaList[0]}`;
            const media = mediaList[0];

            return isImage(media) ? (
              <img
                src={fullUrl}
                alt="single"
                style={{ width: '100%', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => openViewer(0)}
              />
            ) : (
              <LazyVideo src={fullUrl} />
            );
          }

          // Grid of media
          return (
            <div className={styles.mediaGrid}>
              {showMedia.map((media, index) => {
                const fullUrl = `http://${window.location.hostname}:${process.env.serverPort}${media}`;
                const isLast = index === 3 && extraCount > 0;

                return (
                  <div
                    key={index}
                    className={styles.mediaItem}
                    onClick={() => openViewer(index)}
                  >
                    {isImage(media) ? (
                      <img src={fullUrl} alt={`media-${index}`} />
                    ) : (
                      <>
                        <video src={fullUrl} preload="metadata" muted />
                        <div className={styles.playOverlay}><FaVideo /> Video</div>
                      </>
                    )}

                    {/* Overlay count for 4+ */}
                    {isLast && (
                      <div className={styles.overlayCount}>+{extraCount}</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {showModal && (
          <div
            onClick={closeViewer}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            {/* Navigation buttons */}
            {mediaPaths.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevMedia();
                  }}
                  style={{
                    position: 'absolute',
                    left: '20px',
                    fontSize: '2rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <FaAngleLeft />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextMedia();
                  }}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    fontSize: '2rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <FaAngleRight />
                </button>
              </>
            )}

            {/* Actual media preview */}
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', maxWidth: '80%', maxHeight: '80%', justifyContent: 'center' }}>
              {isImage(mediaPaths[currentIndex]) ? (
                <img
                  src={`http://${window.location.hostname}:${process.env.serverPort}${mediaPaths[currentIndex]}`}
                  alt="modal-img"
                  style={{ maxWidth: '80%', maxHeight: '80%', borderRadius: '10px' }}
                />
              ) : (
                <LazyVideo src={`http://${window.location.hostname}:${process.env.serverPort}${mediaPaths[currentIndex]}`} />
              )}
            </div>
          </div>
        )}
      </div>

      <small>{new Date(post.created_at).toLocaleString()}</small>

      <div className={styles.actionsBar}>
        <LikeButton isUserLogin={meRespon?.isLoggedIn ? true : false} count={post.like_count} postId={post.id}></LikeButton>
      </div>
    </div>
  )
}