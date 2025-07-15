export default function getCroppedBlob(src: string, area: { x: number; y: number; width: number; height: number }): Promise<Blob> {
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
