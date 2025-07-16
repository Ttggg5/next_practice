'use client';

import Cropper from 'react-easy-crop';
import { useCallback, useState } from 'react';
import styles from './avatarCropper.module.css';

interface Props {
  src: string; // original file URL
  onCancel: () => void;
  onCropped: (blob: Blob, previewUrl: string) => void;
}

function getCroppedBlob(src: string, area: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = area.width;
      canvas.height = area.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        img,
        area.x, area.y, area.width, area.height, // from original
        0, 0, area.width, area.height  // to canvas
      );
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.96);
    };
  });
}


export default function AvatarCropper({ src, onCancel, onCropped }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCA] = useState<any>(null);

  const onCropComplete = useCallback((_area: any, areaPixels: any) => setCA(areaPixels), []);

  const handleDone = async () => {
    if (!croppedArea) return;
    const blob = await getCroppedBlob(src, croppedArea); // square blob
    const preview = URL.createObjectURL(blob);
    onCropped(blob, preview);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
        <div className={styles.controls}>
          <button className={styles.btn} onClick={onCancel}>Cancel</button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(+e.target.value)}
          />
          <button className={styles.btn} onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
}
