"use client"

import * as React from "react"
import { AlertCircleIcon, UploadIcon, XIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useFileUpload } from "@/hooks/use-file-upload"
import type { ImageGalleryUploadProps } from "./types"

export const ImageGalleryUpload = React.forwardRef<
  HTMLDivElement,
  ImageGalleryUploadProps
>(({
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = "image/*",
  variant = "default",
  size = "md",
  columns = 4,
  showThumbnails = true,
  thumbnailSize = "md",
  dragText = "Drop your images here",
  buttonText = "Select images",
  emptyText,
  className,
  disabled = false,
  initialFiles = [],
  onFilesChange,
  onFilesAdded,
  children,
  ...props
}, ref) => {
  
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    accept,
    initialFiles,
    onFilesChange,
    onFilesAdded,
  })

  const sizeClasses = {
    sm: "min-h-32 p-3",
    md: "min-h-40 p-4", 
    lg: "min-h-48 p-6"
  }

  const variantClasses = {
    default: "border-dashed",
    minimal: "border-dashed border-muted",
    outlined: "border-solid border-2",
    filled: "bg-muted/30 border-dashed"
  }

  const thumbnailSizeClasses = {
    sm: "size-16",
    md: "size-20",
    lg: "size-24"
  }

  const gridColumns = {
    2: "grid-cols-2",
    3: "grid-cols-3", 
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6"
  }

  return (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex flex-col rounded-xl border transition-colors has-[input:focus]:ring-[3px]",
          files.length > 0 ? "p-4" : cn("items-center justify-center", sizeClasses[size]),
          variantClasses[variant],
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload images"
          disabled={disabled}
        />

        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">
                Images ({files.length})
              </h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openFileDialog}
                  disabled={disabled || files.length >= maxFiles}
                >
                  <UploadIcon className="mr-1 size-3 opacity-60" />
                  Add more
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFiles}
                  disabled={disabled}
                >
                  <XIcon className="mr-1 size-3 opacity-60" />
                  Clear all
                </Button>
              </div>
            </div>
            
            {/* Image Grid */}
            <div className={cn(
              "grid gap-3",
              gridColumns[Math.min(columns, 6) as keyof typeof gridColumns] || gridColumns[4]
            )}>
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative overflow-hidden rounded-lg border"
                >
                  <div className={cn(
                    "aspect-square overflow-hidden",
                    thumbnailSizeClasses[thumbnailSize]
                  )}>
                    {showThumbnails && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted">
                        <ImageIcon className="size-6 opacity-60" />
                      </div>
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  {/* Remove button */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-1 top-1 size-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeFile(file.id)}
                    aria-label={`Remove ${file.file.name}`}
                    disabled={disabled}
                  >
                    <XIcon className="size-3" />
                  </Button>

                  {/* File name on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs text-white">
                      {file.file.name}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Add more placeholder */}
              {files.length < maxFiles && (
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={disabled}
                  className={cn(
                    "group flex aspect-square items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-muted/50",
                    thumbnailSizeClasses[thumbnailSize],
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <UploadIcon className="size-4 opacity-60" />
                    <span className="text-xs opacity-60">Add</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            {children || (
              <>
                <div
                  className="bg-background mb-3 flex size-12 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <ImageIcon className="size-5 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">{dragText}</p>
                <p className="text-muted-foreground mb-4 text-xs">
                  {emptyText || `Max ${maxFiles} images • Up to ${Math.floor(maxSize / (1024 * 1024))}MB each`}
                </p>
                <Button 
                  variant="outline" 
                  onClick={openFileDialog}
                  disabled={disabled}
                >
                  <UploadIcon className="mr-2 size-4" />
                  {buttonText}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
})

ImageGalleryUpload.displayName = "ImageGalleryUpload"