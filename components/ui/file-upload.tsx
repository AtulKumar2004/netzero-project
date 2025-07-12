'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  File,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  folder?: string;
  className?: string;
}

export interface UploadedFile {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  name: string;
  size: number;
}

export default function FileUpload({
  onFilesUploaded,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*'],
  folder = 'general',
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const validFiles: File[] = [];

    for (const file of newFiles) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        continue;
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        toast.error(`File ${file.name} is not a supported format.`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total file count
    if (files.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (index: number) => {
    const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newUploadedFiles);
    onFilesUploaded(newUploadedFiles);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      const newUploadedFiles: UploadedFile[] = result.files.map((file: any, index: number) => ({
        ...file,
        name: files[index].name,
        size: files[index].size,
      }));

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      onFilesUploaded([...uploadedFiles, ...newUploadedFiles]);
      setFiles([]);
      setUploadProgress(100);
      
      toast.success(`${newUploadedFiles.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (file: File) => file.type.startsWith('image/');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            <div className="mb-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-1">Upload Files</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here or click to browse
              </p>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>

            <div className="mt-4 text-xs text-muted-foreground">
              <p>Maximum {maxFiles} files, {maxFileSize}MB each</p>
              <p>Supported formats: {acceptedTypes.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Files (Not yet uploaded) */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Selected Files ({files.length})</h4>
              <Button
                onClick={uploadFiles}
                disabled={uploading}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload All
              </Button>
            </div>
            
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                  <div className="p-2 bg-muted rounded">
                    {isImage(file) ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <File className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">Uploaded Files ({uploadedFiles.length})</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {file.format && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.format.toLowerCase()) ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <File className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => removeUploadedFile(index)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <div className="mt-1">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}