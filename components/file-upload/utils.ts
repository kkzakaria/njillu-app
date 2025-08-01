import {
  FileIcon,
  FileTextIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  VideoIcon,
  HeadphonesIcon,
  ImageIcon,
} from "lucide-react"
import type { FileType, FileWithPreview } from "./types"

// Helper function to format bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

// File type detection
export const getFileType = (file: File | { type: string; name: string }): FileType => {
  const fileType = file.type || ""
  const fileName = file.name || ""

  if (fileType.startsWith("image/")) return "image"
  if (fileType.startsWith("video/")) return "video"
  if (fileType.startsWith("audio/")) return "audio"
  
  if (
    fileType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileType.includes("word") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx") ||
    fileType.includes("text") ||
    fileName.endsWith(".txt")
  ) return "document"
  
  if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar") ||
    fileName.endsWith(".7z")
  ) return "archive"
  
  if (
    fileType.includes("excel") ||
    fileType.includes("spreadsheet") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".csv")
  ) return "spreadsheet"
  
  return "other"
}

// Icon mapping for file types
export const fileIconMap = {
  image: ImageIcon,
  video: VideoIcon,
  audio: HeadphonesIcon,
  document: FileTextIcon,
  archive: FileArchiveIcon,
  spreadsheet: FileSpreadsheetIcon,
  text: FileTextIcon,
  other: FileIcon,
} as const

// Get icon component for file (returns icon component, not JSX)
export const getFileIcon = (
  file: File | { type: string; name: string },
  options: { size?: number; className?: string } = {}
) => {
  const fileType = getFileType(file)
  const IconComponent = fileIconMap[fileType]
  const { size = 16, className = "opacity-60" } = options
  
  // Return the icon component with props as an object for JSX usage
  return { 
    component: IconComponent, 
    props: { size, className } 
  }
}

// Generate file preview configuration (returns props for JSX usage)
export const getFilePreview = (file: FileWithPreview, options: { size?: "sm" | "md" | "lg" } = {}) => {
  const { size = "md" } = options
  const fileType = getFileType(file.file)
  
  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12"
  }
  
  const containerClass = `flex aspect-square ${sizeClasses[size]} shrink-0 items-center justify-center rounded border`
  const fileName = file.file instanceof File ? file.file.name : file.file.name
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16
  
  if (fileType === "image" && file.preview) {
    return {
      type: "image" as const,
      containerClass,
      imageProps: {
        src: file.preview,
        alt: fileName,
        className: "size-full rounded-[inherit] object-cover"
      }
    }
  }
  
  const iconInfo = getFileIcon(file.file, { size: iconSize })
  return {
    type: "icon" as const,
    containerClass,
    iconComponent: iconInfo.component,
    iconProps: iconInfo.props
  }
}

// File validation
export const validateFileType = (
  file: File,
  accept: string
): { valid: boolean; error?: string } => {
  if (accept === "*") return { valid: true }
  
  const acceptedTypes = accept.split(",").map((type) => type.trim())
  const fileType = file.type || ""
  const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
  
  const isAccepted = acceptedTypes.some((type) => {
    if (type.startsWith(".")) {
      return fileExtension === type.toLowerCase()
    }
    if (type.endsWith("/*")) {
      const baseType = type.split("/")[0]
      return fileType.startsWith(`${baseType}/`)
    }
    return fileType === type
  })
  
  return {
    valid: isAccepted,
    error: isAccepted ? undefined : `File type not accepted. Accepted types: ${accept}`
  }
}

// File size validation
export const validateFileSize = (
  file: File,
  maxSize: number
): { valid: boolean; error?: string } => {
  if (file.size <= maxSize) return { valid: true }
  
  return {
    valid: false,
    error: `File size exceeds maximum of ${formatBytes(maxSize)}`
  }
}

// Generate unique file ID
export const generateFileId = (file: File): string => {
  return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Create file preview URL
export const createPreviewUrl = (file: File): string | undefined => {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file)
  }
  return undefined
}

// Cleanup preview URL
export const revokePreviewUrl = (url: string) => {
  try {
    URL.revokeObjectURL(url)
  } catch (error) {
    console.warn("Failed to revoke preview URL:", error)
  }
}

// Upload simulation utility
export const simulateFileUpload = (
  fileSize: number,
  options: {
    speed?: "slow" | "normal" | "fast"
    onProgress?: (progress: number) => void
    onComplete?: () => void
    onError?: (error: string) => void
  } = {}
) => {
  const { speed = "normal", onProgress, onComplete } = options
  
  // Speed configurations (bytes per iteration)
  const speedConfig = {
    slow: { min: 1000, max: 5000, delay: 200 },
    normal: { min: 5000, max: 50000, delay: 100 },
    fast: { min: 50000, max: 200000, delay: 50 }
  }
  
  const config = speedConfig[speed]
  let uploadedBytes = 0
  let timeoutId: NodeJS.Timeout
  
  const uploadChunk = () => {
    const chunkSize = Math.floor(Math.random() * (config.max - config.min)) + config.min
    uploadedBytes = Math.min(fileSize, uploadedBytes + chunkSize)
    
    const progress = Math.floor((uploadedBytes / fileSize) * 100)
    onProgress?.(progress)
    
    if (uploadedBytes >= fileSize) {
      onComplete?.()
    } else {
      // Simulate network variability
      const delay = config.delay + (Math.random() * config.delay * 0.5)
      timeoutId = setTimeout(uploadChunk, delay)
    }
  }
  
  // Start upload
  timeoutId = setTimeout(uploadChunk, 100)
  
  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

// Drag and drop utilities
export const isDragEventWithFiles = (e: React.DragEvent): boolean => {
  return e.dataTransfer?.types?.includes("Files") ?? false
}

export const getFilesFromDragEvent = (e: React.DragEvent): File[] => {
  const files = Array.from(e.dataTransfer?.files || [])
  return files
}

// File list utilities
export const sortFiles = (files: FileWithPreview[], sortBy: "name" | "size" | "type" = "name") => {
  return [...files].sort((a, b) => {
    switch (sortBy) {
      case "name":
        const aName = a.file instanceof File ? a.file.name : a.file.name
        const bName = b.file instanceof File ? b.file.name : b.file.name
        return aName.localeCompare(bName)
      case "size":
        const aSize = a.file instanceof File ? a.file.size : a.file.size
        const bSize = b.file instanceof File ? b.file.size : b.file.size
        return (aSize || 0) - (bSize || 0)
      case "type":
        const aType = a.file instanceof File ? a.file.type : a.file.type
        const bType = b.file instanceof File ? b.file.type : b.file.type
        return (aType || "").localeCompare(bType || "")
      default:
        return 0
    }
  })
}

export const filterFilesByType = (files: FileWithPreview[], fileType: FileType) => {
  return files.filter(file => getFileType(file.file) === fileType)
}

export const getTotalFileSize = (files: FileWithPreview[]): number => {
  return files.reduce((total, file) => {
    const size = file.file instanceof File ? file.file.size : file.file.size
    return total + (size || 0)
  }, 0)
}