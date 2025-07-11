'use client';

import { usePathname } from 'next/navigation';
import { HiHome } from "react-icons/hi2";
import { FaBell } from "react-icons/fa";
import { IoIosChatbubbles } from "react-icons/io";
import { IoPerson, IoPersonAdd, IoSearch } from "react-icons/io5";
import { TbLogin2 } from "react-icons/tb";
import { MdOutlinePostAdd } from "react-icons/md";

export default function Title() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith('/notification')) return (<><FaBell /> Notification</>);
    if (pathname.startsWith('/chat')) return (<><IoIosChatbubbles /> Chat</>);
    if (pathname.startsWith('/profile')) return (<><IoPerson /> Profile</>);
    if (pathname.startsWith('/login')) return (<><TbLogin2 /> Login</>);
    if (pathname.startsWith('/register')) return (<><IoPersonAdd /> Register</>);
    if (pathname.startsWith('/search')) return (<><IoSearch /> Search</>);
    if (pathname.startsWith('/create-post')) return (<><MdOutlinePostAdd /> Create post</>);
    if (pathname === '/') return (<><HiHome /> Home</>);
    return '';
  };

  return(
    <h2>{getTitle()}</h2>
  );
}