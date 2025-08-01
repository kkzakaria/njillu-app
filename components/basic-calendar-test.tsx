"use client"

import { useState } from "react"

export function BasicCalendarTest() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">Test Calendrier Ultra-Basique</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Date sélectionnée : {date ? date.toLocaleDateString('fr-FR') : 'Aucune'}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 w-fit">
          <p>Calendrier HTML basique :</p>
          <input 
            type="date" 
            value={date ? date.toISOString().split('T')[0] : ''}
            onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
            className="mt-2 p-2 border rounded"
          />
        </div>

        <div className="border rounded-lg p-4 w-fit">
          <p>Test sans Calendar component :</p>
          <button 
            onClick={() => setDate(new Date())}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Sélectionner aujourd'hui
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted rounded">
        <h3 className="font-medium mb-2">État du composant :</h3>
        <pre className="text-xs">
          {JSON.stringify({ 
            date: date?.toISOString(),
            formatted: date?.toLocaleDateString('fr-FR')
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}