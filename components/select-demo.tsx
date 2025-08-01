"use client"

import { useState } from "react"
import { EnhancedSelect, SimpleSelect, GroupedSelect, SelectOption } from "@/components/enhanced-select"

// Options de base
const frameworks: SelectOption[] = [
  { value: "next.js", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
]

// Options avec groupes
const programmingOptions: SelectOption[] = [
  // Frontend
  { value: "react", label: "React", group: "Frontend" },
  { value: "vue", label: "Vue.js", group: "Frontend" },
  { value: "angular", label: "Angular", group: "Frontend" },
  { value: "svelte", label: "Svelte", group: "Frontend" },
  
  // Backend
  { value: "node", label: "Node.js", group: "Backend" },
  { value: "express", label: "Express.js", group: "Backend" },
  { value: "django", label: "Django", group: "Backend" },
  { value: "flask", label: "Flask", group: "Backend" },
  { value: "spring", label: "Spring Boot", group: "Backend" },
  
  // Base de données
  { value: "postgresql", label: "PostgreSQL", group: "Base de données" },
  { value: "mysql", label: "MySQL", group: "Base de données" },
  { value: "mongodb", label: "MongoDB", group: "Base de données" },
  { value: "redis", label: "Redis", group: "Base de données" },
  
  // Cloud
  { value: "aws", label: "Amazon Web Services", group: "Cloud" },
  { value: "azure", label: "Microsoft Azure", group: "Cloud" },
  { value: "gcp", label: "Google Cloud Platform", group: "Cloud" },
  { value: "vercel", label: "Vercel", group: "Cloud" },
]

// Options avec certaines désactivées
const statusOptions: SelectOption[] = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "pending", label: "En attente" },
  { value: "suspended", label: "Suspendu", disabled: true },
  { value: "deleted", label: "Supprimé", disabled: true },
]

// Options pays
const countryOptions: SelectOption[] = [
  { value: "fr", label: "🇫🇷 France" },
  { value: "us", label: "🇺🇸 États-Unis" },
  { value: "uk", label: "🇬🇧 Royaume-Uni" },
  { value: "de", label: "🇩🇪 Allemagne" },
  { value: "es", label: "🇪🇸 Espagne" },
  { value: "it", label: "🇮🇹 Italie" },
  { value: "ca", label: "🇨🇦 Canada" },
  { value: "au", label: "🇦🇺 Australie" },
  { value: "jp", label: "🇯🇵 Japon" },
  { value: "br", label: "🇧🇷 Brésil" },
]

export function SelectDemo() {
  const [selectedFramework, setSelectedFramework] = useState<string | undefined>()
  const [selectedTechnology, setSelectedTechnology] = useState<string | undefined>()
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>()
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>("fr")
  const [userPreference, setUserPreference] = useState<string | undefined>()
  const [projectType, setProjectType] = useState<string | undefined>("react")

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Enhanced Select - Démonstration</h2>
        <p className="text-muted-foreground">
          Composant Select avancé avec recherche, groupes et multiples options
        </p>
      </div>

      {/* Variantes de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variantes de base</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Select simple</h4>
            <SimpleSelect
              options={frameworks}
              value={selectedFramework}
              onChange={setSelectedFramework}
              label="Framework préféré"
              placeholder="Choisir un framework"
            />
            <p className="text-sm text-muted-foreground">
              Sélectionné : {selectedFramework || "Aucun"}
            </p>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Select avec groupes</h4>
            <GroupedSelect
              options={programmingOptions}
              value={selectedTechnology}
              onChange={setSelectedTechnology}
              label="Technologie"
              placeholder="Choisir une technologie"
            />
            <p className="text-sm text-muted-foreground">
              Sélectionné : {selectedTechnology || "Aucun"}
            </p>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Select avec options désactivées</h4>
            <SimpleSelect
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              label="Statut"
              placeholder="Choisir un statut"
            />
            <p className="text-sm text-muted-foreground">
              Sélectionné : {selectedStatus || "Aucun"}
            </p>
          </div>
        </div>
      </div>

      {/* Tailles et variantes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tailles et styles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-3">
            <h4 className="font-medium">Petite taille</h4>
            <EnhancedSelect
              options={countryOptions}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="Pays"
              size="sm"
              clearable
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Taille normale</h4>
            <EnhancedSelect
              options={countryOptions}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="Pays"
              size="md"
              clearable
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Grande taille</h4>
            <EnhancedSelect
              options={countryOptions}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="Pays"
              size="lg"
              clearable
            />
          </div>
        </div>
      </div>

      {/* Styles de variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Styles de variantes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-3">
            <h4 className="font-medium">Style par défaut</h4>
            <EnhancedSelect
              options={frameworks}
              placeholder="Framework"
              variant="default"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Style ghost</h4>
            <EnhancedSelect
              options={frameworks}
              placeholder="Framework"
              variant="ghost"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Style rempli</h4>
            <EnhancedSelect
              options={frameworks}
              placeholder="Framework"
              variant="filled"
            />
          </div>
        </div>
      </div>

      {/* Options avancées */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Options avancées</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Sans recherche</h4>
            <EnhancedSelect
              options={frameworks}
              value={userPreference}
              onChange={setUserPreference}
              label="Préférence utilisateur"
              placeholder="Choisir une option"
              searchable={false}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Avec bouton clear ❌</h4>
            <p className="text-sm text-muted-foreground">
              Le bouton X apparaît quand une valeur est sélectionnée
            </p>
            <EnhancedSelect
              options={frameworks}
              value={projectType}
              onChange={setProjectType}
              label="Type de projet"
              placeholder="Sélectionner le type"
              clearable
            />
            <p className="text-xs text-muted-foreground">
              Valeur actuelle : {projectType || "Aucune"}
            </p>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Messages personnalisés</h4>
            <EnhancedSelect
              options={frameworks}
              placeholder="Choisir votre outil favori"
              searchPlaceholder="Tapez pour chercher..."
              emptyMessage="Aucun outil trouvé 🤷‍♂️"
              label="Outil de développement"
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Select désactivé</h4>
            <EnhancedSelect
              options={frameworks}
              placeholder="Select désactivé"
              label="Option non disponible"
              disabled
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
            <SimpleSelect 
              options={frameworks}
              placeholder="Select normal" 
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Avec valeur</h4>
            <SimpleSelect 
              options={frameworks}
              value="react"
              placeholder="Select avec valeur" 
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Désactivé</h4>
            <SimpleSelect 
              options={frameworks}
              placeholder="Select désactivé"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Exemples d'usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Exemples d&apos;usage</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Formulaire utilisateur</h4>
              <div className="space-y-3">
                <SimpleSelect
                  options={countryOptions}
                  label="Pays de résidence"
                  placeholder="Sélectionner votre pays"
                  clearable
                />
                <GroupedSelect
                  options={programmingOptions}
                  label="Compétences techniques"
                  placeholder="Choisir vos compétences"
                  searchPlaceholder="Rechercher une technologie..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Configuration projet</h4>
              <div className="space-y-3">
                <SimpleSelect
                  options={frameworks}
                  label="Framework principal"
                  placeholder="Choisir le framework"
                />
                <SimpleSelect
                  options={statusOptions}
                  label="Statut du projet"
                  placeholder="Définir le statut"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test interactif */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Test interactif</h3>
        <div className="p-4 border rounded-lg">
          <div className="space-y-4">
            <GroupedSelect
              options={programmingOptions}
              value={selectedTechnology}
              onChange={setSelectedTechnology}
              label="Technologie sélectionnée"
              placeholder="Cliquez pour sélectionner"
              clearable
            />
            
            <div className="p-3 bg-muted rounded">
              <h4 className="font-medium mb-2">État actuel :</h4>
              <pre className="text-sm">
{`Valeur sélectionnée: ${selectedTechnology || 'null'}
Label affiché: ${selectedTechnology ? programmingOptions.find(opt => opt.value === selectedTechnology)?.label : 'Aucun'}
Groupe: ${selectedTechnology ? programmingOptions.find(opt => opt.value === selectedTechnology)?.group : 'N/A'}`}
              </pre>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTechnology("react")}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              >
                React
              </button>
              <button
                onClick={() => setSelectedTechnology("postgresql")}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
              >
                PostgreSQL
              </button>
              <button
                onClick={() => setSelectedTechnology("aws")}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
              >
                AWS
              </button>
              <button
                onClick={() => setSelectedTechnology(undefined)}
                className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Configuration de base :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>options</code>: SelectOption[] - Liste des options</li>
              <li><code>value</code>: string | undefined - Valeur sélectionnée</li>
              <li><code>onChange</code>: (value) =&gt; void - Callback de changement</li>
              <li><code>placeholder</code>: string - Texte placeholder</li>
              <li><code>label</code>: string - Label du select</li>
              <li><code>disabled</code>: boolean - État désactivé</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Options avancées :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>size</code>: &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; - Taille</li>
              <li><code>variant</code>: &quot;default&quot; | &quot;ghost&quot; | &quot;filled&quot; - Style</li>
              <li><code>searchable</code>: boolean - Recherche activée</li>
              <li><code>clearable</code>: boolean - Bouton effacer</li>
              <li><code>groupBy</code>: boolean - Groupement des options</li>
              <li><code>searchPlaceholder</code>: string - Placeholder recherche</li>
              <li><code>emptyMessage</code>: string - Message si vide</li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Interface SelectOption :</h4>
          <div className="bg-background p-3 rounded border">
            <pre className="text-sm">
{`interface SelectOption {
  value: string      // Valeur unique de l'option
  label: string      // Texte affiché
  disabled?: boolean // Option désactivée
  group?: string     // Groupe pour le groupement
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}