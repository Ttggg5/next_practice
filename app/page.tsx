'use client'

import Image from "next/image";
import Link from 'next/link'
import styles from "./page.module.css";
import React, { useCallback, useEffect, useState } from 'react';

interface Post {
  id: string;
  content: string;
  created_at: string;
  username: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

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
      <h2>Recommended Posts</h2>
      <div style={{paddingBottom: 100}}>
        {posts.map(post => (
          <div key={post.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
            <p><strong>@{post.username}</strong></p>
            <p>{post.content}</p>
            <small>{new Date(post.created_at).toLocaleString()}</small>
          </div>
        ))}
        {loading && <p>Loading more...</p>}
        {!hasMore && <p style={{ textAlign: 'center' }}>No more posts.</p>}
      </div>
    </div>
  );
}
