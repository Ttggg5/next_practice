'use client'

import CommentBlock, {Comment} from "@/app/commentBlock";
import PostBlock, { MeRespon, Post } from "@/app/postBlock";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
  const params = useParams();
  const searchParams = useSearchParams();
  const postId = params.postId as string;
  const commentId = searchParams.get('cId');

  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState<Comment | null>(null);

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

    if (commentId) {
      fetch(`${process.env.serverBaseUrl}/api/posts/comment/${commentId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data: Comment) => setComment(data));
    }
  }, []);

  return (
    <>
      {post ? (
        <>
          <PostBlock post={post} curLogin={curLogin} /> 
          {commentId && (
            <div style={{ width: '95%' }}>
              <h3>Comment</h3>
              <div style={{ background: 'var(--background-hover)', width: '100%', padding: '10px', borderRadius: '10px' }}>
                <CommentBlock comment={comment} currentUserId={curLogin?.userId} />
              </div>
            </div>
          )}
        </>
      )
      : <p>Not found.</p>}
    </>
  );
}