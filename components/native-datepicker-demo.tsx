"use client"

import { useState } from "react"
import { format } from "date-fns"
import { NativeDatePicker, PopoverNativeDatePicker } from "@/components/native-datepicker"

export function NativeDatePickerDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [meetingDate, setMeetingDate] = useState<Date | undefined>()
  const [birthDate, setBirthDate] = useState<Date | undefined>()

  const currentYear = new Date().getFullYear()
  const minDate = `${currentYear - 100}-01-01`
  const maxDate = `${currentYear + 10}-12-31`

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Native DatePicker - Alternative Stable</h2>
        <p className="text-muted-foreground">
          Version utilisant l'input HTML natif pour éviter les problèmes de compatibilité
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variantes</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Direct */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">DatePicker Direct (Input HTML natif)</h4>
            <div className="space-y-3">
              <NativeDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Sélectionner une date"
              />
              <p className="text-sm text-muted-foreground">
                Date sélectionnée : {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Aucune"}
              </p>
            </div>
          </div>

          {/* Popover Version */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">DatePicker avec Popover</h4>
            <div className="space-y-3">
              <PopoverNativeDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Sélectionner une date"
              />
              <p className="text-sm text-muted-foreground">
                Même date dans un popover pour l'UX
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* États */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">États</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-3">
            <h4 className="font-medium">Normal</h4>
            <NativeDatePicker placeholder="DatePicker normal" />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Avec valeur</h4>
            <NativeDatePicker 
              value={new Date()} 
              placeholder="Avec date sélectionnée" 
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Désactivé</h4>
            <NativeDatePicker 
              placeholder="DatePicker désactivé"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Contraintes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contraintes de Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Date de naissance (1950-2005)</h4>
            <NativeDatePicker
              value={birthDate}
              onChange={setBirthDate}
              placeholder="Sélectionner date de naissance"
              min="1950-01-01"
              max="2005-12-31"
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Réservation future uniquement</h4>
            <NativeDatePicker
              value={meetingDate}
              onChange={setMeetingDate}
              placeholder="Date de réunion"
              min={new Date().toISOString().split('T')[0]}
              max={`${currentYear + 2}-12-31`}
            />
          </div>
        </div>
      </div>

      {/* Exemples d'usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Exemples d'usage en forme</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Formulaire de réservation</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date d'arrivée</label>
                  <PopoverNativeDatePicker
                    placeholder="Sélectionner la date d'arrivée"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de départ</label>
                  <PopoverNativeDatePicker
                    placeholder="Sélectionner la date de départ"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Informations personnelles</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de naissance</label>
                  <NativeDatePicker
                    placeholder="jj/mm/aaaa"
                    min="1920-01-01"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date d'embauche</label>
                  <NativeDatePicker
                    placeholder="Date d'embauche"
                    min="2000-01-01"
                    max={maxDate}
                  />
                </div>
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
            <PopoverNativeDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Cliquez pour sélectionner une date"
            />
            
            <div className="p-3 bg-muted rounded">
              <h4 className="font-medium mb-2">État actuel :</h4>
              <pre className="text-sm">
{`Date sélectionnée: ${selectedDate ? selectedDate.toLocaleDateString('fr-FR') : 'Aucune'}
Valeur ISO: ${selectedDate ? selectedDate.toISOString() : 'null'}
Format affiché: ${selectedDate ? format(selectedDate, "dd/MM/yyyy") : 'N/A'}
Input value: ${selectedDate ? selectedDate.toISOString().split('T')[0] : 'N/A'}`}
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
              <button
                onClick={() => setSelectedDate(new Date('2025-12-25'))}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
              >
                Noël 2025
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Avantages/Inconvénients */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Native DatePicker vs React-Day-Picker</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ Avantages :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Aucun problème de compatibilité React</li>
              <li>Performance native du navigateur</li>
              <li>Support mobile excellent</li>
              <li>Accessibilité intégrée</li>
              <li>Contraintes min/max natives</li>
              <li>Localisation automatique du navigateur</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-amber-600 mb-2">⚠️ Limitations :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Style limité (depend du navigateur)</li>
              <li>Pas de sélection de plage</li>
              <li>Pas de dropdowns mois/année</li>
              <li>Format fixe par navigateur</li>
              <li>Moins de contrôle sur l'UX</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}