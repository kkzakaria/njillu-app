"use client"

import * as React from "react"
import { ImageIcon, XIcon, UploadIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useFileUpload } from "@/hooks/use-file-upload"
import type { SingleImageUploadProps } from "./types"

export const SingleImageUpload = React.forwardRef<
  HTMLDivElement,
  SingleImageUploadProps
>(({
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = "image/*",
  variant = "default",
  size = "md",
  aspectRatio = "square",
  previewSize = "md",
  dragText = "Drop your image here",
  buttonText = "Select image",
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
      getInputProps,
    },
  ] = useFileUpload({
    multiple: false,
    maxFiles: 1,
    maxSize,
    accept,
    initialFiles,
    onFilesChange,
    onFilesAdded,
  })

  const currentFile = files[0]

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video", 
    free: "aspect-auto"
  }

  const previewSizeClasses = {
    sm: "size-24",
    md: "size-32",
    lg: "size-40",
    xl: "size-48"
  }

  const containerSizeClasses = {
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

  return (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
      {/* Upload area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-has-file={currentFile || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "relative flex items-center justify-center rounded-xl border border-input transition-colors",
          "data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 has-[input:focus]:ring-[3px]",
          containerSizeClasses[size],
          variantClasses[variant],
          aspectRatioClasses[aspectRatio],
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image"
          disabled={disabled}
        />

        {currentFile ? (
          <div className="relative size-full">
            {/* Preview */}
            <div className="size-full overflow-hidden rounded-[inherit]">
              {currentFile.preview ? (
                <img
                  src={currentFile.preview}
                  alt={currentFile.file.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted">
                  <ImageIcon className="size-8 opacity-60" />
                </div>
              )}
            </div>

            {/* Remove button */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2 size-6 rounded-full shadow-sm"
              onClick={() => removeFile(currentFile.id)}
              aria-label="Remove image"
              disabled={disabled}
            >
              <XIcon className="size-3" />
            </Button>

            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={openFileDialog}
                disabled={disabled}
              >
                <UploadIcon className="mr-2 size-3" />
                Replace
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            {children || (
              <>
                <div
                  className="mb-3 flex items-center justify-center rounded-full border bg-background"
                  style={{ 
                    width: previewSizeClasses[previewSize].includes('24') ? '6rem' : 
                           previewSizeClasses[previewSize].includes('32') ? '8rem' :
                           previewSizeClasses[previewSize].includes('40') ? '10rem' : '12rem',
                    height: previewSizeClasses[previewSize].includes('24') ? '6rem' : 
                            previewSizeClasses[previewSize].includes('32') ? '8rem' :
                            previewSizeClasses[previewSize].includes('40') ? '10rem' : '12rem'
                  }}
                  aria-hidden="true"
                >
                  <ImageIcon className="size-8 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">{dragText}</p>
                <p className="text-muted-foreground mb-4 text-xs">
                  {emptyText || `Max ${Math.floor(maxSize / (1024 * 1024))}MB`}
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
          <XIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
})

SingleImageUpload.displayName = "SingleImageUpload"