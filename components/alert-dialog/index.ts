// Export du composant principal
export { EnhancedAlertDialog } from "./enhanced-alert-dialog"
export { ConfirmationDeleteDialog } from "./confirmation-delete-dialog"
export { OnboardingDialog } from "./onboarding-dialog"

// Export des composants spécialisés
export {
  ConfirmDialog,
  DeleteDialog,
  LogoutDialog,
  SaveDialog,
  InfoDialog,
  SuccessDialog,
  ErrorDialog,
  WarningDialog,
  CriticalDeleteDialog,
  WelcomeOnboardingDialog,
  FeatureOnboardingDialog,
} from "./specialized-dialogs"

// Export des variants et types
export { alertDialogVariants } from "./variants"
export type { 
  BaseAlertDialogProps, 
  ConfirmationDeleteDialogProps,
  OnboardingStep,
  OnboardingDialogProps,
  AlertDialogType, 
  ScrollableMode,
  ButtonVariant 
} from "./types"