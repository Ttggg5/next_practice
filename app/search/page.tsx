'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import PostBlock from '@/app/postBlock';
import {Post} from '@/app/postBlock';
import Loading from '@/app/loading';
import homeStyles from '@/app/page.module.css';

const POSTS_PER_PAGE = 10;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!query || loading || !hasMore) return;

    setLoading(true);
    const res = await fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/posts/search?q=${encodeURIComponent(query)}&page=${page}`);
    const data: Post[] = await res.json();

    if (data.length < POSTS_PER_PAGE) setHasMore(false);
    setPosts((prev) => [...prev, ...data]);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [query, page, hasMore, loading]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [query]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom && !loading && hasMore) {
        fetchPosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchPosts, loading, hasMore]);

  return (
    <div className={homeStyles.page}>
      <div className={homeStyles.postContainer}>
        <h2>Search Results for: “{query}”</h2>
        {posts.length === 0 && !loading && <p>No results found.</p>}
        {posts.map((post) => (
          <PostBlock key={post.id} post={post} loginRespon={null} />
        ))}
        <div className={homeStyles.postLoadingArea}>
          <div>{loading && <Loading></Loading>}</div>
          {!hasMore && <p>No more results.</p>}
        </div>
      </div>
    </div>
  );
}
