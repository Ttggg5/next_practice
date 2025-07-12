'use client'

import styles from './page.module.css';
import InfiniteScroll from './infiniteScroll';
import PostBlock, { Post } from './postBlock';

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
  return (<InfiniteScroll<Post> fetchContent={fetchNewestPosts} renderItem={(post) => <PostBlock key={post.id} post={post} meRespon={null} />} />);
}
