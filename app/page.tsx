'use client'

import styles from './page.module.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Loading from '@/app/loading';
import PostBlock from "./postBlock";
import { usePostsStore } from '@/store/usePostsStore';

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
  //const [posts, setPosts] = useState<Post[]>([]);
  //const [page, setPage] = useState(1);
  //const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginRespon, setLoginRespon] = useState<LoginRespon | null>(null);
  const fetchedRef = useRef(false); // ✅ block duplicate fetch

  const {
    posts,
    page,
    hasMore,
    appendPosts,
    nextPage,
    setHasMore,
  } = usePostsStore();

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // check login
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/me`, { credentials: 'include' })
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
    const res = await fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/posts/newest?page=${page}`, {
      credentials: 'include',
    });
    const data: Post[] = await res.json();

    if (data.length === 0) setHasMore(false);
    else {
      appendPosts(data);
      nextPage();
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
          <PostBlock key={post.id} post={post} loginRespon={loginRespon}></PostBlock>
        ))}
        <div className={styles.postLoadingArea}>
          {loading && <Loading></Loading>}
          {!hasMore && <p>No more posts.</p>}
        </div>
      </div>
    </div>
  );
}
