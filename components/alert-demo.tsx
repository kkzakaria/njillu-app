"use client"

import { useAlertHelpers } from "@/components/alert-system"
import { Alert } from "@/components/alert"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function AlertDemo() {
  const { showInfo, showSuccess, showWarning, showError } = useAlertHelpers()
  const [showStaticAlerts, setShowStaticAlerts] = useState(false)

  const handleTestToastAlerts = () => {
    showInfo("Ceci est une notification d'information avec toast")
    setTimeout(() => showSuccess("Opération réussie avec succès !"), 500)
    setTimeout(() => showWarning("Attention : action requise"), 1000)
    setTimeout(() => showError("Une erreur critique s'est produite"), 1500)
  }

  const handleTestPersistentAlert = () => {
    showError("Cette alerte persistante ne disparaîtra pas automatiquement", {
      persistent: true,
      duration: 0
    })
  }

  const handleTestLongAlert = () => {
    showInfo("Cette alerte durera 10 secondes", { duration: 10000 })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Système d'Alertes - Démonstration</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button onClick={handleTestToastAlerts} variant="default">
            Test Toasts
          </Button>
          <Button onClick={handleTestPersistentAlert} variant="destructive">
            Alerte Persistante
          </Button>
          <Button onClick={handleTestLongAlert} variant="secondary">
            Alerte Longue (10s)
          </Button>
          <Button 
            onClick={() => setShowStaticAlerts(!showStaticAlerts)} 
            variant="outline"
          >
            {showStaticAlerts ? "Masquer" : "Afficher"} Alertes Statiques
          </Button>
        </div>
      </div>

      {showStaticAlerts && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alertes Statiques</h3>
          
          <Alert variant="info">
            <strong>Information :</strong> Ceci est une alerte d'information statique avec du contenu plus détaillé pour montrer comment elle s'adapte au contenu.
          </Alert>

          <Alert variant="success" onClose={() => console.log("Success alert closed")}>
            <strong>Succès :</strong> L'opération a été réalisée avec succès ! Cette alerte peut être fermée.
          </Alert>

          <Alert variant="warning">
            <strong>Attention :</strong> Cette action nécessite votre attention. Veuillez vérifier les informations avant de continuer.
          </Alert>

          <Alert variant="error" onClose={() => console.log("Error alert closed")}>
            <strong>Erreur :</strong> Une erreur critique s'est produite. Veuillez contacter l'administrateur si le problème persiste.
          </Alert>
        </div>
      )}

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Instructions :</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Notifications :</strong> Cliquez sur l'icône de cloche dans l'AppBar pour voir les notifications</li>
          <li><strong>Test :</strong> Utilisez le bouton "Test" dans le popover de notifications</li>
          <li><strong>Interaction :</strong> Cliquez sur une notification non lue pour déclencher une alerte toast</li>
          <li><strong>Types :</strong> Les notifications ont des icônes colorées selon leur type</li>
        </ul>
      </div>
    </div>
  )
}