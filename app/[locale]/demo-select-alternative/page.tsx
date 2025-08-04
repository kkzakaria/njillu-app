import { SelectDemo } from "@/components/select-demo"

export default function DemoSelectAlternativePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Select Alternative - React 19 Compatible</h1>
        <p className="text-muted-foreground">
          Version alternative du composant Select qui n&apos;utilise pas cmdk pour éviter les erreurs React 19
        </p>
      </div>
      <SelectDemo />
    </div>
  )
}