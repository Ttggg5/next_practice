'use client';

import { usePathname } from 'next/navigation';
import { HiHome } from "react-icons/hi2";
import { FaBell } from "react-icons/fa";
import { IoIosChatbubbles } from "react-icons/io";
import { IoPerson, IoSearch } from "react-icons/io5";
import { MdOutlinePostAdd } from "react-icons/md";

export default function Title() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith('/notification')) return (<><FaBell /> Notification</>);
    else if (pathname.startsWith('/chat')) return (<><IoIosChatbubbles /> Chat</>);
    else if (pathname.startsWith('/profile')) return (<><IoPerson /> Profile</>);
    else if (pathname.startsWith('/search')) return (<><IoSearch /> Search</>);
    else if (pathname.startsWith('/create-post')) return (<><MdOutlinePostAdd /> Create post</>);
    else if (pathname === '/') return (<><HiHome /> Home</>);
    else return '';
  };

  return(
    <h2>{getTitle()}</h2>
  );
}