import type { Metadata } from "next"
import { 
  EnhancedFileUpload,
  SingleImageUpload,
  MultipleFileUpload,
  ImageGalleryUpload,
  ProgressFileUpload,
  TableFileUpload,
  CardFileUpload
} from "@/components/file-upload"

export const metadata: Metadata = {
  title: "File Upload Components Demo",
  description: "Comprehensive demonstration of all file upload component variants",
}

export default function DemoFileUploadsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">File Upload Components</h1>
        <p className="text-muted-foreground text-lg">
          7 specialized file upload components with different layouts and features
        </p>
      </div>

      <div className="space-y-12">
        {/* Enhanced File Upload */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Enhanced File Upload</h2>
            <p className="text-muted-foreground text-sm">
              Base component with drag & drop, previews, and multiple variants
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium">Default variant</h3>
              <EnhancedFileUpload />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Outlined variant</h3>
              <EnhancedFileUpload variant="outlined" />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Filled variant</h3>
              <EnhancedFileUpload variant="filled" />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Minimal variant</h3>
              <EnhancedFileUpload variant="minimal" />
            </div>
          </div>
        </section>

        {/* Single Image Upload */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Single Image Upload</h2>
            <p className="text-muted-foreground text-sm">
              Specialized for single image uploads with preview and aspect ratio control
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-medium">Square aspect ratio</h3>
              <SingleImageUpload aspectRatio="square" />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Video aspect ratio</h3>
              <SingleImageUpload aspectRatio="video" />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Free aspect ratio</h3>
              <SingleImageUpload aspectRatio="free" />
            </div>
          </div>
        </section>

        {/* Multiple File Upload */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Multiple File Upload</h2>
            <p className="text-muted-foreground text-sm">
              Handle multiple files with different list layouts
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Detailed list (default)</h3>
              <MultipleFileUpload listType="detailed" maxFiles={5} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Simple list</h3>
              <MultipleFileUpload listType="simple" maxFiles={5} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Compact list</h3>
              <MultipleFileUpload listType="compact" maxFiles={5} />
            </div>
          </div>
        </section>

        {/* Image Gallery Upload */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Image Gallery Upload</h2>
            <p className="text-muted-foreground text-sm">
              Grid layout for image uploads with thumbnail previews
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">4 columns (default)</h3>
              <ImageGalleryUpload columns={4} maxFiles={8} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">3 columns</h3>
              <ImageGalleryUpload columns={3} maxFiles={6} />
            </div>
          </div>
        </section>

        {/* Progress File Upload */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Progress File Upload</h2>
            <p className="text-muted-foreground text-sm">
              Upload simulation with progress bars and status tracking
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">With progress simulation</h3>
              <ProgressFileUpload simulateUpload={true} uploadSpeed="normal" maxFiles={5} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">With bandwidth info</h3>
              <ProgressFileUpload 
                simulateUpload={true} 
                uploadSpeed="fast" 
                showBandwidth={true} 
                maxFiles={3} 
              />
            </div>
          </div>
        </section>

        {/* Table File Upload */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Table File Upload</h2>
            <p className="text-muted-foreground text-sm">
              Tabular layout with sortable columns and detailed file information
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Full table with all columns</h3>
              <TableFileUpload 
                columns={["name", "type", "size", "status", "actions"]} 
                sortable={true} 
                maxFiles={5} 
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Minimal table</h3>
              <TableFileUpload 
                columns={["name", "size", "actions"]} 
                sortable={false} 
                maxFiles={3} 
              />
            </div>
          </div>
        </section>

        {/* Card File Upload */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Card File Upload</h2>
            <p className="text-muted-foreground text-sm">
              Card-based layout with file previews and metadata
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Medium cards (default)</h3>
              <CardFileUpload cardSize="md" maxFiles={6} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Large cards with metadata</h3>
              <CardFileUpload 
                cardSize="lg" 
                showMetadata={true} 
                showActions={true} 
                maxFiles={4} 
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Small cards, minimal actions</h3>
              <CardFileUpload 
                cardSize="sm" 
                showMetadata={false} 
                showActions={false} 
                maxFiles={8} 
              />
            </div>
          </div>
        </section>

        {/* Size Variants */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">Size Variants</h2>
            <p className="text-muted-foreground text-sm">
              Different sizes for various use cases
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-medium">Small</h3>
              <EnhancedFileUpload size="sm" maxFiles={3} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Medium (default)</h3>
              <EnhancedFileUpload size="md" maxFiles={3} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Large</h3>
              <EnhancedFileUpload size="lg" maxFiles={3} />
            </div>
          </div>
        </section>

        {/* Restricted File Types */}
        <section>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">File Type Restrictions</h2>
            <p className="text-muted-foreground text-sm">
              Examples with different accepted file types
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium">Images only</h3>
              <EnhancedFileUpload 
                accept="image/*" 
                emptyText="PNG, JPG, GIF up to 5MB"
                maxSize={5 * 1024 * 1024}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Documents only</h3>
              <EnhancedFileUpload 
                accept=".pdf,.doc,.docx,.txt"
                emptyText="PDF, DOC, DOCX, TXT up to 10MB"
                maxSize={10 * 1024 * 1024}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Audio files</h3>
              <EnhancedFileUpload 
                accept="audio/*"
                emptyText="MP3, WAV, OGG up to 20MB"
                maxSize={20 * 1024 * 1024}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Video files</h3>
              <EnhancedFileUpload 
                accept="video/*"
                emptyText="MP4, AVI, MOV up to 100MB"
                maxSize={100 * 1024 * 1024}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t pt-8 text-center">
        <p className="text-muted-foreground text-sm">
          All components are built with TypeScript, support drag & drop, and include comprehensive error handling.
        </p>
      </div>
    </div>
  )
}