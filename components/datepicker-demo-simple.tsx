"use client"

import { useState } from "react"
import { format } from "date-fns"
import { EnhancedDatePicker, SimpleDatePicker, InlineDatePicker } from "@/components/enhanced-datepicker-simple"

export function DatePickerDemoSimple() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [meetingDate, setMeetingDate] = useState<Date | undefined>()
  const [birthDate, setBirthDate] = useState<Date | undefined>()

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Enhanced DatePicker - Démonstration</h2>
        <p className="text-muted-foreground">
          Version simplifiée pour éviter les problèmes de compatibilité
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variantes</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Variant */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">DatePicker Input (avec Popover)</h4>
            <div className="space-y-3">
              <SimpleDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Sélectionner une date"
              />
              <p className="text-sm text-muted-foreground">
                Date sélectionnée : {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Aucune"}
              </p>
            </div>
          </div>

          {/* Inline Variant */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">DatePicker Inline (toujours visible)</h4>
            <InlineDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </div>
        </div>
      </div>

      {/* États */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">États</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-3">
            <h4 className="font-medium">Normal</h4>
            <SimpleDatePicker placeholder="DatePicker normal" />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Avec valeur</h4>
            <SimpleDatePicker 
              value={new Date()} 
              placeholder="Avec date sélectionnée" 
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Désactivé</h4>
            <SimpleDatePicker 
              placeholder="DatePicker désactivé"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Avec bouton "Effacer"</h4>
            <SimpleDatePicker
              value={meetingDate}
              onChange={setMeetingDate}
              placeholder="Date de réunion"
              clearable={true}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Sans bouton "Effacer"</h4>
            <SimpleDatePicker
              value={birthDate}
              onChange={setBirthDate}
              placeholder="Date de naissance"
              clearable={false}
            />
          </div>
        </div>
      </div>

      {/* Exemples d'usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Exemples d'usage</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Formulaire de réservation</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'arrivée</label>
                <SimpleDatePicker
                  placeholder="Sélectionner la date d'arrivée"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de départ</label>
                <SimpleDatePicker
                  placeholder="Sélectionner la date de départ"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Informations personnelles</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de naissance</label>
                <SimpleDatePicker
                  placeholder="jj/mm/aaaa"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'embauche</label>
                <SimpleDatePicker
                  placeholder="Date d'embauche"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test interactif */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Test Interactif</h3>
        <div className="p-4 border rounded-lg">
          <div className="space-y-4">
            <SimpleDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Cliquez pour sélectionner une date"
            />
            
            <div className="p-3 bg-muted rounded">
              <h4 className="font-medium mb-2">État actuel :</h4>
              <pre className="text-sm">
{`Date sélectionnée: ${selectedDate ? selectedDate.toLocaleDateString('fr-FR') : 'Aucune'}
Valeur ISO: ${selectedDate ? selectedDate.toISOString() : 'null'}
Format affiché: ${selectedDate ? format(selectedDate, "dd/MM/yyyy") : 'N/A'}`}
              </pre>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setSelectedDate(undefined)}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Props disponibles :</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code>value</code>: Date | undefined - Date sélectionnée</li>
          <li><code>onChange</code>: (date) => void - Callback de changement</li>
          <li><code>placeholder</code>: string - Texte placeholder</li>
          <li><code>disabled</code>: boolean - État désactivé</li>
          <li><code>variant</code>: "input" | "inline" - Mode d'affichage</li>
          <li><code>clearable</code>: boolean - Bouton effacer</li>
          <li><code>className</code>: string - Classes CSS personnalisées</li>
        </ul>
      </div>
    </div>
  )
}