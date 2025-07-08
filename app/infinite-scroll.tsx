'use client';

import { useEffect, useState, useCallback } from 'react';
import PostBlock, { Post, MeRespon } from './postBlock';
import Loading from './loading';
import styles from './infinite-scroll.module.css';

interface InfinitePostListProps {
  fetchContent: (page: number) => Promise<Post[]>;
}

export default function InfinitePostList({ fetchContent }: InfinitePostListProps) {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const data = await fetchContent(page);

    if (data.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    }

    setLoading(false);
  }, [page, hasMore, loading, fetchContent]);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // check login
    fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => {
        setCurLogin(data);
      });
  }, []);

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
