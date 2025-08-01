"use client"

import { useState } from "react"
import { BellIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Notification {
  id: number
  user: string
  action: string
  target: string
  timestamp: string
  unread: boolean
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    user: "Admin",
    action: "a publié une nouvelle annonce :",
    target: "Maintenance prévue ce weekend",
    timestamp: "il y a 15 minutes",
    unread: true,
  },
  {
    id: 2,
    user: "Système",
    action: "votre profil a été",
    target: "mis à jour avec succès",
    timestamp: "il y a 45 minutes",
    unread: true,
  },
  {
    id: 3,
    user: "Support",
    action: "a répondu à votre demande :",
    target: "Problème de connexion",
    timestamp: "il y a 4 heures",
    unread: false,
  },
  {
    id: 4,
    user: "Équipe",
    action: "vous a mentionné dans :",
    target: "Réunion hebdomadaire",
    timestamp: "il y a 12 heures",
    unread: false,
  },
]

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  )
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        unread: false,
      }))
    )
  }

  const handleNotificationClick = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative"
          aria-label="Ouvrir les notifications"
        >
          <BellIcon size={16} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1 bg-destructive text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1" align="end">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="text-sm font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium hover:underline text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleMarkAllAsRead}
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="bg-border -mx-1 my-1 h-px"
        />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="relative flex items-start pe-3">
                  <div className="flex-1 space-y-1">
                    <div className="text-foreground/80">
                      <span className="text-foreground font-medium">
                        {notification.user}
                      </span>{" "}
                      {notification.action}{" "}
                      <span className="text-foreground font-medium">
                        {notification.target}
                      </span>
                      .
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {notification.timestamp}
                    </div>
                  </div>
                  {notification.unread && (
                    <div className="absolute end-0 self-center">
                      <span className="sr-only">Non lu</span>
                      <Dot className="text-destructive" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}