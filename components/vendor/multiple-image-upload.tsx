"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface MultipleImageUploadProps {
  value: string[]
  onChange: (images: string[]) => void
  onRemove: (url: string) => void
  placeholder?: string
  maxImages?: number
}

export function MultipleImageUpload({ 
  value = [], 
  onChange, 
  onRemove, 
  placeholder = "Upload Product Images", 
  maxImages = 5 
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    if (value.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`)
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 10MB)`)
        }

        // Create FormData
        const formData = new FormData()
        formData.append('file', file)

        // Upload to server
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Upload error response:', errorData);
          throw new Error(`Failed to upload ${file.name}: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        return result.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...value, ...uploadedUrls])

      toast({
        title: "Upload successful",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
        variant: "default",
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = (urlToRemove: string) => {
    onRemove(urlToRemove)
    onChange(value.filter(url => url !== urlToRemove))
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          {placeholder}
        </Label>
        <span className="text-xs text-gray-500">
          ({value.length}/{maxImages} images)
        </span>
      </div>

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(imageUrl)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Main
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={handleClick}
        >
          {value.length === 0 ? (
            <>
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG up to 5MB each
              </p>
            </>
          ) : (
            <>
              <Plus className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Add more images ({maxImages - value.length} remaining)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center justify-center p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-blue-700">Uploading images...</span>
        </div>
      )}
    </div>
  )
}
