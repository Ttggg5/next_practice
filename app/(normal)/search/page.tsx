'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from '@/app/infiniteScroll';
import PostBlock, { MeRespon, Post } from '@/app/postBlock';
import UserBlock, { User } from '@/app/userBlock';
import styles from './page.module.css';

export default function Page() {
  // ── query & tab state stored in URL (q= & tab=)
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const tab = searchParams.get('tab') ?? 'posts';   // "posts" | "users"
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);

  /** push new tab into URL (keeps ?q=) */
  const switchTab = useCallback((newTab: 'posts' | 'users') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`/search?${params.toString()}`);
  }, [router, searchParams]);

  /* ------------------------  loaders  ------------------------ */

  const fetchPosts = async (page: number) => {
    const res = await fetch(
      `${process.env.serverBaseUrl}/api/posts/search?q=${encodeURIComponent(q)}&page=${page}`,
      { credentials: 'include' }
    );
    return res.json() as Promise<Post[]>;
  };

  const fetchUsers = async (page: number) => {
    const res = await fetch(
      `${process.env.serverBaseUrl}/api/user/search?q=${encodeURIComponent(q)}&page=${page}`,
      { credentials: 'include' }
    );
    return res.json() as Promise<User[]>;
  };

  useEffect(() => {
    // check login
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => {
        setCurLogin(data);
      });
  }, []);

  /* -------------------------  render  ------------------------ */

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Results for “{q}”</h2>

      {/* tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${tab === 'posts' ? styles.active : ''}`}
          onClick={() => switchTab('posts')}
        >
          Posts
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'users' ? styles.active : ''}`}
          onClick={() => switchTab('users')}
        >
          Users
        </button>
      </div>

      {/* list */}
      {tab === 'posts' ? (
        <InfiniteScroll<Post>
          key={`posts-${q}`}
          fetchContent={fetchPosts}
          renderItem={(post, idx, onDeleted) => <PostBlock key={post.id} post={post} curLogin={curLogin} onDeleted={onDeleted} />}
        />
      ) : (
        <InfiniteScroll<User>
          key={`users-${q}`}
          fetchContent={fetchUsers}
          renderItem={(user) => <UserBlock key={user.id} curLogin={curLogin} user={user} />}
        />
      )}
    </div>
  );
}
