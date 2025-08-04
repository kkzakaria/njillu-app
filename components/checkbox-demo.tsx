"use client"

import { useState } from "react"
import { EnhancedCheckbox, SimpleCheckbox } from "@/components/enhanced-checkbox"

export function CheckboxDemo() {
  const [checked, setChecked] = useState(false)
  const [indeterminate, setIndeterminate] = useState<boolean | "indeterminate">("indeterminate")

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Enhanced Checkbox - Démonstration</h2>
      </div>

      {/* Positions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Positions de la Checkbox</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Checkbox AVANT le texte (position="left" - défaut)</h4>
            <EnhancedCheckbox
              label="□ Checkbox à gauche du texte"
              description="Cette checkbox est placée avant le label (comportement par défaut)"
              position="left"
              color="primary"
              defaultChecked
            />
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Checkbox APRÈS le texte (position="right")</h4>
            <EnhancedCheckbox
              label="Checkbox à droite du texte □"
              description="Cette checkbox est placée après le label - utile pour certains designs"
              position="right"
              color="success"
              defaultChecked
            />
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Comparaison côte à côte</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded bg-background">
                <p className="text-xs text-muted-foreground mb-2">position="left"</p>
                <EnhancedCheckbox
                  label="Accepter les conditions"
                  description="Checkbox avant le texte"
                  position="left"
                  color="primary"
                  defaultChecked
                />
              </div>
              <div className="p-3 border rounded bg-background">
                <p className="text-xs text-muted-foreground mb-2">position="right"</p>
                <EnhancedCheckbox
                  label="Accepter les conditions"
                  description="Checkbox après le texte"
                  position="right"
                  color="primary"
                  defaultChecked
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tailles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EnhancedCheckbox
            label="Petite (sm)"
            description="Checkbox 12px"
            size="sm"
            defaultChecked
          />
          <EnhancedCheckbox
            label="Moyenne (md)"
            description="Checkbox 16px - défaut"
            size="md"
            defaultChecked
          />
          <EnhancedCheckbox
            label="Grande (lg)"
            description="Checkbox 20px"
            size="lg"
            defaultChecked
          />
        </div>
      </div>

      {/* Couleurs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Couleurs</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Les couleurs sont visibles uniquement quand les checkboxes sont cochées
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <EnhancedCheckbox
                label="Par défaut (thème)"
                description="Utilise la couleur du thème"
                color="default"
                defaultChecked
              />
            </div>
            <div className="space-y-2">
              <EnhancedCheckbox
                label="Primaire (bleu)"
                description="Couleur principale du thème"
                color="primary"
                defaultChecked
              />
            </div>
            <div className="space-y-2">
              <EnhancedCheckbox
                label="Succès (vert)"
                description="Pour les actions positives"
                color="success"
                defaultChecked
              />
            </div>
            <div className="space-y-2">
              <EnhancedCheckbox
                label="Attention (orange)"
                description="Pour les avertissements"
                color="warning"
                defaultChecked
              />
            </div>
            <div className="space-y-2">
              <EnhancedCheckbox
                label="Destructive (rouge)"
                description="Pour les actions dangereuses"
                color="destructive"
                defaultChecked
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-background border rounded">
            <h4 className="font-medium mb-2">Test interactif des couleurs</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Cochez/décochez pour voir les couleurs en action :
            </p>
            <div className="space-y-2">
              <EnhancedCheckbox label="🟢 Vert (success)" color="success" />
              <EnhancedCheckbox label="🟠 Orange (warning)" color="warning" />
              <EnhancedCheckbox label="🔴 Rouge (destructive)" color="destructive" />
              <EnhancedCheckbox label="🔵 Bleu (primary)" color="primary" />
            </div>
          </div>
        </div>
      </div>

      {/* États */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">États</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnhancedCheckbox
            label="Non cochée"
            description="État par défaut"
          />
          <EnhancedCheckbox
            label="Cochée"
            description="État activé"
            defaultChecked
          />
          <EnhancedCheckbox
            label="Indéterminée"
            description="État mixte"
            checked={indeterminate}
            onCheckedChange={setIndeterminate}
          />
          <EnhancedCheckbox
            label="Désactivée"
            description="État inactif"
            disabled
            defaultChecked
          />
        </div>
      </div>

      {/* Contrôlée */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Checkbox Contrôlée</h3>
        <div className="space-y-4">
          <EnhancedCheckbox
            label={`Checkbox contrôlée (${checked ? 'cochée' : 'non cochée'})`}
            description="Cette checkbox est contrôlée par l'état React"
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
            color="primary"
          />
          <button
            onClick={() => setChecked(!checked)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Basculer l'état
          </button>
        </div>
      </div>

      {/* SimpleCheckbox */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">SimpleCheckbox</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SimpleCheckbox
            label="Utilisation simple"
            defaultChecked
          />
          <SimpleCheckbox
            label="Avec couleur"
            color="success"
            defaultChecked
          />
        </div>
      </div>

      {/* Exemples d'usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Exemples d'usage</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium">Paramètres utilisateur</h4>
          <div className="space-y-3">
            <EnhancedCheckbox
              label="Recevoir les notifications par email"
              description="Être informé des nouvelles notifications importantes"
              color="primary"
              defaultChecked
            />
            <EnhancedCheckbox
              label="Activer le mode sombre automatique"
              description="Basculer automatiquement selon l'heure"
              color="primary"
            />
            <EnhancedCheckbox
              label="Partager les données d'usage"
              description="Aider à améliorer l'application (anonyme)"
              color="success"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Props disponibles :</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code>position</code>: "left" | "right" - Position de la checkbox par rapport au texte</li>
          <li><code>label</code>: string - Texte du label</li>
          <li><code>description</code>: string - Description sous le label</li>
          <li><code>color</code>: "default" | "primary" | "success" | "warning" | "destructive"</li>
          <li><code>size</code>: "sm" | "md" | "lg" - Taille de la checkbox</li>
          <li><code>disabled</code>: boolean - État désactivé</li>
          <li><code>checked</code>: boolean | "indeterminate" - État de la checkbox</li>
          <li><code>onCheckedChange</code>: callback pour les changements d'état</li>
        </ul>
      </div>
    </div>
  )
}