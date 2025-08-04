"use client"

import { EnhancedCheckbox } from "@/components/enhanced-checkbox"

export function QuickCheckboxTest() {
  return (
    <div className="space-y-8 p-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Test Rapide - Checkbox Position & Couleurs</h2>
      
      {/* Test Position */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold">Test Position</h3>
        
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
            <p className="text-sm font-medium mb-2">Position LEFT (défaut) :</p>
            <EnhancedCheckbox
              label="□ Checkbox AVANT le texte"
              position="left"
              defaultChecked
              color="primary"
            />
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
            <p className="text-sm font-medium mb-2">Position RIGHT :</p>
            <EnhancedCheckbox
              label="Checkbox APRÈS le texte □"
              position="right"
              defaultChecked
              color="success"
            />
          </div>
        </div>
      </div>

      {/* Test Couleurs */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold">Test Couleurs (COCHÉES)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EnhancedCheckbox label="🔵 Primary (bleu)" color="primary" defaultChecked />
          <EnhancedCheckbox label="🟢 Success (vert)" color="success" defaultChecked />
          <EnhancedCheckbox label="🟠 Warning (orange)" color="warning" defaultChecked />
          <EnhancedCheckbox label="🔴 Destructive (rouge)" color="destructive" defaultChecked />
        </div>
      </div>

      {/* Test Couleurs Interactif */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold">Test Couleurs (INTERACTIF)</h3>
        <p className="text-sm text-muted-foreground">Cochez pour voir les couleurs :</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EnhancedCheckbox label="🔵 Primary" color="primary" />
          <EnhancedCheckbox label="🟢 Success" color="success" />
          <EnhancedCheckbox label="🟠 Warning" color="warning" />
          <EnhancedCheckbox label="🔴 Destructive" color="destructive" />
        </div>
      </div>

      {/* Test Position + Couleur */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold">Test Position + Couleur</h3>
        <div className="space-y-3">
          <EnhancedCheckbox 
            label="Position LEFT + Couleur Success" 
            position="left" 
            color="success" 
            defaultChecked
          />
          <EnhancedCheckbox 
            label="Position RIGHT + Couleur Warning" 
            position="right" 
            color="warning" 
            defaultChecked
          />
        </div>
      </div>
    </div>
  )
}