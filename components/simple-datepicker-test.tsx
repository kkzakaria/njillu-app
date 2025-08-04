"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export function SimpleDatePickerTest() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">Test DatePicker Simple</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Date sélectionnée : {date ? date.toLocaleDateString('fr-FR') : 'Aucune'}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 w-fit">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted rounded">
        <h3 className="font-medium mb-2">État du composant :</h3>
        <pre className="text-xs">
          {JSON.stringify({ date: date?.toISOString() }, null, 2)}
        </pre>
      </div>
    </div>
  )
}