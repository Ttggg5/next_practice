'use client';

import Cropper from 'react-easy-crop';
import { useCallback, useState } from 'react';
import getCroppedBlob from './getCroppedBlob';      // helper below
import styles from './avatarCropper.module.css';

interface Props {
  src: string;                        // original file URL
  onCancel: () => void;
  onCropped: (blob: Blob, previewUrl: string) => void;
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
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(+e.target.value)}
          />
          <button onClick={handleDone}>Done</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
