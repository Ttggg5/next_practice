'use client'

import Image from "next/image";
import Link from 'next/link'
import styles from './page.module.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Loading from '@/app/loading';
import LikeButton from "./like-button";
import PageNavBar from "./page-nav-bar";

enum PostType {
  text = 'text',
  image = 'image',
  video = 'video'
}

interface LoginRespon {
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

export default function Home() {
  const [loginRespon, setLoginRespon] = useState<LoginRespon | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false); // ✅ block duplicate fetch

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // check login
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: LoginRespon) => {
        setLoginRespon(data);
      });
  });

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const res = await fetch(`${process.env.serverBaseUrl}/api/posts/recommended?page=${page}&limit=15`, {
      credentials: 'include',
    });
    const data: Post[] = await res.json();

    if (data.length === 0) setHasMore(false);
    else {
      setPosts(prev => [...prev, ...data]);
      setPage(prev => prev + 1);
    }

    setLoading(false);
  }, [page, hasMore, loading]);

  // Initial load
  useEffect(() => {
    loadPosts();
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom && hasMore && !loading) {
        loadPosts();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadPosts, hasMore, loading]);

  return (
    <div className={styles.page}>
      <h2>Home</h2>
      <div className={styles.postContainer}>
        {posts.map(post => (
          <div key={post.id} className={styles.post}>
            <div className={styles.postUser}>
              <img alt="avatar" src={`${process.env.serverBaseUrl}/api/profile/avatar/${post.user_id}`}></img>
              <Link href={`/profile/${post.user_id}`}>
                <strong>{post.username}</strong>
                <small>{post.user_id}</small>
              </Link>
            </div>
            
            <p>{post.content}</p>

            <small>{new Date(post.created_at).toLocaleString()}</small>

            <div className={styles.actionsBar}>
              <LikeButton isUserLogin={loginRespon?.isLoggedIn ? true : false} count={post.like_count} userId={loginRespon?.isLoggedIn ? loginRespon.userId : null} postId={post.id}></LikeButton>
            </div>
          </div>
        ))}
        <div className={styles.postLoadingArea}>
          {loading && <Loading></Loading>}
          {!hasMore && <p>No more posts.</p>}
        </div>
      </div>
    </div>
  );
}
