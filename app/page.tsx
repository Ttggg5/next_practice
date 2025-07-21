'use client'

import InfiniteScroll from './infiniteScroll';
import PostBlock, { MeRespon, Post } from './postBlock';
import { useEffect, useState } from 'react';

const fetchNewestPosts = async (page: number) => {
  const res = await fetch(`${process.env.serverBaseUrl}/api/posts/newest?page=${page}`, {
    credentials: 'include',
  });
  return await res.json();
};

export default function Home() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  
  useEffect(() => {
    // check login
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => setCurLogin(data));
  }, []);

  return (<InfiniteScroll<Post> fetchContent={fetchNewestPosts} renderItem={(post, idx, onItemDeleted) => <PostBlock key={post.id} post={post} curLogin={curLogin} onDeleted={onItemDeleted}/>} />);
}
