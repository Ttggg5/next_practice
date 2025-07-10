'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import PostBlock, { Post, MeRespon } from './postBlock';
import Loading from './loading';
import styles from './infinite-scroll.module.css';

interface InfinitePostListProps {
  fetchContent: (page: number) => Promise<Post[]>;
}

export default function InfinitePostList({ fetchContent }: InfinitePostListProps) {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // ✅ Refs to persist current page and prevent double fetch
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const loadPosts = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    const data = await fetchContent(pageRef.current);

    if (data.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prev) => [...prev, ...data]);
      pageRef.current += 1;
    }

    setLoading(false);
    loadingRef.current = false;
  }, [fetchContent, hasMore]);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // check login once
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/me`, {
      credentials: 'include'
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => setCurLogin(data));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom && hasMore && !loadingRef.current) {
        loadPosts();
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadPosts, hasMore]);

  return (
    <div className={styles.postContainer}>
      {posts.map((post) => (
        <PostBlock key={post.id} post={post} meRespon={curLogin} />
      ))}
      <div className={styles.postLoadingArea}>
        {loading && <Loading />}
        {!hasMore && <p>No more posts.</p>}
      </div>
    </div>
  );
}