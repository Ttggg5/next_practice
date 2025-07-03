import { create } from 'zustand';
import { Post } from '@/app/page';

interface PostsStore {
  posts: Post[];
  page: number;
  hasMore: boolean;
  setPosts: (newPosts: Post[]) => void;
  appendPosts: (newPosts: Post[]) => void;
  nextPage: () => void;
  setHasMore: (value: boolean) => void;
  reset: () => void;
}

export const usePostsStore = create<PostsStore>((set) => ({
  posts: [],
  page: 1,
  hasMore: true,
  setPosts: (newPosts) => set({ posts: newPosts }),
  appendPosts: (newPosts) => set((state) => ({ posts: [...state.posts, ...newPosts] })),
  nextPage: () => set((state) => ({ page: state.page + 1 })),
  setHasMore: (value) => set({ hasMore: value }),
  reset: () => set({ posts: [], page: 1, hasMore: true }),
}));