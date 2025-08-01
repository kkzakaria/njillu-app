# File Upload Components System

A comprehensive collection of 7 specialized file upload components built with React, TypeScript, and Origin UI patterns. Features drag & drop, file validation, progress tracking, and multiple layout options.

## 🚀 Quick Start

```tsx
import { EnhancedFileUpload } from "@/components/file-upload"

export default function MyComponent() {
  return (
    <EnhancedFileUpload
      maxFiles={10}
      maxSize={10 * 1024 * 1024} // 10MB
      accept="image/*"
      onFilesChange={(files) => console.log("Files:", files)}
    />
  )
}
```

## 📦 Available Components

### 1. EnhancedFileUpload
**Base component** with comprehensive features and multiple variants.

```tsx
<EnhancedFileUpload
  variant="default" // "default" | "minimal" | "outlined" | "filled"
  size="md" // "sm" | "md" | "lg"
  maxFiles={10}
  multiple={true}
  showPreview={true}
  showProgress={false}
/>
```

**Features:**
- ✅ Drag & drop support
- ✅ File previews with thumbnails
- ✅ Multiple variant styles
- ✅ Comprehensive error handling
- ✅ File type and size validation

---

### 2. SingleImageUpload
**Specialized** for single image uploads with preview and aspect ratio control.

```tsx
<SingleImageUpload
  aspectRatio="square" // "square" | "video" | "free"
  previewSize="md" // "sm" | "md" | "lg" | "xl"
  maxSize={5 * 1024 * 1024} // 5MB
  accept="image/*"
/>
```

**Features:**
- ✅ Single image focus
- ✅ Aspect ratio control
- ✅ Large preview with overlay
- ✅ Replace functionality
- ✅ Image-optimized validation

---

### 3. MultipleFileUpload
**Handle multiple files** with different list layout options.

```tsx
<MultipleFileUpload
  listType="detailed" // "simple" | "detailed" | "compact"
  showControls={true}
  allowReorder={false}
  maxFiles={10}
/>
```

**Features:**
- ✅ Three list layout types
- ✅ Bulk operations support
- ✅ File reordering (optional)
- ✅ Detailed file information
- ✅ Compact mode for space efficiency

---

### 4. ImageGalleryUpload
**Grid layout** for image uploads with thumbnail previews.

```tsx
<ImageGalleryUpload
  columns={4} // 2-6 columns
  showThumbnails={true}
  thumbnailSize="md" // "sm" | "md" | "lg"
  maxFiles={8}
  accept="image/*"
/>
```

**Features:**
- ✅ Responsive grid layout
- ✅ Image thumbnail previews
- ✅ Hover effects and overlays
- ✅ Configurable grid columns
- ✅ Add more placeholder

---

### 5. ProgressFileUpload
**Upload simulation** with progress bars and status tracking.

```tsx
<ProgressFileUpload
  simulateUpload={true}
  uploadSpeed="normal" // "slow" | "normal" | "fast"
  showBandwidth={false}
  showProgress={true}
/>
```

**Features:**
- ✅ Upload progress simulation
- ✅ Individual file progress
- ✅ Overall progress tracking
- ✅ Bandwidth information
- ✅ Status indicators (uploading, completed, error)

---

### 6. TableFileUpload
**Tabular layout** with sortable columns and detailed file information.

```tsx
<TableFileUpload
  columns={["name", "type", "size", "status", "actions"]}
  sortable={true}
  showActions={true}
/>
```

**Features:**
- ✅ Sortable table columns
- ✅ Configurable column display
- ✅ File type detection
- ✅ Status tracking
- ✅ Bulk actions support

---

### 7. CardFileUpload
**Card-based layout** with file previews and metadata.

```tsx
<CardFileUpload
  cardSize="md" // "sm" | "md" | "lg"
  showMetadata={true}
  showActions={true}
/>
```

**Features:**
- ✅ Card grid layout
- ✅ File preview cards
- ✅ Metadata display
- ✅ Quick actions
- ✅ Add more placeholder

## 🛠️ Common Props

All components share these base props:

```tsx
interface FileUploadProps {
  // File restrictions
  maxFiles?: number         // Default: 10
  maxSize?: number          // Default: 10MB (in bytes)
  accept?: string           // Default: "*" (all files)
  multiple?: boolean        // Default: true (false for SingleImageUpload)
  
  // UI customization
  variant?: "default" | "minimal" | "outlined" | "filled"
  size?: "sm" | "md" | "lg"
  className?: string
  disabled?: boolean
  
  // Display options
  showProgress?: boolean    // Default: false
  showPreview?: boolean     // Default: true
  
  // Text customization
  dragText?: string         // Default: "Drop your files here"
  buttonText?: string       // Default: "Select files"
  emptyText?: string        // Auto-generated based on restrictions
  
  // Event handlers
  onFilesChange?: (files: FileWithPreview[]) => void
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void
  
  // Initial state
  initialFiles?: FileMetadata[]
  
  // Custom content
  children?: React.ReactNode
}
```

## 🎨 Styling Variants

### Variant Styles
- **`default`**: Dashed border, standard appearance
- **`minimal`**: Subtle dashed border with muted colors
- **`outlined`**: Solid border, more defined appearance  
- **`filled`**: Background fill with dashed border

### Size Options
- **`sm`**: Compact size (min-height: 8rem)
- **`md`**: Standard size (min-height: 10rem)
- **`lg`**: Large size (min-height: 12rem)

## 📋 File Types & Validation

### Accepted File Types
```tsx
// Images only
accept="image/*"

// Specific extensions
accept=".pdf,.doc,.docx,.txt"

// Multiple MIME types
accept="image/*,application/pdf"

// All files (default)
accept="*"
```

### File Size Limits
```tsx
// 5MB limit
maxSize={5 * 1024 * 1024}

// 100MB limit
maxSize={100 * 1024 * 1024}

// No limit (default)
maxSize={Infinity}
```

### Validation Features
- ✅ File type validation
- ✅ File size validation
- ✅ Duplicate file detection
- ✅ Maximum file count limits
- ✅ Comprehensive error messages

## 🎯 Usage Examples

### Basic File Upload
```tsx
import { EnhancedFileUpload } from "@/components/file-upload"

export function BasicUpload() {
  return (
    <EnhancedFileUpload
      maxFiles={5}
      maxSize={10 * 1024 * 1024}
      onFilesChange={(files) => {
        console.log("Selected files:", files)
      }}
    />
  )
}
```

### Image Gallery
```tsx
import { ImageGalleryUpload } from "@/components/file-upload"

export function PhotoGallery() {
  return (
    <ImageGalleryUpload
      accept="image/*"
      maxFiles={12}
      columns={4}
      thumbnailSize="lg"
      onFilesChange={(files) => {
        // Handle image files
        files.forEach(file => {
          if (file.preview) {
            // Display preview
          }
        })
      }}
    />
  )
}
```

### Document Upload with Progress
```tsx
import { ProgressFileUpload } from "@/components/file-upload"

export function DocumentUpload() {
  return (
    <ProgressFileUpload
      accept=".pdf,.doc,.docx"
      maxSize={50 * 1024 * 1024} // 50MB
      simulateUpload={true}
      uploadSpeed="normal"
      showBandwidth={true}
    />
  )
}
```

### Single Avatar Upload
```tsx
import { SingleImageUpload } from "@/components/file-upload"

export function AvatarUpload() {
  return (
    <SingleImageUpload
      aspectRatio="square"
      maxSize={2 * 1024 * 1024} // 2MB
      accept="image/jpeg,image/png"
      dragText="Drop your avatar here"
      buttonText="Choose avatar"
    />
  )
}
```

## 🔧 Advanced Configuration

### Custom File Validation
```tsx
import { validateFileType, validateFileSize } from "@/components/file-upload"

// Manual validation
const customValidation = (file: File) => {
  const typeCheck = validateFileType(file, "image/*")
  const sizeCheck = validateFileSize(file, 5 * 1024 * 1024)
  
  if (!typeCheck.valid) return typeCheck.error
  if (!sizeCheck.valid) return sizeCheck.error
  
  return null
}
```

### File Processing
```tsx
import { 
  formatBytes, 
  getFileType, 
  createPreviewUrl,
  revokePreviewUrl 
} from "@/components/file-upload"

// Process uploaded files
const processFiles = (files: FileWithPreview[]) => {
  files.forEach(file => {
    const fileType = getFileType(file.file)
    const formattedSize = formatBytes(file.file.size)
    
    console.log(`${file.file.name} - ${fileType} - ${formattedSize}`)
    
    // Create preview for images
    if (fileType === "image") {
      const previewUrl = createPreviewUrl(file.file)
      // Use preview...
      // Remember to revoke later: revokePreviewUrl(previewUrl)
    }
  })
}
```

### Upload Simulation Control
```tsx
import { simulateFileUpload } from "@/components/file-upload"

// Custom upload handling
const handleCustomUpload = (file: File) => {
  const cleanup = simulateFileUpload(file.size, {
    speed: "fast",
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`)
    },
    onComplete: () => {
      console.log("Upload completed!")
    },
    onError: (error) => {
      console.error("Upload failed:", error)
    }
  })
  
  // Cancel upload if needed
  // cleanup()
}
```

## 🎨 Customization

### Custom Styling
```tsx
// Custom CSS classes
<EnhancedFileUpload
  className="my-custom-upload"
  style={{ 
    borderRadius: "12px",
    backgroundColor: "rgba(0,0,0,0.02)" 
  }}
/>
```

### Custom Content
```tsx
<EnhancedFileUpload>
  <div className="flex flex-col items-center">
    <MyCustomIcon className="size-12 mb-4" />
    <h3>Upload Your Files</h3>
    <p>Drag and drop or click to browse</p>
    <Button className="mt-4">Choose Files</Button>
  </div>
</EnhancedFileUpload>
```

## 🧩 Integration Patterns

### Form Integration
```tsx
import { useForm } from "react-hook-form"
import { EnhancedFileUpload } from "@/components/file-upload"

export function FormWithUpload() {
  const form = useForm()
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <EnhancedFileUpload
        onFilesChange={(files) => {
          form.setValue("attachments", files)
        }}
      />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### State Management
```tsx
import { useState } from "react"
import type { FileWithPreview } from "@/components/file-upload"

export function StatefulUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  
  return (
    <>
      <EnhancedFileUpload
        onFilesChange={setFiles}
        initialFiles={files}
      />
      
      <div className="mt-4">
        <p>Selected: {files.length} files</p>
        <p>Total size: {getTotalSize(files)}</p>
      </div>
    </>
  )
}
```

## 🔧 Utilities & Helpers

### Available Utilities
```tsx
import {
  // File formatting
  formatBytes,
  
  // File type detection
  getFileType,
  getFileIcon,
  getFilePreview,
  
  // Validation
  validateFileType,
  validateFileSize,
  
  // File management
  generateFileId,
  createPreviewUrl,
  revokePreviewUrl,
  
  // Upload simulation
  simulateFileUpload,
  
  // Drag & drop
  isDragEventWithFiles,
  getFilesFromDragEvent,
  
  // File operations
  sortFiles,
  filterFilesByType,
  getTotalFileSize
} from "@/components/file-upload"
```

## 📱 Accessibility

All components include comprehensive accessibility features:

- ✅ **ARIA labels** and descriptions
- ✅ **Keyboard navigation** support
- ✅ **Screen reader** compatibility
- ✅ **Focus management** and indicators
- ✅ **Error announcements** with `role="alert"`
- ✅ **Semantic HTML** structure

### Keyboard Support
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate file dialog
- **Escape**: Cancel drag operations

## 🐛 Error Handling

### Validation Errors
- File size exceeds limit
- File type not accepted
- Maximum file count reached
- Duplicate files (in multiple mode)

### Error Display
```tsx
// Errors are automatically displayed
<EnhancedFileUpload
  maxSize={1024 * 1024} // 1MB
  accept="image/*"
  // Errors appear below upload area
/>
```

### Custom Error Handling
```tsx
const [uploadErrors, setUploadErrors] = useState<string[]>([])

<EnhancedFileUpload
  onFilesChange={(files) => {
    // Clear previous errors
    setUploadErrors([])
    
    // Custom validation
    const errors = files.map(file => {
      if (file.file.size > customLimit) {
        return `${file.file.name} is too large`
      }
      return null
    }).filter(Boolean)
    
    setUploadErrors(errors)
  }}
/>
```

## 🚀 Performance

### Optimization Features
- ✅ **Lazy loading** of file previews
- ✅ **Memory management** with URL cleanup
- ✅ **Debounced validations**
- ✅ **Efficient re-renders** with React.memo patterns
- ✅ **Progressive enhancement**

### Best Practices
```tsx
// Cleanup preview URLs
useEffect(() => {
  return () => {
    files.forEach(file => {
      if (file.preview) {
        revokePreviewUrl(file.preview)
      }
    })
  }
}, [])

// Debounce file processing
const debouncedProcessing = useCallback(
  debounce((files: FileWithPreview[]) => {
    // Process files...
  }, 300),
  []
)
```

## 🔗 Demo & Examples

Visit the comprehensive demo page to see all components in action:

```
/demo-file-uploads
```

The demo includes:
- ✅ All 7 component variants
- ✅ Different configurations
- ✅ File type restrictions
- ✅ Size variations
- ✅ Interactive examples

## 📄 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  FileUploadProps,
  FileUploadOptions,
  FileUploadState,
  FileUploadActions,
  FileWithPreview,
  FileMetadata,
  SingleImageUploadProps,
  MultipleFileUploadProps,
  ImageGalleryUploadProps,
  ProgressFileUploadProps,
  TableFileUploadProps,
  CardFileUploadProps
} from "@/components/file-upload"
```

## 🤝 Contributing

The file upload system is built with:
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Lucide React** icons
- **Origin UI** patterns

For modifications:
1. Update component files in `/components/file-upload/`
2. Maintain TypeScript type definitions
3. Update tests and documentation
4. Test across all variants

---

**Built with ❤️ using Origin UI patterns and modern React best practices.**