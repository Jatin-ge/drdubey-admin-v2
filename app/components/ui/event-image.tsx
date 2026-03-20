import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ImageFallback } from './image-fallback';

interface EventImageProps {
  fileKey: string;
  alt?: string;
  className?: string;
}

export const EventImage: React.FC<EventImageProps> = ({
  fileKey,
  alt = '',
  className = '',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      try {
        setLoading(true);
        setError(false);

        console.log("Fetching presigned URL for key:", fileKey);
        const response = await axios.get(`/api/r2/presigned-url?key=${encodeURIComponent(fileKey)}`);
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        
        setImageUrl(response.data.url);
      } catch (error) {
        console.error('Failed to fetch presigned URL:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (fileKey) {
      fetchPresignedUrl();
    }

    // Cleanup function to handle component unmount
    return () => {
      setImageUrl(null);
      setError(false);
    };
  }, [fileKey]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 w-full h-full" />;
  }

  if (error || !imageUrl) {
    return <ImageFallback />;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}; 