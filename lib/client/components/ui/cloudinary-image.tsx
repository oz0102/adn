import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Removed unused import
// import Image from 'next/image';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className = '',
  onDelete,
  showDeleteButton = false
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle image loading
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle image error
  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
          <ImageIcon className="h-8 w-8 text-gray-400 animate-pulse" />
        </div>
      )}
      
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Using img tag with ESLint disable because Next/Image has issues with dynamic Cloudinary URLs */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-auto rounded-md ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {showDeleteButton && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function getCloudinaryUrl(publicId: string, options: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}) {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.error('Cloudinary cloud name not found in environment variables');
    return '';
  }
  
  let transformations = `f_${format},q_${quality}`;
  
  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  if (width || height) transformations += `,c_${crop}`;
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}
