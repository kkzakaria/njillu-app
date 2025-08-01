"use client"

import * as React from "react"
import { AlertCircleIcon, UploadIcon, XIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useFileUpload } from "@/hooks/use-file-upload"
import { formatBytes } from "./utils"
import { simulateFileUpload } from "./utils"
import { FileIconDisplay } from "./jsx-helpers"
import type { ProgressFileUploadProps } from "./types"

export const ProgressFileUpload = React.forwardRef<
  HTMLDivElement,
  ProgressFileUploadProps
>(({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = "*",
  variant = "default",
  size = "md",
  simulateUpload = true,
  uploadSpeed = "normal",
  showBandwidth = false,
  showProgress = true,
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
  
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = React.useState<Record<string, "idle" | "uploading" | "completed" | "error">>({})
  const uploadCleanupRefs = React.useRef<Record<string, () => void>>({})

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
    onFilesAdded: (addedFiles) => {
      onFilesAdded?.(addedFiles)
      
      // Start upload simulation for new files
      if (simulateUpload) {
        addedFiles.forEach((file) => {
          setUploadStatus(prev => ({ ...prev, [file.id]: "uploading" }))
          setUploadProgress(prev => ({ ...prev, [file.id]: 0 }))
          
          const cleanup = simulateFileUpload(file.file.size || 0, {
            speed: uploadSpeed,
            onProgress: (progress) => {
              setUploadProgress(prev => ({ ...prev, [file.id]: progress }))
            },
            onComplete: () => {
              setUploadStatus(prev => ({ ...prev, [file.id]: "completed" }))
              setUploadProgress(prev => ({ ...prev, [file.id]: 100 }))
              delete uploadCleanupRefs.current[file.id]
            },
            onError: () => {
              setUploadStatus(prev => ({ ...prev, [file.id]: "error" }))
              delete uploadCleanupRefs.current[file.id]
            }
          })
          
          uploadCleanupRefs.current[file.id] = cleanup
        })
      }
    },
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

  const handleRemoveFile = (fileId: string) => {
    // Clean up upload simulation if running
    if (uploadCleanupRefs.current[fileId]) {
      uploadCleanupRefs.current[fileId]()
      delete uploadCleanupRefs.current[fileId]
    }
    
    // Clean up state
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
    setUploadStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[fileId]
      return newStatus
    })
    
    removeFile(fileId)
  }

  const handleClearFiles = () => {
    // Clean up all upload simulations
    Object.values(uploadCleanupRefs.current).forEach(cleanup => cleanup())
    uploadCleanupRefs.current = {}
    
    // Clean up state
    setUploadProgress({})
    setUploadStatus({})
    
    clearFiles()
  }

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      Object.values(uploadCleanupRefs.current).forEach(cleanup => cleanup())
    }
  }, [])

  const getStatusIcon = (fileId: string) => {
    const status = uploadStatus[fileId] || "idle"
    
    switch (status) {
      case "completed":
        return <CheckIcon className="size-4 text-green-500" />
      case "error":
        return <XIcon className="size-4 text-red-500" />
      case "uploading":
        return (
          <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        )
      default:
        return <FileIconDisplay file={{ type: "", name: "" }} size={16} />
    }
  }

  const getStatusText = (fileId: string) => {
    const status = uploadStatus[fileId] || "idle"
    const progress = uploadProgress[fileId] || 0

    switch (status) {
      case "completed":
        return "Completed"
      case "error":
        return "Failed"
      case "uploading":
        return `Uploading ${progress}%`
      default:
        return "Ready"
    }
  }

  const completedFiles = files.filter(file => uploadStatus[file.id] === "completed").length
  const uploadingFiles = files.filter(file => uploadStatus[file.id] === "uploading").length
  const overallProgress = files.length > 0 ? (completedFiles / files.length) * 100 : 0

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
            {/* Header with overall progress */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">
                  Files ({completedFiles}/{files.length})
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearFiles}
                  disabled={disabled}
                >
                  <XIcon className="mr-1 size-3 opacity-60" />
                  Clear all
                </Button>
              </div>
              
              {showProgress && (
                <>
                  <Progress value={overallProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall progress</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                </>
              )}
            </div>
            
            {/* File list */}
            <div className="w-full space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-2 rounded-lg border bg-background p-3"
                >
                  {/* File info row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex size-8 shrink-0 items-center justify-center">
                        {getStatusIcon(file.id)}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium">
                          {file.file.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatBytes(file.file.size || 0)}</span>
                          <span>•</span>
                          <span>{getStatusText(file.id)}</span>
                          {showBandwidth && uploadStatus[file.id] === "uploading" && (
                            <>
                              <span>•</span>
                              <span>~2.1 MB/s</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6 hover:bg-transparent"
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={disabled}
                    >
                      <XIcon className="size-3" />
                    </Button>
                  </div>

                  {/* Progress bar for individual file */}
                  {showProgress && uploadStatus[file.id] === "uploading" && (
                    <Progress 
                      value={uploadProgress[file.id] || 0} 
                      className="h-1" 
                    />
                  )}
                </div>
              ))}

              {files.length < maxFiles && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openFileDialog}
                  disabled={disabled}
                >
                  <UploadIcon className="mr-2 size-4 opacity-60" />
                  Add more files
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
                  {emptyText || `Max ${maxFiles} files • Up to ${formatBytes(maxSize)} each`}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={openFileDialog}
                  disabled={disabled}
                >
                  <UploadIcon className="mr-2 size-4 opacity-60" />
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

ProgressFileUpload.displayName = "ProgressFileUpload"