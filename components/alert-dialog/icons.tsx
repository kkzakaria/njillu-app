import { 
  AlertTriangleIcon, 
  InfoIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CircleAlertIcon,
  HelpCircleIcon
} from "lucide-react"
import { type AlertDialogType, type ButtonVariant } from "./types"

export const typeIcons = {
  default: CircleAlertIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
  question: HelpCircleIcon,
} as const

export function getTypeIcon(type: AlertDialogType) {
  return typeIcons[type] || typeIcons.default
}

export function getActionVariant(
  type: AlertDialogType, 
  actionVariant: ButtonVariant
): ButtonVariant {
  if (actionVariant !== "default") return actionVariant
  return type === "error" ? "destructive" : "default"
}