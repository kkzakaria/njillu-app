"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Alert, AlertProps } from "@/components/alert"
import { AnimatePresence, motion } from "motion/react"

export interface AlertItem {
  id: string
  variant: AlertProps["variant"]
  message: string
  duration?: number
  persistent?: boolean
}

interface AlertContextType {
  alerts: AlertItem[]
  addAlert: (alert: Omit<AlertItem, "id">) => void
  removeAlert: (id: string) => void
  clearAlerts: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function useAlerts() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider")
  }
  return context
}

interface AlertProviderProps {
  children: ReactNode
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  const addAlert = useCallback((alert: Omit<AlertItem, "id">) => {
    const id = crypto.randomUUID()
    const newAlert: AlertItem = {
      ...alert,
      id,
      duration: alert.duration ?? 5000, // 5 secondes par défaut
    }

    setAlerts(prev => [...prev, newAlert])

    // Auto-remove after duration if not persistent
    if (!alert.persistent && newAlert.duration) {
      setTimeout(() => {
        removeAlert(id)
      }, newAlert.duration)
    }
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      {children}
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
    </AlertContext.Provider>
  )
}

interface AlertContainerProps {
  alerts: AlertItem[]
  onRemove: (id: string) => void
}

function AlertContainer({ alerts, onRemove }: AlertContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <Alert
              variant={alert.variant}
              onClose={() => onRemove(alert.id)}
              className="shadow-lg"
            >
              {alert.message}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Helper hooks pour les différents types d'alertes
export function useAlertHelpers() {
  const { addAlert } = useAlerts()

  return {
    showInfo: (message: string, options?: Partial<AlertItem>) =>
      addAlert({ variant: "info", message, ...options }),
    
    showSuccess: (message: string, options?: Partial<AlertItem>) =>
      addAlert({ variant: "success", message, ...options }),
    
    showWarning: (message: string, options?: Partial<AlertItem>) =>
      addAlert({ variant: "warning", message, ...options }),
    
    showError: (message: string, options?: Partial<AlertItem>) =>
      addAlert({ variant: "error", message, ...options }),
  }
}