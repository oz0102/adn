import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { CloudinaryImage } from '@/components/ui/cloudinary-image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string;
  created_at: string;
  resource_type: string;
  folder: string;
}

interface ImageGalleryProps {
  images: CloudinaryUploadResult[];
  onSelectImage?: (image: CloudinaryUploadResult) => void;
  onDeleteImage?: (publicId: string) => void;
  maxColumns?: 2 | 3 | 4;
}

export function ImageGallery({
  images,
  onSelectImage,
  onDeleteImage,
  maxColumns = 3
}: ImageGalleryProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${maxColumns} gap-4`}>
      {images.map((image) => (
        <Card key={image.public_id} className="overflow-hidden">
          <div 
            className="relative cursor-pointer" 
            onClick={() => onSelectImage && onSelectImage(image)}
          >
            <CloudinaryImage
              src={image.secure_url}
              alt={image.original_filename}
              showDeleteButton={!!onDeleteImage}
              onDelete={() => onDeleteImage && onDeleteImage(image.public_id)}
              className="aspect-square object-cover"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

interface ImageManagerProps {
  folder?: string;
  initialImages?: CloudinaryUploadResult[];
  onImagesChange?: (images: CloudinaryUploadResult[]) => void;
  maxColumns?: 2 | 3 | 4;
  title?: string;
}

export function ImageManager({
  folder = 'general',
  initialImages = [],
  onImagesChange,
  maxColumns = 3,
  title = 'Image Manager'
}: ImageManagerProps) {
  const [images, setImages] = useState<CloudinaryUploadResult[]>(initialImages);
  const [activeTab, setActiveTab] = useState('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleUploadComplete = (imageData: CloudinaryUploadResult) => {
    const updatedImages = [...images, imageData];
    setImages(updatedImages);
    
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
    
    toast({
      title: 'Image Uploaded',
      description: 'Your image has been uploaded successfully.',
    });
    
    setActiveTab('gallery');
  };

  const handleDeleteImage = async (publicId: string) => {
    try {
      const response = await fetch(`/api/upload?public_id=${publicId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete image');
      }
      
      const updatedImages = images.filter(img => img.public_id !== publicId);
      setImages(updatedImages);
      
      if (onImagesChange) {
        onImagesChange(updatedImages);
      }
      
      toast({
        title: 'Image Deleted',
        description: 'The image has been deleted successfully.',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const filteredImages = searchTerm
    ? images.filter(img => 
        img.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.public_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : images;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="gallery">Gallery ({images.length})</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gallery">
            {images.length > 0 ? (
              <>
                <div className="mb-4">
                  <Label htmlFor="search-images" className="sr-only">Search Images</Label>
                  <Input
                    id="search-images"
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <ImageGallery
                  images={filteredImages}
                  onDeleteImage={handleDeleteImage}
                  maxColumns={maxColumns}
                />
                
                {searchTerm && filteredImages.length === 0 && (
                  <p className="text-center text-gray-500 my-8">
                    No images found matching &quot;{searchTerm}&quot;
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No images uploaded yet</p>
                <Button onClick={() => setActiveTab('upload')}>
                  Upload Your First Image
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload">
            <ImageUpload
              onUploadComplete={handleUploadComplete}
              folder={folder}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
