import type React from "react"

// Core file types
export type FileMetadata = {
  name: string
  size: number
  type: string
  url: string
  id: string
}

export type FileWithPreview = {
  file: File | FileMetadata
  id: string
  preview?: string
}

// Base upload options
export type FileUploadOptions = {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void
  onFileRemoved?: (fileId: string) => void
  onProgressUpdate?: (fileId: string, progress: number) => void
  onUploadComplete?: (fileId: string) => void
}

// Base component props
export interface FileUploadProps extends FileUploadOptions {
  className?: string
  disabled?: boolean
  variant?: "default" | "minimal" | "outlined" | "filled"
  size?: "sm" | "md" | "lg"
  showProgress?: boolean
  showPreview?: boolean
  dragText?: string
  dropText?: string
  buttonText?: string
  emptyText?: string
  children?: React.ReactNode
}

// Specialized component props
export interface SingleImageUploadProps extends Omit<FileUploadProps, "multiple" | "maxFiles"> {
  aspectRatio?: "square" | "video" | "free"
  previewSize?: "sm" | "md" | "lg" | "xl"
}

export interface MultipleFileUploadProps extends FileUploadProps {
  listType?: "simple" | "detailed" | "compact"
  showControls?: boolean
  allowReorder?: boolean
}

export interface ImageGalleryUploadProps extends FileUploadProps {
  columns?: number
  showThumbnails?: boolean
  thumbnailSize?: "sm" | "md" | "lg"
}

export interface ProgressFileUploadProps extends FileUploadProps {
  simulateUpload?: boolean
  uploadSpeed?: "slow" | "normal" | "fast"
  showBandwidth?: boolean
}

export interface TableFileUploadProps extends FileUploadProps {
  columns?: ("name" | "type" | "size" | "status" | "actions")[]
  sortable?: boolean
  showActions?: boolean
}

export interface CardFileUploadProps extends FileUploadProps {
  cardSize?: "sm" | "md" | "lg"
  showMetadata?: boolean
  showActions?: boolean
}

// Upload state types
export type UploadStatus = "idle" | "uploading" | "completed" | "error"

export type FileUploadState = {
  files: FileWithPreview[]
  isDragging: boolean
  errors: string[]
  uploadProgress: Record<string, number>
  uploadStatus: Record<string, UploadStatus>
}

// Action types
export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  clearErrors: () => void
  handleDragEnter: (e: React.DragEvent<HTMLElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLElement>) => void
  handleDrop: (e: React.DragEvent<HTMLElement>) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  openFileDialog: () => void
  getInputProps: (props?: React.InputHTMLAttributes<HTMLInputElement>) => React.InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>
  }
}

// Utility types
export type FileType = "image" | "video" | "audio" | "document" | "archive" | "spreadsheet" | "text" | "other"


export type ValidationError = {
  file: string
  message: string
  type: "size" | "type" | "count" | "duplicate"
}