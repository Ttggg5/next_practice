'use client';

import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import InfiniteScroll from '../infiniteScroll';

const fetchSearchPosts = (query: string) => async (page: number) => {
  const res = await fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/posts/search?q=${encodeURIComponent(query)}&page=${page}`, {
    credentials: 'include',
  });
  return await res.json();
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (<InfiniteScroll fetchContent={fetchSearchPosts(query)}></InfiniteScroll>);
}
