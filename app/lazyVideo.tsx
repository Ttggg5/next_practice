'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
}

export default function LazyVideo({ src }: LazyVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null); // 👈 this wraps the video
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef}>
      {isVisible && (
        <video
          controls
          preload="metadata"
          style={{ maxHeight: '80vh', maxWidth: '100%', borderRadius: '8px' }}
          src={src}
        />
      )}
    </div>
  );
}
