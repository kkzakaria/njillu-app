"use client"

import * as React from "react"
import { TrashIcon, LogOutIcon, SaveIcon } from "lucide-react"
import { EnhancedAlertDialog } from "./enhanced-alert-dialog"
import { ConfirmationDeleteDialog } from "./confirmation-delete-dialog"
import { type BaseAlertDialogProps, type ConfirmationDeleteDialogProps } from "./types"

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