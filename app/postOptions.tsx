'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './postOptions.module.css';   // css below
import { SlOptionsVertical } from "react-icons/sl";

export interface Option {
  label: string;
  onClick: () => void;
  danger?: boolean; // red highlight for “Delete”
}

interface Props {
  options: Option[];
}

export default function PostOptions({ options }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button className={styles.trigger} onClick={() => setOpen(!open)}><SlOptionsVertical /></button>

      {open && (
        <div className={styles.menu}>
          {options.map(opt => (
            <button
              key={opt.label}
              className={`${styles.item} ${opt.danger ? styles.danger : ''}`}
              onClick={() => { opt.onClick(); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
