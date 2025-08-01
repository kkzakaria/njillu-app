"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr, enUS, es } from "date-fns/locale"
import { EnhancedDatePicker, SimpleDatePicker, InlineDatePicker } from "@/components/enhanced-datepicker"

const locales = {
  fr: fr,
  en: enUS,
  es: es
}

export function DatePickerDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [meetingDate, setMeetingDate] = useState<Date | undefined>()
  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [frenchDate, setFrenchDate] = useState<Date | undefined>()
  const [englishDate, setEnglishDate] = useState<Date | undefined>()
  const [spanishDate, setSpanishDate] = useState<Date | undefined>()

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Enhanced DatePicker - Démonstration</h2>
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
                Date sélectionnée : {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: fr }) : "Aucune"}
              </p>
            </div>
          </div>

          {/* Inline Variant */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">DatePicker Inline (toujours visible)</h4>
            <InlineDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              locale="fr"
            />
          </div>
        </div>
      </div>

      {/* Langues */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Support Multi-langues</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-3">
            <h4 className="font-medium">🇫🇷 Français</h4>
            <SimpleDatePicker
              value={frenchDate}
              onChange={setFrenchDate}
              locale="fr"
              placeholder="Choisir une date"
            />
            <p className="text-xs text-muted-foreground">
              Format : dd/MM/yyyy
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">🇺🇸 English</h4>
            <SimpleDatePicker
              value={englishDate}
              onChange={setEnglishDate}
              locale="en"
              placeholder="Pick a date"
            />
            <p className="text-xs text-muted-foreground">
              Format : MM/dd/yyyy
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">🇪🇸 Español</h4>
            <SimpleDatePicker
              value={spanishDate}
              onChange={setSpanishDate}
              locale="es"
              placeholder="Elegir una fecha"
            />
            <p className="text-xs text-muted-foreground">
              Format : dd/MM/yyyy
            </p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Options et Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Plage d'années personnalisée</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Années : 1990 - 2010 (pour date de naissance)
            </p>
            <SimpleDatePicker
              value={birthDate}
              onChange={setBirthDate}
              placeholder="Date de naissance"
              startYear={1990}
              endYear={2010}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Sans bouton "Effacer"</h4>
            <SimpleDatePicker
              value={meetingDate}
              onChange={setMeetingDate}
              placeholder="Date de réunion"
              clearable={false}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Navigation simple (sans dropdowns)</h4>
            <EnhancedDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Navigation par flèches"
              showYearSelect={false}
              showMonthSelect={false}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Format personnalisé</h4>
            <EnhancedDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Format personnalisé"
              formatString="EEEE dd MMMM yyyy"
              locale="fr"
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
                  startYear={new Date().getFullYear()}
                  endYear={new Date().getFullYear() + 2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de départ</label>
                <SimpleDatePicker
                  placeholder="Sélectionner la date de départ"
                  startYear={new Date().getFullYear()}
                  endYear={new Date().getFullYear() + 2}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Informations personnelles</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de naissance</label>
                <SimpleDatePicker
                  placeholder="jj/mm/aaaa"
                  startYear={1950}
                  endYear={new Date().getFullYear() - 16}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'embauche</label>
                <SimpleDatePicker
                  placeholder="Date d'embauche"
                  startYear={2000}
                  endYear={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Props disponibles :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Configuration de base :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>value</code>: Date | undefined - Date sélectionnée</li>
              <li><code>onChange</code>: (date) => void - Callback de changement</li>
              <li><code>placeholder</code>: string - Texte placeholder</li>
              <li><code>disabled</code>: boolean - État désactivé</li>
              <li><code>locale</code>: "fr" | "en" | "es" - Langue</li>
              <li><code>variant</code>: "input" | "inline" - Mode d'affichage</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Options avancées :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>showYearSelect</code>: boolean - Dropdown année</li>
              <li><code>showMonthSelect</code>: boolean - Dropdown mois</li>
              <li><code>startYear</code>: number - Année minimum</li>
              <li><code>endYear</code>: number - Année maximum</li>
              <li><code>formatString</code>: string - Format d'affichage</li>
              <li><code>clearable</code>: boolean - Bouton effacer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}