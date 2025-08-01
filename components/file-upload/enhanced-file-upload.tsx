"use client"

import * as React from "react"
import { AlertCircleIcon, UploadIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useFileUpload } from "@/hooks/use-file-upload"
import { formatBytes } from "./utils"
import { FileIconDisplay, FilePreviewDisplay } from "./jsx-helpers"
import type { FileUploadProps } from "./types"

export const EnhancedFileUpload = React.forwardRef<
  HTMLDivElement,
  FileUploadProps
>(({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = "*",
  multiple = true,
  variant = "default",
  size = "md",
  showProgress = false,
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
    multiple,
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
          "border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex flex-col items-center rounded-xl border transition-colors has-[input:focus]:ring-[3px]",
          sizeClasses[size],
          variantClasses[variant],
          files.length > 0 ? "not-data-[files]:justify-center" : "justify-center",
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
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({files.length})
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFiles}
                disabled={disabled}
              >
                <XIcon className="-ms-0.5 size-3.5 opacity-60" aria-hidden="true" />
                Remove all
              </Button>
            </div>
            
            <div className="w-full space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {showPreview ? (
                      <FilePreviewDisplay file={file} size={size} />
                    ) : (
                      <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                        <FileIconDisplay file={file.file} />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="truncate text-[13px] font-medium">
                        {file.file.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatBytes(file.file.size || 0)}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                    onClick={() => removeFile(file.id)}
                    aria-label="Remove file"
                    disabled={disabled}
                  >
                    <XIcon className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}

              {files.length < maxFiles && (
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={openFileDialog}
                  disabled={disabled}
                >
                  <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                  Add more
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            {children || (
              <>
                <div
                  className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <UploadIcon className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">{dragText}</p>
                <p className="text-muted-foreground text-xs">
                  {emptyText || `Max ${maxFiles} files • Up to ${formatBytes(maxSize)}`}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={openFileDialog}
                  disabled={disabled}
                >
                  <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
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

EnhancedFileUpload.displayName = "EnhancedFileUpload"