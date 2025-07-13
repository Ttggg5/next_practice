import React, { useState, ChangeEvent } from 'react';

interface Props {
  userId: string;
}

const UploadAvatar: React.FC<Props> = ({ userId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`${process.env.serverBaseUrl}/api/profile/avatar/upload/${userId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      setMessage(data.message || 'Uploaded');
    } catch {
      setMessage('Upload failed');
    }
  };

  return (
    <div>
      <input type="file" accept="image/png, .jpg, .jpeg, .gif" onChange={handleChange} />
      {preview && <img src={preview} alt="Preview" width={150} />}
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default UploadAvatar;