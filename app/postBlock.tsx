'use client'

import Link from 'next/link';
import styles from './postBlock.module.css';
import LikeButton from './likeButton';
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
    document.documentElement.style.overflow = 'hidden';
    setCurrentIndex(index);
    setShowModal(true);
  };

  const closeViewer = () => {
    document.documentElement.style.overflow = '';
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
                style={{ maxHeight: '80vh', maxWidth: '100%', borderRadius: '10px', cursor: 'pointer' }}
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
          <div className={styles.modal} onClick={closeViewer}>
            {/* Navigation buttons */}
            {mediaPaths.length > 1 && (
                <button
                  className={styles.modalNavBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    prevMedia();
                  }}
                >
                  <FaAngleLeft />
                </button>
            )}

            {/* Actual media preview */}
            {isImage(mediaPaths[currentIndex]) ? (
              <img
                src={`http://${window.location.hostname}:${process.env.serverPort}${mediaPaths[currentIndex]}`}
                alt='modal-img'
                style={{ maxHeight: '100vh', maxWidth: '90%', borderRadius: '10px' }}
              />
            ) : (
              <video
                src={`http://${window.location.hostname}:${process.env.serverPort}${mediaPaths[currentIndex]}`}
                controls
                preload='metadata'
                style={{ maxWidth: '80%', maxHeight: '100vh' }}
              />
            )}

            {mediaPaths.length > 1 && (
              <button
                className={styles.modalNavBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  nextMedia();
                }}
              >
                <FaAngleRight />
              </button>
            )}
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