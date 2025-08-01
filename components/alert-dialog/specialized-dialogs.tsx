"use client"

import * as React from "react"
import { TrashIcon, LogOutIcon, SaveIcon } from "lucide-react"
import { EnhancedAlertDialog } from "./enhanced-alert-dialog"
import { ConfirmationDeleteDialog } from "./confirmation-delete-dialog"
import { OnboardingDialog } from "./onboarding-dialog"
import { type BaseAlertDialogProps, type ConfirmationDeleteDialogProps, type OnboardingDialogProps } from "./types"

// Composants spécialisés prédéfinis
export const ConfirmDialog = React.forwardRef<
  React.ComponentRef<typeof EnhancedAlertDialog>,
  Omit<BaseAlertDialogProps, "type" | "showIcon">
>(({ actionText = "Confirmer", ...props }, ref) => {
  return (
    <EnhancedAlertDialog
      ref={ref}
      type="question"
      showIcon
      actionText={actionText}
      {...props}
    />
  )
})

ConfirmDialog.displayName = "ConfirmDialog"

export const DeleteDialog = React.forwardRef<
  React.ComponentRef<typeof EnhancedAlertDialog>,
  Omit<BaseAlertDialogProps, "type" | "showIcon" | "actionVariant" | "icon">
>(({ 
  title = "Supprimer l'élément", 
  description = "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet élément ?",
  actionText = "Supprimer",
  ...props 
}, ref) => {
  return (
    <EnhancedAlertDialog
      ref={ref}
      type="error"
      showIcon
      title={title}
      description={description}
      actionText={actionText}
      actionVariant="destructive"
      icon={TrashIcon}
      {...props}
    />
  )
})

DeleteDialog.displayName = "DeleteDialog"

export const LogoutDialog = React.forwardRef<
  React.ComponentRef<typeof EnhancedAlertDialog>,
  Omit<BaseAlertDialogProps, "type" | "showIcon" | "icon">
>(({ 
  title = "Se déconnecter", 
  description = "Êtes-vous sûr de vouloir vous déconnecter ?",
  actionText = "Se déconnecter",
  ...props 
}, ref) => {
  return (
    <EnhancedAlertDialog
      ref={ref}
      type="warning"
      showIcon
      title={title}
      description={description}
      actionText={actionText}
      icon={LogOutIcon}
      {...props}
    />
  )
})

LogoutDialog.displayName = "LogoutDialog"

export const SaveDialog = React.forwardRef<
  React.ComponentRef<typeof EnhancedAlertDialog>,
  Omit<BaseAlertDialogProps, "type" | "showIcon" | "icon">
>(({ 
  title = "Sauvegarder les modifications", 
  description = "Voulez-vous enregistrer les modifications avant de continuer ?",
  actionText = "Sauvegarder",
  ...props 
}, ref) => {
  return (
    <EnhancedAlertDialog
      ref={ref}
      type="info"
      showIcon
      title={title}
      description={description}
      actionText={actionText}
      icon={SaveIcon}
      {...props}
    />
  )
})

SaveDialog.displayName = "SaveDialog"

export const InfoDialog = React.forwardRef<
  React.ComponentRef<typeof EnhancedAlertDialog>,
  Omit<BaseAlertDialogProps, "type" | "showIcon">
>(({ actionText = "D'accord", hideCancel = true, ...props }, ref) => {
  return (
    <EnhancedAlertDialog
      ref={ref}
      type="info"
      showIcon
      actionText={actionText}
      hideCancel={hideCancel}
      {...props}
    />
  )
})

InfoDialog.displayName = "InfoDialog"

export const SuccessDialog = React.forwardRef<
  React.ComponentRef<typeof EnhancedAlertDialog>,
  Omit<BaseAlertDialogProps, "type" | "showIcon">
>(({ actionText = "Parfait", hideCancel = true, ...props }, ref) => {
  return (
    <EnhancedAlertDialog
      ref={ref}
      type="success"
      showIcon
      actionText={actionText}
      hideCancel={hideCancel}
      {...props}
    />
  )
})

SuccessDialog.displayName = "SuccessDialog"

export const ErrorDialog = React.forwardRef<
  React.ComponentRef<typeof EnhancedAlertDialog>,
  Omit<BaseAlertDialogProps, "type" | "showIcon">
>(({ actionText = "Compris", hideCancel = true, ...props }, ref) => {
  return (
    <EnhancedAlertDialog
      ref={ref}
      type="error"
      showIcon
      actionText={actionText}
      hideCancel={hideCancel}
      {...props}
    />
  )
})

ErrorDialog.displayName = "ErrorDialog"

export const WarningDialog = React.forwardRef<
  React.ComponentRef<typeof EnhancedAlertDialog>,
  Omit<BaseAlertDialogProps, "type" | "showIcon">
>(({ actionText = "Continuer", ...props }, ref) => {
  return (
    <EnhancedAlertDialog
      ref={ref}
      type="warning"
      showIcon
      actionText={actionText}
      {...props}
    />
  )
})

WarningDialog.displayName = "WarningDialog"

export const CriticalDeleteDialog = React.forwardRef<
  React.ComponentRef<typeof ConfirmationDeleteDialog>,
  Omit<ConfirmationDeleteDialogProps, "actionText" | "title">
>(({ 
  confirmationText,
  description,
  actionText = "Supprimer définitivement",
  title = "Suppression critique",
  ...props 
}, ref) => {
  const defaultDescription = description || (
    <>
      Cette action supprimera définitivement <strong>{confirmationText}</strong> et toutes ses données associées. 
      Cette opération est irréversible et ne peut pas être annulée.
    </>
  )

  return (
    <ConfirmationDeleteDialog
      ref={ref}
      title={title}
      description={defaultDescription}
      actionText={actionText}
      confirmationText={confirmationText}
      {...props}
    />
  )
})

CriticalDeleteDialog.displayName = "CriticalDeleteDialog"

// Composants d'onboarding spécialisés
export const WelcomeOnboardingDialog = React.forwardRef<
  React.ComponentRef<typeof OnboardingDialog>,
  Omit<OnboardingDialogProps, "steps">
>(({ 
  trigger,
  onComplete,
  onSkip,
  ...props 
}, ref) => {
  const defaultSteps = [
    {
      title: "Bienvenue !",
      description: "Découvrez notre plateforme et ses fonctionnalités conçues pour simplifier votre workflow de développement.",
      image: "/dialog-content.png"
    },
    {
      title: "Interface intuitive",
      description: "Une interface moderne et intuitive qui s'adapte à vos besoins et améliore votre productivité au quotidien.",
    },
    {
      title: "Composants avancés",
      description: "Une bibliothèque complète de composants personnalisables et accessible, conçue avec les meilleures pratiques.",
    },
    {
      title: "Prêt à commencer ?",
      description: "Vous avez maintenant toutes les clés en main pour créer des interfaces exceptionnelles. Bon développement !",
    }
  ]

  return (
    <OnboardingDialog
      ref={ref}
      steps={defaultSteps}
      trigger={trigger}
      onComplete={onComplete}
      onSkip={onSkip}
      {...props}
    />
  )
})

WelcomeOnboardingDialog.displayName = "WelcomeOnboardingDialog"

export const FeatureOnboardingDialog = React.forwardRef<
  React.ComponentRef<typeof OnboardingDialog>,
  Omit<OnboardingDialogProps, "steps"> & { featureName?: string }
>(({ 
  featureName = "nouvelle fonctionnalité",
  trigger,
  onComplete,
  onSkip,
  ...props 
}, ref) => {
  const defaultSteps = [
    {
      title: `Découvrez ${featureName}`,
      description: `Une ${featureName} puissante qui va transformer votre façon de travailler et améliorer votre efficacité.`,
    },
    {
      title: "Comment ça fonctionne",
      description: "Suivez ces étapes simples pour maîtriser cette fonctionnalité et l'intégrer dans votre workflow quotidien.",
      content: (
        <ul className="list-disc list-inside space-y-1">
          <li>Accédez à la fonctionnalité depuis le menu principal</li>
          <li>Configurez les paramètres selon vos besoins</li>
          <li>Explorez les options avancées</li>
        </ul>
      )
    },
    {
      title: "Conseils d'utilisation",
      description: "Quelques astuces pour tirer le meilleur parti de cette fonctionnalité et optimiser votre productivité.",
      content: (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            💡 <strong>Astuce :</strong> Utilisez les raccourcis clavier pour accéder rapidement aux fonctions principales.
          </p>
        </div>
      )
    },
    {
      title: "Vous êtes prêt !",
      description: `Félicitations ! Vous maîtrisez maintenant ${featureName}. N'hésitez pas à explorer et expérimenter.`,
    }
  ]

  return (
    <OnboardingDialog
      ref={ref}
      steps={defaultSteps}
      trigger={trigger}
      onComplete={onComplete}
      onSkip={onSkip}
      completeText="C'est parti !"
      {...props}
    />
  )
})

FeatureOnboardingDialog.displayName = "FeatureOnboardingDialog"