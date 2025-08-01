"use client"

import * as React from "react"
import { Palette, Shield, FileType } from "lucide-react"
import { EnhancedRadioGroup } from "./enhanced-radio"
import { CardRadioGroup } from "./card-radio"
import { ChipRadioGroup } from "./chip-radio"
import { type CardRadioProps, type ChipRadioProps, type ColoredRadioProps } from "./types"

// Composants spécialisés prédéfinis

export const CPURadioGroup = React.forwardRef<
  React.ComponentRef<typeof CardRadioGroup>,
  Omit<CardRadioProps, "options" | "legend" | "showIcons"> & {
    maxCores?: 4 | 8 | 12 | 16 | 24 | 32
  }
>(({ maxCores = 16, ...props }, ref) => {
  const cpuOptions = React.useMemo(() => {
    const coreOptions = [
      { value: "2", label: "2 CPU" },
      { value: "4", label: "4 CPU" },
      { value: "6", label: "6 CPU" },
      { value: "8", label: "8 CPU" },
      { value: "12", label: "12 CPU" },
      { value: "16", label: "16 CPU" },
      { value: "24", label: "24 CPU" },
      { value: "32", label: "32 CPU" },
    ]

    return coreOptions
      .filter(option => parseInt(option.value) <= maxCores)
      .map(option => ({ 
        ...option, 
        disabled: parseInt(option.value) > maxCores 
      }))
  }, [maxCores])

  return (
    <CardRadioGroup
      ref={ref}
      options={cpuOptions}
      legend="CPU Cores"
      columns={3}
      cardSize="md"
      {...props}
    />
  )
})

CPURadioGroup.displayName = "CPURadioGroup"

export const ServerLocationRadioGroup = React.forwardRef<
  React.ComponentRef<typeof CardRadioGroup>,
  Omit<CardRadioProps, "options" | "legend">
>(({ ...props }, ref) => {
  const locationOptions = [
    { value: "usa", label: "USA", description: "United States - East Coast" },
    { value: "uk", label: "UK", description: "United Kingdom - London" },
    { value: "france", label: "France", description: "France - Paris" },
    { value: "germany", label: "Germany", description: "Germany - Frankfurt" },
    { value: "japan", label: "Japan", description: "Japan - Tokyo" },
    { value: "australia", label: "Australia", description: "Australia - Sydney" },
  ]

  return (
    <CardRadioGroup
      ref={ref}
      options={locationOptions}
      legend="Server Location"
      layout="flex"
      cardSize="md"
      {...props}
    />
  )
})

ServerLocationRadioGroup.displayName = "ServerLocationRadioGroup"

export const ColorSchemeRadioGroup = React.forwardRef<
  React.ComponentRef<typeof ChipRadioGroup>,
  Omit<ChipRadioProps, "options" | "legend">
>(({ ...props }, ref) => {
  const colorOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
    { value: "auto", label: "Auto" },
  ]

  return (
    <ChipRadioGroup
      ref={ref}
      options={colorOptions}
      legend="Theme"
      size="md"
      variant="outline"
      {...props}
    />
  )
})

ColorSchemeRadioGroup.displayName = "ColorSchemeRadioGroup"

export const PlanRadioGroup = React.forwardRef<
  React.ComponentRef<typeof CardRadioGroup>,
  Omit<CardRadioProps, "options" | "legend" | "showIcons">
>(({ ...props }, ref) => {
  const planOptions = [
    { 
      value: "free", 
      label: "Free", 
      description: "Perfect for getting started",
      icon: FileType
    },
    { 
      value: "pro", 
      label: "Pro", 
      description: "For professional developers",
      icon: Palette
    },
    { 
      value: "enterprise", 
      label: "Enterprise", 
      description: "Advanced features and support",
      icon: Shield
    },
  ]

  return (
    <CardRadioGroup
      ref={ref}
      options={planOptions}
      legend="Choose your plan"
      columns={3}
      cardSize="lg"
      showIcons
      {...props}
    />
  )
})

PlanRadioGroup.displayName = "PlanRadioGroup"

export const LanguageRadioGroup = React.forwardRef<
  React.ComponentRef<typeof ChipRadioGroup>,
  Omit<ChipRadioProps, "options" | "legend">
>(({ ...props }, ref) => {
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "es", label: "Español" },
    { value: "de", label: "Deutsch" },
    { value: "ja", label: "日本語" },
    { value: "zh", label: "中文" },
  ]

  return (
    <ChipRadioGroup
      ref={ref}
      options={languageOptions}
      legend="Language"
      size="sm"
      variant="filled"
      {...props}
    />
  )
})

LanguageRadioGroup.displayName = "LanguageRadioGroup"

export const NotificationRadioGroup = React.forwardRef<
  React.ComponentRef<typeof EnhancedRadioGroup>,
  Omit<ColoredRadioProps, "options" | "legend">
>(({ ...props }, ref) => {
  const notificationOptions = [
    { 
      value: "all", 
      label: "All notifications", 
      description: "Receive all notifications and updates" 
    },
    { 
      value: "important", 
      label: "Important only", 
      description: "Only critical updates and security alerts" 
    },
    { 
      value: "none", 
      label: "None", 
      description: "Turn off all notifications" 
    },
  ]

  return (
    <EnhancedRadioGroup
      ref={ref}
      options={notificationOptions}
      legend="Notification preferences"
      colorScheme="indigo"
      {...props}
    />
  )
})

NotificationRadioGroup.displayName = "NotificationRadioGroup"