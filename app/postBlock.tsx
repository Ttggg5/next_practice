'use client'

import Link from 'next/link';
import styles from './postBlock.module.css';
import LikeButton from './likeButton';
import { useEffect, useRef, useState } from 'react';
import LazyVideo from './lazyVideo';
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import PostOptions from './postOptions';
import { useMessageStore, MessageType } from '@/store/useMessageStore'
import CommentButton from './commentButton';
import Loading from './loading';
import PostMaker from './postMaker';
import { constrainedMemory } from 'process';
import { VscFoldUp, VscFoldDown  } from "react-icons/vsc";

export interface MeRespon {
  isLoggedIn: boolean;
  userId: string;
  username: string;
  email: string;
  bio: string | null;
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

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: Date;
  username: string;
}

const isImage = (filename: string) => /\.(jpe?g|png|gif|webp)$/i.test(filename);
//const isVideo = (filename: string) => /\.(mp4|webm|ogg)$/i.test(filename);

export default function PostBlock({
  post,
  curLogin,
  onDeleted,
}: {
  post: Post,
  curLogin: MeRespon | null,
  onDeleted?: (id: string) => void;
}) {
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [foldButton, setFoldButton] = useState(false);
  const [foldContent, setFoldContent] = useState(false);
  const contentRef = useRef<HTMLParagraphElement | null>(null);

  const addMessage = useMessageStore((state) => state.addMessage);

  const copyLink = () => {
    const el = document.createElement('textarea');
    el.value = `${location.origin}/post/${post.id}`;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, el.value.length); // for ios
    document.execCommand('copy');
    document.body.removeChild(el);
    addMessage('Link coppied', MessageType.info);

    //this is only for https
    //navigator.clipboard.writeText(`${location.origin}/post/${post.id}`);
  };

  const deletePost = async () => {
    if (!confirm('Delete this post permanently?')) return;

    const res = await fetch(`${process.env.serverBaseUrl}/api/posts/${post.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      // Notify parent list to remove the post
      onDeleted?.(post.id);
      addMessage('Post delete', MessageType.success);
    } else {
      addMessage('Failed to delete post', MessageType.error);
    }
  };

  const options = curLogin?.userId === post.user_id ?
    [
      { label: 'Copy link', onClick: copyLink },
      { label: 'Edit post', onClick: () => setShowEditModal(true) },
      { label: 'Delete', onClick: deletePost, danger: true }
    ]
    : [{ label: 'Copy link', onClick: copyLink }]

  useEffect(() => {
    // fetch media of post
    fetch(`${process.env.serverBaseUrl}/api/posts/${post.id}/media`, { credentials: 'include' })
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

  useEffect(() => {
    if (showEditModal || showModal)
      document.documentElement.style.overflow = 'hidden';
    else
      document.documentElement.style.overflow = '';
  }, [showEditModal, showModal]);

  useEffect(() => {
    if ((contentRef.current?.offsetHeight ?? 0) > 200) {
      setFoldButton(true);
      setFoldContent(true);
    }
  }, []);

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setLoadingMedia(true);
    setShowModal(true);
  };

  const closeViewer = () => {
    setLoadingMedia(false);
    setShowModal(false);
  };

  const prevMedia = () => {
    setLoadingMedia(true);
    setCurrentIndex((prev) => (prev - 1 + mediaPaths.length) % mediaPaths.length);
  };

  const nextMedia = () => {
    setLoadingMedia(true);
    setCurrentIndex((prev) => (prev + 1) % mediaPaths.length);
  };

  return (
    <div key={post.id} className={styles.post}>
      <div className={styles.optionBtn}>
        <PostOptions options={options} />
      </div>

      <div className={styles.postUser}>
        <img alt="avatar" src={`${process.env.serverBaseUrl}/api/profile/avatar/${post.user_id}`}></img>
        <Link href={`/profile/${post.user_id}`}>
          <strong>{post.username}</strong>
          <small>{post.user_id}</small>
        </Link>
      </div>

      <p ref={contentRef} className={foldContent ? styles.fold : ''}>{post.content}</p>
      {foldButton && 
        <button className={styles.foldBtn} onClick={(e) => {
          if (foldContent)
            e.currentTarget.innerHTML = 'Fold content';
          else
            e.currentTarget.innerHTML = 'Read all';
          setFoldContent(!foldContent);
        }}>Read all</button>
      }

      <div className={styles.mediaContainer}>
        {mediaPaths.length > 0 && (() => {
          const mediaList = mediaPaths; // mix of image/video paths
          const showMedia = mediaList.slice(0, 4);
          const extraCount = mediaList.length - 4;

          // Single media
          if (mediaList.length === 1) {
            const fullUrl = `${process.env.serverBaseUrl}${mediaList[0]}`;
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
                const fullUrl = `${process.env.serverBaseUrl}${media}`;
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
                style={{
                  position: 'absolute',
                  left: '20px'
                }}
              >
                <FaAngleLeft />
              </button>
            )}

            {/* Actual media preview */}
            {isImage(mediaPaths[currentIndex]) ? (
              <img
                src={`${process.env.serverBaseUrl}${mediaPaths[currentIndex]}`}
                alt='modal-img'
                style={{ maxHeight: '100vh', maxWidth: '90%', borderRadius: '10px' }}
                onLoad={() => setLoadingMedia(false)}
              />
            ) : (
              <video
                src={`${process.env.serverBaseUrl}${mediaPaths[currentIndex]}`}
                controls
                preload='metadata'
                style={{ maxWidth: '80%', maxHeight: '100vh' }}
                onLoadedData={() => setLoadingMedia(false)}
              />
            )}

            {loadingMedia && <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#000000a2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading /></div>}

            {mediaPaths.length > 1 && (
              <button
                className={styles.modalNavBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  nextMedia();
                }}
                style={{
                  position: 'absolute',
                  right: '20px'
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
        <CommentButton
          postId={post.id}
          count={post.comment_count}
          curLogin={curLogin}
        />
        <LikeButton isUserLogin={curLogin?.isLoggedIn ? true : false} count={post.like_count} postId={post.id}></LikeButton>
      </div>

      {showEditModal && (
        <div className={styles.editModal}>
          <div>
            <button onClick={() => setShowEditModal(false)}><IoClose /></button>
            <PostMaker postId={post.id}/>
          </div>
        </div>
      )}
    </div>
  );
}