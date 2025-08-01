'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './userManager.module.css';
import { MdBlock } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  is_suspended: boolean;
}

export enum SortKey {
  id = 'id',
  username = 'username',
  email = 'email',
  role = 'role'
}

const PAGE_SIZE = 20;

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>(SortKey.username);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadTriggerRef = useRef<HTMLDivElement | null>(null);

  // Fetch page of users
  const fetchUsers = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const query = new URLSearchParams({
      page: page.toString(),
      size: PAGE_SIZE.toString(),
      search,
      sortKey,
      sortOrder: sortAsc ? 'asc' : 'desc',
    });

    const res = await fetch(`${process.env.serverBaseUrl}/api/admin/users?${query}`);
    const data: User[] = await res.json();

    setUsers((prev) => [...prev, ...data]);
    setHasMore(data.length === PAGE_SIZE);
    setLoading(false);
  }, [page, search, sortKey, sortAsc, hasMore, loading]);

  // First load or refresh
  useEffect(() => {
    setPage(0);
    setUsers([]);
    setHasMore(true);
  }, [search, sortKey, sortAsc]);

  useEffect(() => {
    fetchUsers();
  }, [page, fetchUsers]);

  // Setup infinite scroll trigger
  useEffect(() => {
    if (!loadTriggerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadTriggerRef.current);
    observerRef.current = observer;

    return () => {
      if (loadTriggerRef.current) observer.unobserve(loadTriggerRef.current);
    };
  }, [hasMore, loading]);

  const toggleSuspend = async (user: User) => {
    const updated = { ...user, is_suspended: !user.is_suspended };
    await fetch(`${process.env.serverBaseUrl}/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: user.role,
        isSuspended: updated.is_suspended,
      }),
    });
    setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
  };

  const deleteUser = async (userId: string) => {
    await fetch(`${process.env.serverBaseUrl}/api/admin/users/${userId}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2>User Management</h2>

      <input
        className={styles.searchBar}
        type="text"
        placeholder="Search by id, name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={styles.columnHead}>
        <div onClick={() => handleSort(SortKey.id)}>Id</div>
        <div onClick={() => handleSort(SortKey.username)}>Name</div>
        <div onClick={() => handleSort(SortKey.email)}>Email</div>
        <div onClick={() => handleSort(SortKey.role)}>Role</div>
        <div>Actions</div>
      </div>

      <div>
        {users.map(user => (
          <div key={user.id} className={styles.userInfo}>
            <div>{user.id}</div>
            <div>{user.username}</div>
            <div>{user.email}</div>
            <div>{user.role}</div>
            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.suspendBtn}`} style={user.is_suspended ? {background: 'var(--main)'} : {}} onClick={() => toggleSuspend(user)}>
                <MdBlock />{user.is_suspended ? 'Unsuspend' : 'Suspend'}
              </button>
              <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={() => {
                if (confirm(`Sure you want to delete "${user.id}"`))
                  deleteUser(user.id);
              }}><FaTrash/>Delete</button>
            </div>
          </div>
        ))}

        <div style={{marginTop: 10}}>
          {loading && <div>Loading...</div>}
          {!hasMore && <div>No more users</div>}
        </div>

        {/* Load more trigger */}
        <div ref={loadTriggerRef}></div>
      </div>
    </div>
  );
}