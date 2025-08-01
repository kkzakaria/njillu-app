"use client"

import * as React from "react"
import { AlertCircleIcon, UploadIcon, XIcon, ArrowUpDownIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useFileUpload } from "@/hooks/use-file-upload"
import { formatBytes } from "./utils"
import { FileIconDisplay } from "./jsx-helpers"
import type { TableFileUploadProps } from "./types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const TableFileUpload = React.forwardRef<
  HTMLDivElement,
  TableFileUploadProps
>(({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = "*",
  variant = "default",
  size = "md",
  columns = ["name", "type", "size", "actions"],
  sortable = true,
  showActions = true,
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
  
  const [sortColumn, setSortColumn] = React.useState<"name" | "type" | "size" | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")

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

  const handleSort = (column: "name" | "type" | "size") => {
    if (!sortable) return
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedFiles = React.useMemo(() => {
    if (!sortColumn) return files
    
    return [...files].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number
      
      switch (sortColumn) {
        case "name":
          aValue = a.file.name.toLowerCase()
          bValue = b.file.name.toLowerCase()
          break
        case "type":
          aValue = a.file.type || ""
          bValue = b.file.type || ""
          break
        case "size":
          aValue = a.file.size || 0
          bValue = b.file.size || 0
          break
        default:
          return 0
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [files, sortColumn, sortDirection])

  const getFileType = (file: FileWithPreview) => {
    const type = (file.file instanceof File ? file.file.type : file.file.type) || ""
    if (type.startsWith("image/")) return "Image"
    if (type.startsWith("video/")) return "Video"
    if (type.startsWith("audio/")) return "Audio"
    if (type.includes("pdf")) return "PDF"
    if (type.includes("word") || type.includes("document")) return "Document"
    if (type.includes("excel") || type.includes("spreadsheet")) return "Spreadsheet"
    if (type.includes("zip") || type.includes("archive")) return "Archive"
    return "File"
  }

  const SortableHeader = ({ column, children }: { column: "name" | "type" | "size", children: React.ReactNode }) => {
    if (!sortable) return <>{children}</>
    
    return (
      <button
        type="button"
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => handleSort(column)}
      >
        {children}
        <ArrowUpDownIcon className="size-3 opacity-50" />
      </button>
    )
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
          files.length > 0 ? "p-0" : cn("flex flex-col items-center justify-center", sizeClasses[size]),
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
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 p-4 pb-2">
              <h3 className="text-sm font-medium">
                Uploaded Files ({files.length})
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

            {/* Table */}
            <div className="px-4 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.includes("name") && (
                      <TableHead className="w-auto">
                        <SortableHeader column="name">Name</SortableHeader>
                      </TableHead>
                    )}
                    {columns.includes("type") && (
                      <TableHead className="w-24">
                        <SortableHeader column="type">Type</SortableHeader>
                      </TableHead>
                    )}
                    {columns.includes("size") && (
                      <TableHead className="w-20">
                        <SortableHeader column="size">Size</SortableHeader>
                      </TableHead>
                    )}
                    {columns.includes("status") && (
                      <TableHead className="w-20">Status</TableHead>
                    )}
                    {columns.includes("actions") && showActions && (
                      <TableHead className="w-16">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFiles.map((file) => (
                    <TableRow key={file.id}>
                      {columns.includes("name") && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 shrink-0 items-center justify-center">
                              <FileIconDisplay file={file.file} size={14} />
                            </div>
                            <span className="truncate font-medium">
                              {file.file.name}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      {columns.includes("type") && (
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {getFileType(file)}
                          </span>
                        </TableCell>
                      )}
                      {columns.includes("size") && (
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {formatBytes(file.file.size || 0)}
                          </span>
                        </TableCell>
                      )}
                      {columns.includes("status") && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckIcon className="size-3 text-green-500" />
                            <span className="text-sm text-green-600">Ready</span>
                          </div>
                        </TableCell>
                      )}
                      {columns.includes("actions") && showActions && (
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6 hover:bg-transparent"
                            onClick={() => removeFile(file.id)}
                            disabled={disabled}
                          >
                            <XIcon className="size-3" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

TableFileUpload.displayName = "TableFileUpload"