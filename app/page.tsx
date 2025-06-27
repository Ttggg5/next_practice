import Image from "next/image";
import Link from 'next/link'
import styles from "./page.module.css";

export default function Home() {
  return (
    <div>
      <Link href='/login'>Login</Link>
      <hr></hr>
      <Link href='/register'>Register</Link>
    </div>
  );
}
