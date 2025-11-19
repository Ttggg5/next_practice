'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { MeRespon } from "../postBlock";
import { FaUser } from "react-icons/fa";

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
            if (!data.isLoggedIn) window.location.href = './admin/login';
            else setCurLogin(data);
          });
      }, []);

	return (
		<>
			<h2>Admin home</h2>
      <h3>Hello {curLogin?.userId}!</h3>
			<br/>
			<Link href='./admin/users'><FaUser /> Users</Link>
		</>
	);
}