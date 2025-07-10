'use client'

import styles from './page.module.css';
import InfiniteScroll from './infinite-scroll';

interface MeRespon {
  isLoggedIn: boolean,
  userId: string
}

const fetchNewestPosts = async (page: number) => {
  const res = await fetch(`http://${window.location.hostname}:${process.env.serverPort}/api/posts/newest?page=${page}`, {
    credentials: 'include',
  });
  return await res.json();
};

export default function Home() {
  return (<InfiniteScroll fetchContent={fetchNewestPosts}></InfiniteScroll>);
}
