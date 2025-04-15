import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface UploadedImageData {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

interface ImageUploadProps {
  onUploadComplete?: (imageData: UploadedImageData) => void;
  folder?: string;
  className?: string;
  buttonText?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  onUploadComplete,
  folder = 'general',
  className = '',
  buttonText = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5
}: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    setError(null);
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
  };

  const uploadFile = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setProgress(10);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      setProgress(30);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      setProgress(70);
      
      const data = await response.json();
      
      setProgress(100);
      
      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }
      
      if (onUploadComplete) {
        onUploadComplete(data.data);
      }
      
      clearFile();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {!preview ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop or click to upload
              </p>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button variant="outline" type="button">
                  {buttonText}
                </Button>
                <Input
                  id="image-upload"
                  type="file"
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
              <p className="text-xs text-gray-400 mt-2">
                Max size: {maxSizeMB}MB
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-md object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {isUploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-center text-gray-500">
              Uploading... {progress}%
            </p>
          </div>
        )}
        
        {file && !isUploading && (
          <Button 
            onClick={uploadFile} 
            className="w-full"
          >
            Upload
          </Button>
        )}
      </div>
    </div>
  );
}
