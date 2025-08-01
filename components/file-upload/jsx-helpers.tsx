"use client"

import * as React from "react"
import { getFileIcon, getFilePreview } from "./utils"
import type { FileWithPreview } from "./types"

// JSX helper for file icons
export const FileIconDisplay: React.FC<{
  file: File | { type: string; name: string }
  size?: number
  className?: string
}> = ({ file, size = 16, className = "opacity-60" }) => {
  const iconInfo = getFileIcon(file, { size, className })
  const IconComponent = iconInfo.component
  return <IconComponent {...iconInfo.props} />
}

// JSX helper for file previews
export const FilePreviewDisplay: React.FC<{
  file: FileWithPreview
  size?: "sm" | "md" | "lg"
}> = ({ file, size = "md" }) => {
  const previewInfo = getFilePreview(file, { size })
  
  if (previewInfo.type === "image") {
    return (
      <div className={previewInfo.containerClass}>
        <img {...previewInfo.imageProps} />
      </div>
    )
  }
  
  const IconComponent = previewInfo.iconComponent
  return (
    <div className={previewInfo.containerClass}>
      <IconComponent {...previewInfo.iconProps} />
    </div>
  )
}