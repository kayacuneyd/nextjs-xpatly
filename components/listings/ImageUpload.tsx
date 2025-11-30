'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  images: File[]
  onChange: (files: File[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 40 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const newFiles = Array.from(files).filter((file) => {
        // Only accept images
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`)
          return false
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`)
          return false
        }

        return true
      })

      const totalImages = images.length + newFiles.length
      if (totalImages > maxImages) {
        alert(`You can only upload up to ${maxImages} images. You're trying to add ${totalImages} images.`)
        return
      }

      // Create previews
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })

      onChange([...images, ...newFiles])
    },
    [images, onChange, maxImages]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    onChange(newImages)
    setPreviews(newPreviews)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const newPreviews = [...previews]

    const [movedImage] = newImages.splice(fromIndex, 1)
    const [movedPreview] = newPreviews.splice(fromIndex, 1)

    newImages.splice(toIndex, 0, movedImage)
    newPreviews.splice(toIndex, 0, movedPreview)

    onChange(newImages)
    setPreviews(newPreviews)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="space-y-2">
            <div className="text-4xl">📸</div>
            <div className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPG, WebP up to 5MB (Min: 1, Max: {maxImages} images)
            </div>
            <div className="text-xs text-gray-400">
              {images.length} / {maxImages} images uploaded
            </div>
          </div>
        </label>
      </div>

      {/* Image Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
            >
              <Image
                src={preview}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {/* Move left */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100"
                    title="Move left"
                  >
                    ←
                  </button>
                )}

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  title="Remove"
                >
                  ×
                </button>

                {/* Move right */}
                {index < previews.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Image number badge */}
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {index + 1}
              </div>

              {/* Main image indicator */}
              {index === 0 && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Validation message */}
      {images.length > 0 && images.length < 1 && (
        <p className="text-red-600 text-sm">At least 1 image is required</p>
      )}
    </div>
  )
}
