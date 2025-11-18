'use client'

import UserManager from "@/app/admin/userManager";
import { MeRespon } from "@/app/postBlock";
import { useEffect, useState } from "react";

export default function Page() {
    const [curLogin, setCurLogin] = useState<MeRespon | null>(null);
    
    useEffect(() => {
      // check login
      fetch(`${process.env.serverBaseUrl}/api/admin/auth/me`, { credentials: 'include' })
        .then(async (res) => {
          if (!res.ok)
            throw new Error('Failed to fetch user');
          return res.json();
        })
        .then((data: MeRespon) => {
          if (!data.isLoggedIn) window.location.href = './login';
          else setCurLogin(data);
        });
    }, []);

	return (
    <>
      {curLogin && <UserManager />}
    </>
  );
}