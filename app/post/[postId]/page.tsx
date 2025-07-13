'use client'

import PostBlock, { MeRespon, Post } from "@/app/postBlock";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const params = useParams();
  const postId = params.postId as string;
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    // check login
    fetch(`${process.env.serverBaseUrl}/api/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok)
          throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data: MeRespon) => setCurLogin(data));

    fetch(`${process.env.serverBaseUrl}/api/posts/${postId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data: Post) => setPost(data));
  }, []);

  return (
    <>
      {post && <PostBlock post={post} curLogin={curLogin} />}
    </>
  );
}