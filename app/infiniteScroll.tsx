'use client';

import { useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import Loading from './loading';
import styles from './infiniteScroll.module.css';

export interface InfiniteScrollProps<T extends { id: string }> {
  fetchContent: (page: number) => Promise<T[]>;
  renderItem: (item: T, index: number, onItemDeleted: (id: string) => void) => ReactNode;
  rootMargin?: string; // optional: how early to pre‑load (default 300px)
}

export default function InfiniteScroll<T extends { id: string }>({
  fetchContent,
  renderItem,
  rootMargin = '300px'
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadingRef = useRef(false); // prevent double fetch
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentryRef = useRef<HTMLDivElement | null>(null);

  const handleDeleted = (id: string) =>{
    setItems(prev => prev.filter(item => item.id !== id));
  }

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    const data = await fetchContent(page);
    if (data.length === 0) setHasMore(false);
    else {
      setItems(prev => [...prev, ...data]);
      setPage(prev => prev + 1);
    }

    setLoading(false);
    loadingRef.current = false;
  }, [page, hasMore, fetchContent]);

  // initial load
  useEffect(() => { loadMore(); }, []);

  // IntersectionObserver for sentinel div
  useEffect(() => {
    if (!hasMore) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { rootMargin }
    );
    if (sentryRef.current) {
      observerRef.current.observe(sentryRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, rootMargin]);

  return (
    <div className={styles.container}>
      {items.map((item, idx) => renderItem(item, idx, handleDeleted))}
      {/* sentinel div */}
      <div ref={sentryRef} />
      <div className={styles.postLoadingArea}>
        {loading && <Loading />}
        {!hasMore && <p>No more items.</p>}
      </div>
    </div>
  );
}