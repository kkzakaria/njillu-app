"use client"

import { useState } from "react"
import { 
  Trash2Icon, 
  LogOutIcon, 
  SaveIcon, 
  InfoIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon,
  XCircleIcon,
  SettingsIcon,
  UserIcon,
  MessageSquareIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  EnhancedAlertDialog,
  ConfirmDialog,
  DeleteDialog,
  LogoutDialog,
  SaveDialog,
  InfoDialog,
  SuccessDialog,
  ErrorDialog,
  WarningDialog,
  ConfirmationDeleteDialog,
  CriticalDeleteDialog,
  OnboardingDialog,
  WelcomeOnboardingDialog,
  FeatureOnboardingDialog,
} from "@/components/alert-dialog"

export function AlertDialogsDemo() {
  const [actionResult, setActionResult] = useState<string>("")

  const handleAction = (action: string) => {
    setActionResult(`Action exécutée : ${action}`)
    setTimeout(() => setActionResult(""), 3000)
  }

  const simulateAsyncAction = async (action: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    handleAction(action)
  }

  const longContent = (
    <div className="space-y-4">
      <div className="space-y-1">
        <p><strong>Gestion de compte</strong></p>
        <p>
          Naviguez vers la page d&apos;inscription, fournissez les informations requises 
          et vérifiez votre adresse e-mail. Vous pouvez vous inscrire en utilisant 
          votre e-mail ou via les plateformes de médias sociaux.
        </p>
      </div>
      <div className="space-y-1">
        <p><strong>Processus de réinitialisation du mot de passe</strong></p>
        <p>
          Les utilisateurs peuvent réinitialiser leur mot de passe via la page 
          des paramètres du compte. Cliquez sur &quot;Mot de passe oublié&quot; et suivez 
          les étapes de vérification par e-mail pour récupérer l&apos;accès au compte 
          rapidement et en toute sécurité.
        </p>
      </div>
      <div className="space-y-1">
        <p><strong>Niveaux de tarification des services</strong></p>
        <p>
          Nous proposons trois niveaux d&apos;abonnement principaux conçus pour répondre 
          aux besoins d&apos;utilisateurs divers : Basique (gratuit avec fonctionnalités 
          limitées), Professionnel (frais mensuels avec accès complet), et Entreprise 
          (tarification personnalisée avec toutes les capacités de la plateforme).
        </p>
      </div>
      <div className="space-y-1">
        <p><strong>Canaux de support technique</strong></p>
        <p>
          Le support client est accessible via plusieurs méthodes de communication 
          incluant le support par e-mail, le chat en direct pendant les heures 
          ouvrables, un système de tickets de support intégré, et le support 
          téléphonique spécifiquement pour les clients de niveau entreprise.
        </p>
      </div>
      <div className="space-y-1">
        <p><strong>Stratégies de protection des données</strong></p>
        <p>
          Notre plateforme implémente des mesures de sécurité rigoureuses incluant 
          le chiffrement SSL 256 bits, des audits de sécurité complets réguliers, 
          des contrôles d&apos;accès aux données stricts, et la conformité aux normes 
          internationales de protection de la vie privée.
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Alert Dialogs Améliorés - Démonstration</h2>
        <p className="text-muted-foreground">
          Collection d&apos;Alert Dialogs spécialisés avec types, icônes, et modes de défilement
        </p>
        {actionResult && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-green-800 dark:text-green-200 text-sm font-medium">
              {actionResult}
            </p>
          </div>
        )}
      </div>

      {/* Types de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🎨 Types de base</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Alert Dialog simple</h4>
            <EnhancedAlertDialog
              title="Confirmer l&apos;action"
              description="Êtes-vous sûr de vouloir effectuer cette action ?"
              trigger={<Button variant="outline">Alert simple</Button>}
              onAction={() => handleAction("Alert simple")}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Avec icône</h4>
            <EnhancedAlertDialog
              title="Action importante"
              description="Cette action nécessite votre attention."
              type="warning"
              showIcon
              trigger={<Button variant="outline">Avec icône</Button>}
              onAction={() => handleAction("Avec icône")}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Action async</h4>
            <EnhancedAlertDialog
              title="Traitement en cours"
              description="Cette action prendra quelques secondes."
              type="info"
              showIcon
              trigger={<Button variant="outline">Action async</Button>}
              onAction={() => simulateAsyncAction("Action async")}
            />
          </div>
        </div>
      </div>

      {/* Types spécialisés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🎯 Composants spécialisés</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <InfoIcon size={16} />
              Information
            </h4>
            <InfoDialog
              title="Information importante"
              description="Voici une information que vous devez connaître."
              trigger={<Button variant="outline" size="sm">Info Dialog</Button>}
              onAction={() => handleAction("Information")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircleIcon size={16} />
              Succès
            </h4>
            <SuccessDialog
              title="Opération réussie"
              description="L&apos;action a été effectuée avec succès !"
              trigger={<Button variant="outline" size="sm">Success Dialog</Button>}
              onAction={() => handleAction("Succès")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangleIcon size={16} />
              Avertissement
            </h4>
            <WarningDialog
              title="Attention requise"
              description="Cette action peut avoir des conséquences importantes."
              trigger={<Button variant="outline" size="sm">Warning Dialog</Button>}
              onAction={() => handleAction("Avertissement")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <XCircleIcon size={16} />
              Erreur
            </h4>
            <ErrorDialog
              title="Erreur détectée"
              description="Une erreur s&apos;est produite lors du traitement de votre demande."
              trigger={<Button variant="outline" size="sm">Error Dialog</Button>}
              onAction={() => handleAction("Erreur")}
            />
          </div>
        </div>
      </div>

      {/* Actions communes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">💼 Actions communes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Trash2Icon size={16} />
              Suppression
            </h4>
            <DeleteDialog
              trigger={<Button variant="destructive" size="sm">Supprimer</Button>}
              onAction={() => handleAction("Suppression")}
            />
            <DeleteDialog
              title="Supprimer l&apos;utilisateur"
              description="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprimera définitivement son compte et toutes ses données associées."
              trigger={<Button variant="outline" size="sm">Supprimer utilisateur</Button>}
              onAction={() => simulateAsyncAction("Suppression utilisateur")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <LogOutIcon size={16} />
              Déconnexion
            </h4>
            <LogoutDialog
              trigger={<Button variant="outline" size="sm">Se déconnecter</Button>}
              onAction={() => handleAction("Déconnexion")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <SaveIcon size={16} />
              Sauvegarde
            </h4>
            <SaveDialog
              trigger={<Button variant="outline" size="sm">Sauvegarder</Button>}
              onAction={() => simulateAsyncAction("Sauvegarde")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquareIcon size={16} />
              Confirmation
            </h4>
            <ConfirmDialog
              title="Confirmer l&apos;opération"
              description="Cette action modifiera les données existantes. Voulez-vous continuer ?"
              trigger={<Button variant="outline" size="sm">Confirmer</Button>}
              onAction={() => handleAction("Confirmation")}
            />
          </div>
        </div>
      </div>

      {/* Tailles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">📏 Tailles disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Petite (sm)</h4>
            <EnhancedAlertDialog
              title="Dialog petite"
              description="Contenu concis pour une dialog compacte."
              size="sm"
              type="info"
              showIcon
              trigger={<Button variant="outline" size="sm">Petite</Button>}
              onAction={() => handleAction("Petite taille")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Moyenne (md)</h4>
            <EnhancedAlertDialog
              title="Dialog moyenne"
              description="Taille standard pour la plupart des cas d&apos;usage avec un contenu équilibré."
              size="md"
              type="success"
              showIcon
              trigger={<Button variant="outline" size="sm">Moyenne</Button>}
              onAction={() => handleAction("Taille moyenne")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Grande (lg)</h4>
            <EnhancedAlertDialog
              title="Dialog grande"
              description="Plus d&apos;espace pour du contenu détaillé, des formulaires ou des informations complexes qui nécessitent plus de place pour être présentées clairement."
              size="lg"
              type="warning"
              showIcon
              trigger={<Button variant="outline" size="sm">Grande</Button>}
              onAction={() => handleAction("Grande taille")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Extra-large (xl)</h4>
            <EnhancedAlertDialog
              title="Dialog extra-large"
              description="Espace maximum pour des contenus très détaillés, des présentations complètes ou des interfaces complexes qui demandent beaucoup d&apos;espace d&apos;affichage pour une expérience utilisateur optimale."
              size="xl"
              type="error"
              showIcon
              trigger={<Button variant="outline" size="sm">Extra-large</Button>}
              onAction={() => handleAction("Taille extra-large")}
            />
          </div>
        </div>
      </div>

      {/* Modes scrollables */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">📜 Modes de défilement</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Défilement natif</h4>
            <p className="text-sm text-muted-foreground">
              Barre de défilement native du navigateur
            </p>
            <EnhancedAlertDialog
              title="Foire Aux Questions (FAQ)"
              description={longContent}
              scrollable="native"
              size="lg"
              isDialog
              trigger={<Button variant="outline" size="sm">Défilement natif</Button>}
              onAction={() => handleAction("Défilement natif")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">En-tête fixe</h4>
            <p className="text-sm text-muted-foreground">
              En-tête qui reste visible lors du défilement
            </p>
            <EnhancedAlertDialog
              title="Foire Aux Questions (FAQ)"
              description={longContent}
              scrollable="stickyHeader"
              size="lg"
              isDialog
              trigger={<Button variant="outline" size="sm">En-tête fixe</Button>}
              onAction={() => handleAction("En-tête fixe")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Pied fixe</h4>
            <p className="text-sm text-muted-foreground">
              Boutons d&apos;action toujours visibles
            </p>
            <EnhancedAlertDialog
              title="Foire Aux Questions (FAQ)"
              description={longContent}
              scrollable="stickyFooter"
              size="lg"
              isDialog
              trigger={<Button variant="outline" size="sm">Pied fixe</Button>}
              onAction={() => handleAction("Pied fixe")}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">En-tête et pied fixe</h4>
            <p className="text-sm text-muted-foreground">
              En-tête et boutons toujours visibles
            </p>
            <EnhancedAlertDialog
              title="Foire Aux Questions (FAQ)"
              description={longContent}
              scrollable="stickyBoth"
              size="lg"
              isDialog
              trigger={<Button variant="outline" size="sm">En-tête et pied fixe</Button>}
              onAction={() => handleAction("En-tête et pied fixe")}
            />
          </div>
        </div>
      </div>

      {/* Suppressions avec confirmation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🔒 Suppressions avec confirmation</h3>
        <p className="text-muted-foreground">
          Variantes de suppression qui nécessitent une confirmation explicite par saisie de texte
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Confirmation basique</h4>
            <p className="text-sm text-muted-foreground">
              L&apos;utilisateur doit taper le texte exact pour confirmer
            </p>
            <ConfirmationDeleteDialog
              title="Supprimer le projet"
              confirmationText="MonProjet"
              confirmationLabel="Nom du projet"
              trigger={<Button variant="outline" size="sm">Supprimer projet</Button>}
              onAction={() => simulateAsyncAction("Suppression projet avec confirmation")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Suppression critique</h4>
            <p className="text-sm text-muted-foreground">
              Variante spécialisée pour les suppressions dangereuses
            </p>
            <CriticalDeleteDialog
              confirmationText="SUPPRIMER"
              confirmationLabel="Tapez SUPPRIMER pour confirmer"
              trigger={<Button variant="destructive" size="sm">Suppression critique</Button>}
              onAction={() => simulateAsyncAction("Suppression critique confirmée")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Suppression d&apos;utilisateur</h4>
            <p className="text-sm text-muted-foreground">
              Confirmation avec nom d&apos;utilisateur
            </p>
            <CriticalDeleteDialog
              title="Supprimer l&apos;utilisateur"
              confirmationText="john.doe@example.com"
              confirmationLabel="Email de l&apos;utilisateur"
              description={
                <>
                  Cette action supprimera définitivement le compte utilisateur{" "}
                  <strong>john.doe@example.com</strong> et toutes ses données associées. 
                  Cette opération est irréversible.
                </>
              }
              trigger={<Button variant="destructive" size="sm">Supprimer utilisateur</Button>}
              onAction={() => simulateAsyncAction("Suppression utilisateur john.doe@example.com")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Suppression d&apos;organisation</h4>
            <p className="text-sm text-muted-foreground">
              Confirmation avec nom d&apos;organisation sensible à la casse
            </p>
            <ConfirmationDeleteDialog
              title="Supprimer l&apos;organisation"
              description={
                <>
                  Cette action supprimera définitivement l&apos;organisation{" "}
                  <strong>MonEntreprise Corp</strong>, tous ses projets, utilisateurs et données. 
                  Cette opération ne peut pas être annulée.
                </>
              }
              confirmationText="MonEntreprise Corp"
              confirmationLabel="Nom de l&apos;organisation (sensible à la casse)"
              actionText="Supprimer l&apos;organisation"
              trigger={<Button variant="destructive" size="sm">Supprimer organisation</Button>}
              onAction={() => simulateAsyncAction("Suppression organisation MonEntreprise Corp")}
            />
          </div>
        </div>
      </div>

      {/* Dialogs d&apos;onboarding */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🚀 Dialogs d&apos;Onboarding</h3>
        <p className="text-muted-foreground">
          Dialogs multi-étapes pour accueillir les utilisateurs et présenter les fonctionnalités
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Onboarding personnalisé</h4>
            <p className="text-sm text-muted-foreground">
              Dialog d&apos;onboarding avec étapes personnalisées
            </p>
            <OnboardingDialog
              steps={[
                {
                  title: "Étape personnalisée 1",
                  description: "Première étape de votre onboarding personnalisé avec du contenu spécifique.",
                  content: (
                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        ✨ Contenu personnalisé pour cette étape
                      </p>
                    </div>
                  )
                },
                {
                  title: "Configuration",
                  description: "Configurez vos préférences selon vos besoins.",
                },
                {
                  title: "Terminé !",
                  description: "Vous êtes maintenant prêt à utiliser l&apos;application.",
                }
              ]}
              trigger={<Button variant="outline" size="sm">Onboarding Custom</Button>}
              onComplete={() => handleAction("Onboarding personnalisé terminé")}
              onSkip={() => handleAction("Onboarding personnalisé ignoré")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Accueil général</h4>
            <p className="text-sm text-muted-foreground">
              Dialog d&apos;accueil prédéfini pour nouveaux utilisateurs
            </p>
            <WelcomeOnboardingDialog
              trigger={<Button variant="outline" size="sm">Accueil</Button>}
              onComplete={() => handleAction("Accueil terminé")}
              onSkip={() => handleAction("Accueil ignoré")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Nouvelle fonctionnalité</h4>
            <p className="text-sm text-muted-foreground">
              Présentation d&apos;une fonctionnalité spécifique
            </p>
            <FeatureOnboardingDialog
              featureName="Alert Dialog System"
              trigger={<Button variant="outline" size="sm">Découvrir Feature</Button>}
              onComplete={() => handleAction("Présentation fonctionnalité terminée")}
              onSkip={() => handleAction("Présentation fonctionnalité ignorée")}
            />
          </div>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">💡 Fonctionnalités des dialogs d&apos;onboarding :</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Navigation séquentielle avec boutons Précédent/Suivant</li>
            <li>• Indicateurs de progression visuels</li>
            <li>• Possibilité d&apos;ignorer l&apos;onboarding</li>
            <li>• Contenu personnalisé par étape (texte, images, composants)</li>
            <li>• Reset automatique à chaque ouverture</li>
            <li>• Callbacks pour tracking et analytics</li>
          </ul>
        </div>
      </div>

      {/* États et options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">⚙️ États et options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Sans bouton Annuler</h4>
            <InfoDialog
              title="Information simple"
              description="Message informatif sans possibilité d&apos;annulation."
              hideCancel
              trigger={<Button variant="outline" size="sm">Sans annuler</Button>}
              onAction={() => handleAction("Sans annuler")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Action désactivée</h4>
            <EnhancedAlertDialog
              title="Action indisponible"
              description="Cette action est temporairement désactivée."
              type="warning"
              showIcon
              disabled
              trigger={<Button variant="outline" size="sm">Action désactivée</Button>}
              onAction={() => handleAction("Action désactivée")}
            />
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Variants de boutons</h4>
            <div className="space-y-2">
              <EnhancedAlertDialog
                title="Action destructrice"
                description="Cette action est irréversible."
                actionVariant="destructive"
                actionText="Détruire"
                type="error"
                showIcon
                trigger={<Button variant="outline" size="sm">Destructive</Button>}
                onAction={() => handleAction("Action destructrice")}
              />
              <EnhancedAlertDialog
                title="Action secondaire"
                description="Action moins importante."
                actionVariant="secondary"
                actionText="Continuer"
                type="info"
                showIcon
                trigger={<Button variant="outline" size="sm">Secondaire</Button>}
                onAction={() => handleAction("Action secondaire")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exemples d&apos;usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">💼 Exemples d&apos;usage</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium flex items-center gap-2">
              <UserIcon size={16} />
              Gestion d&apos;utilisateur
            </h4>
            <div className="space-y-2">
              <SaveDialog
                title="Sauvegarder le profil"
                description="Les modifications du profil utilisateur seront enregistrées."
                trigger={
                  <Button variant="default" size="sm" className="w-full">
                    <SaveIcon size={14} className="mr-2" />
                    Sauvegarder profil
                  </Button>
                }
                onAction={() => simulateAsyncAction("Sauvegarde profil")}
              />
              <DeleteDialog
                title="Supprimer le compte"
                description="Cette action supprimera définitivement le compte utilisateur et toutes ses données associées. Cette action ne peut pas être annulée."
                trigger={
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2Icon size={14} className="mr-2" />
                    Supprimer compte
                  </Button>
                }
                onAction={() => simulateAsyncAction("Suppression compte")}
              />
            </div>
          </div>
          
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium flex items-center gap-2">
              <SettingsIcon size={16} />
              Configuration système
            </h4>
            <div className="space-y-2">
              <WarningDialog
                title="Réinitialiser les paramètres"
                description="Cette action restaurera tous les paramètres à leurs valeurs par défaut. Vos préférences personnalisées seront perdues."
                actionText="Réinitialiser"
                trigger={
                  <Button variant="outline" size="sm" className="w-full">
                    <SettingsIcon size={14} className="mr-2" />
                    Réinitialiser
                  </Button>
                }
                onAction={() => simulateAsyncAction("Réinitialisation")}
              />
              <InfoDialog
                title="Informations système"
                description="Version de l&apos;application : 2.1.0. Dernière mise à jour : Août 2025. Tous les systèmes fonctionnent normalement."
                trigger={
                  <Button variant="ghost" size="sm" className="w-full">
                    <InfoIcon size={14} className="mr-2" />
                    Infos système
                  </Button>
                }
                onAction={() => handleAction("Informations système")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📖 Documentation :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Props principales :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>type</code>: &quot;default&quot; | &quot;info&quot; | &quot;success&quot; | &quot;warning&quot; | &quot;error&quot; | &quot;question&quot;</li>
              <li><code>size</code>: &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;xl&quot;</li>
              <li><code>scrollable</code>: &quot;none&quot; | &quot;native&quot; | &quot;stickyHeader&quot; | &quot;stickyFooter&quot; | &quot;stickyBoth&quot;</li>
              <li><code>showIcon</code>: Afficher l&apos;icône selon le type</li>
              <li><code>actionVariant</code>: Style du bouton d&apos;action</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Composants spécialisés :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>ConfirmDialog</code> - Confirmations générales</li>
              <li><code>DeleteDialog</code> - Suppressions avec style destructif</li>
              <li><code>ConfirmationDeleteDialog</code> - Suppressions avec confirmation textuelle</li>
              <li><code>CriticalDeleteDialog</code> - Suppressions critiques avec confirmation</li>
              <li><code>OnboardingDialog</code> - Onboarding multi-étapes personnalisable</li>
              <li><code>WelcomeOnboardingDialog</code> - Accueil prédéfini</li>
              <li><code>FeatureOnboardingDialog</code> - Présentation de fonctionnalités</li>
              <li><code>LogoutDialog</code> - Déconnexions</li>
              <li><code>SaveDialog</code> - Sauvegardes</li>
              <li><code>InfoDialog, SuccessDialog, ErrorDialog, WarningDialog</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}