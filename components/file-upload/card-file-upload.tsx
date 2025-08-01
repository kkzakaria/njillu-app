"use client"

import * as React from "react"
import { AlertCircleIcon, UploadIcon, XIcon, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useFileUpload } from "@/hooks/use-file-upload"
import { formatBytes } from "./utils"
import { FileIconDisplay, FilePreviewDisplay } from "./jsx-helpers"
import type { CardFileUploadProps } from "./types"

export const CardFileUpload = React.forwardRef<
  HTMLDivElement,
  CardFileUploadProps
>(({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = "*",
  variant = "default",
  size = "md",
  cardSize = "md",
  showMetadata = true,
  showActions = true,
  showPreview = true,
  dragText = "Drop your files here",
  buttonText = "Select files",
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

  const cardSizeClasses = {
    sm: "w-32",
    md: "w-40",
    lg: "w-48"
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
          "border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 rounded-xl border transition-colors has-[input:focus]:ring-[3px]",
          files.length > 0 ? "p-4" : cn("flex flex-col items-center justify-center", sizeClasses[size]),
          variantClasses[variant],
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload files"
          disabled={disabled}
        />

        {files.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">
                Files ({files.length})
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

            {/* File Cards Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-lg border bg-background transition-colors hover:bg-muted/30",
                    cardSizeClasses[cardSize]
                  )}
                >
                  {/* Preview Area */}
                  <div className="flex aspect-square items-center justify-center bg-muted/30 p-4">
                    {showPreview && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="size-full rounded object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <FileIconDisplay file={file.file} size={32} className="opacity-60" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div className="mb-2">
                      <p className="truncate text-sm font-medium" title={file.file.name}>
                        {file.file.name}
                      </p>
                      {showMetadata && (
                        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          <p>{formatBytes(file.file.size || 0)}</p>
                          <p className="capitalize">
                            {file.file.type?.split('/')[0] || 'File'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {showActions && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => removeFile(file.id)}
                        disabled={disabled}
                      >
                        <XIcon className="mr-1 size-3" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Quick remove button */}
                  {showActions && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-2 top-2 size-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => removeFile(file.id)}
                      aria-label={`Remove ${file.file.name}`}
                      disabled={disabled}
                    >
                      <XIcon className="size-3" />
                    </Button>
                  )}
                </div>
              ))}

              {/* Add more card */}
              {files.length < maxFiles && (
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={disabled}
                  className={cn(
                    "group flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-muted/30",
                    cardSizeClasses[cardSize],
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <UploadIcon className="size-5 opacity-60" />
                    </div>
                    <p className="text-sm font-medium">Add files</p>
                    <p className="text-xs text-muted-foreground">
                      Click to browse
                    </p>
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
                  <FileIcon className="size-5 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">{dragText}</p>
                <p className="text-muted-foreground mb-4 text-xs">
                  {emptyText || `Max ${maxFiles} files • Up to ${formatBytes(maxSize)} each`}
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

CardFileUpload.displayName = "CardFileUpload"