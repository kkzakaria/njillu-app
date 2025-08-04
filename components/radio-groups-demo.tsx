"use client"

import { useState } from "react"
import { 
  Cpu, 
  Server, 
  Bell, 
  Palette,
  Settings,
  Users,
  Mail,
  CreditCard,
  Zap,
  Star
} from "lucide-react"
import {
  EnhancedRadioGroup,
  CardRadioGroup,
  ChipRadioGroup,
  CPURadioGroup,
  ServerLocationRadioGroup,
  ColorSchemeRadioGroup,
  PlanRadioGroup,
  LanguageRadioGroup,
  NotificationRadioGroup,
} from "@/components/radio"

export function RadioGroupsDemo() {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})

  const handleValueChange = (name: string) => (value: string) => {
    setSelectedValues(prev => ({ ...prev, [name]: value }))
  }

  const basicOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ]

  const detailedOptions = [
    { 
      value: "basic", 
      label: "Basic Plan", 
      description: "Perfect for small projects and personal use" 
    },
    { 
      value: "pro", 
      label: "Pro Plan", 
      description: "For professional developers and small teams" 
    },
    { 
      value: "enterprise", 
      label: "Enterprise", 
      description: "Advanced features for large organizations",
      disabled: true
    },
  ]

  const priorityOptions = [
    { value: "low", label: "Low", icon: Bell },
    { value: "medium", label: "Medium", icon: Star },
    { value: "high", label: "High", icon: Zap },
  ]

  const paymentOptions = [
    { 
      value: "card", 
      label: "Credit Card", 
      description: "Visa, MasterCard, American Express",
      icon: CreditCard
    },
    { 
      value: "paypal", 
      label: "PayPal", 
      description: "Pay with your PayPal account",
      icon: Mail
    },
    { 
      value: "bank", 
      label: "Bank Transfer", 
      description: "Direct bank transfer (takes 2-3 business days)",
      icon: Settings
    },
  ]

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Radio Groups - Démonstration</h2>
        <p className="text-muted-foreground">
          Collection de composants Radio Groups avec différents styles et cas d&apos;usage
        </p>
        
        {Object.keys(selectedValues).length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Valeurs sélectionnées :</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(selectedValues).map(([name, value]) => (
                <div key={name} className="flex justify-between">
                  <span className="font-medium">{name}:</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Types de base */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">🎨 Types de base</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Radio Group standard</h4>
            <EnhancedRadioGroup
              options={basicOptions}
              legend="Choisissez une option"
              name="standard"
              defaultValue="option1"
              onValueChange={handleValueChange("standard")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Avec descriptions</h4>
            <EnhancedRadioGroup
              options={detailedOptions}
              legend="Plan d'abonnement"
              name="plan"
              defaultValue="basic"
              onValueChange={handleValueChange("plan")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Couleur personnalisée</h4>
            <EnhancedRadioGroup
              options={basicOptions}
              legend="Thème coloré"
              name="colored" 
              colorScheme="indigo"
              defaultValue="option2"
              onValueChange={handleValueChange("colored")}
            />
          </div>
        </div>
      </div>

      {/* Composants spécialisés prédéfinis */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">🎯 Composants spécialisés</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Cpu size={16} />
              Configuration CPU
            </h4>
            <CPURadioGroup
              name="cpu"
              maxCores={12}
              defaultValue="4"
              onValueChange={handleValueChange("cpu")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Server size={16} />
              Localisation serveur
            </h4>
            <ServerLocationRadioGroup
              name="location"
              defaultValue="france"
              onValueChange={handleValueChange("location")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Bell size={16} />
              Notifications
            </h4>
            <NotificationRadioGroup
              name="notifications"
              defaultValue="important"
              onValueChange={handleValueChange("notifications")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Palette size={16} />
              Plans avec icônes
            </h4>
            <PlanRadioGroup
              name="pricing"
              defaultValue="pro"
              onValueChange={handleValueChange("pricing")}
            />
          </div>
        </div>
      </div>

      {/* Styles Card */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">🎴 Style Card</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Configuration système</h4>
            <CardRadioGroup
              options={[
                { value: "2gb", label: "2 GB RAM", description: "Perfect for small apps" },
                { value: "4gb", label: "4 GB RAM", description: "Good for medium apps" },
                { value: "8gb", label: "8 GB RAM", description: "Great for large apps" },
                { value: "16gb", label: "16 GB RAM", description: "Enterprise level" },
              ]}
              legend="Memory Configuration"
              name="memory"
              columns={2}
              cardSize="md"
              defaultValue="4gb"
              onValueChange={handleValueChange("memory")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Méthode de paiement</h4>
            <CardRadioGroup
              options={paymentOptions}
              legend="Comment souhaitez-vous payer ?"
              name="payment"
              layout="flex"
              cardSize="lg"
              showIcons
              defaultValue="card"
              onValueChange={handleValueChange("payment")}
            />
          </div>
        </div>
      </div>

      {/* Styles Chip */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">🏷️ Style Chip</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Thème (petite)</h4>
            <ColorSchemeRadioGroup
              name="theme"
              size="sm"
              defaultValue="system"
              onValueChange={handleValueChange("theme")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Langues (moyenne)</h4>
            <LanguageRadioGroup
              name="language"
              size="md"
              variant="outline"
              defaultValue="fr"
              onValueChange={handleValueChange("language")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Priorité avec icônes</h4>
            <ChipRadioGroup
              options={priorityOptions}
              legend="Niveau de priorité"
              name="priority"
              size="lg"
              variant="filled"
              defaultValue="medium"
              onValueChange={handleValueChange("priority")}
            />
          </div>
        </div>
      </div>

      {/* Orientations et layouts */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">📐 Orientations et layouts</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Orientation horizontale</h4>
            <EnhancedRadioGroup
              options={basicOptions}
              legend="Layout horizontal"
              name="horizontal"
              orientation="horizontal"
              defaultValue="option1"
              onValueChange={handleValueChange("horizontal")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Grid personnalisé</h4>
            <CardRadioGroup
              options={[
                { value: "xs", label: "XS" },
                { value: "sm", label: "SM" },
                { value: "md", label: "MD" },
                { value: "lg", label: "LG" },
                { value: "xl", label: "XL" },
              ]}
              legend="Taille"
              name="sizes"
              columns={5}
              cardSize="sm"
              defaultValue="md"
              onValueChange={handleValueChange("sizes")}
            />
          </div>
        </div>
      </div>

      {/* États et validations */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">⚙️ États et validations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Requis</h4>
            <EnhancedRadioGroup
              options={basicOptions}
              legend="Sélection requise"
              name="required"
              required
              description="Ce champ est obligatoire"
              onValueChange={handleValueChange("required")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Avec erreur</h4>
            <EnhancedRadioGroup
              options={basicOptions}
              legend="Champ avec erreur"
              name="error"
              error="Veuillez sélectionner une option valide"
              defaultValue="option1"
              onValueChange={handleValueChange("error")}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Désactivé</h4>
            <EnhancedRadioGroup
              options={basicOptions}
              legend="Groupe désactivé"
              name="disabled"
              disabled
              defaultValue="option2"
              onValueChange={handleValueChange("disabled")}
            />
          </div>
        </div>
      </div>

      {/* Exemples d'usage */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">💼 Exemples d&apos;usage concrets</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-6 p-6 border rounded-lg bg-muted/50">
            <h4 className="font-medium flex items-center gap-2">
              <Settings size={16} />
              Configuration de projet
            </h4>
            
            <div className="space-y-4">
              <EnhancedRadioGroup
                options={[
                  { value: "public", label: "Public", description: "Visible par tous" },
                  { value: "private", label: "Privé", description: "Visible par vous uniquement" },
                  { value: "team", label: "Équipe", description: "Visible par votre équipe" },
                ]}
                legend="Visibilité du projet"
                name="visibility"
                colorScheme="blue"
                defaultValue="private"
                onValueChange={handleValueChange("visibility")}
              />

              <ChipRadioGroup
                options={[
                  { value: "react", label: "React" },
                  { value: "vue", label: "Vue.js" },
                  { value: "angular", label: "Angular" },
                  { value: "svelte", label: "Svelte" },
                ]}
                legend="Framework"
                name="framework"
                variant="outline"
                defaultValue="react"
                onValueChange={handleValueChange("framework")}
              />
            </div>
          </div>

          <div className="space-y-6 p-6 border rounded-lg bg-muted/50">
            <h4 className="font-medium flex items-center gap-2">
              <Users size={16} />
              Préférences utilisateur
            </h4>
            
            <div className="space-y-4">
              <EnhancedRadioGroup
                options={[
                  { value: "email", label: "Email", description: "Notifications par email" },
                  { value: "sms", label: "SMS", description: "Notifications par SMS" },
                  { value: "push", label: "Push", description: "Notifications push dans l'app" },
                  { value: "none", label: "Aucune", description: "Pas de notifications" },
                ]}
                legend="Type de notifications"
                name="notification-type"
                colorScheme="green"
                required
                defaultValue="email"
                onValueChange={handleValueChange("notification-type")}
              />

              <ChipRadioGroup
                options={[
                  { value: "light", label: "Clair" },
                  { value: "dark", label: "Sombre" },
                  { value: "auto", label: "Auto" },
                ]}
                legend="Thème d'affichage"
                name="display-theme"
                variant="filled"
                defaultValue="auto"
                onValueChange={handleValueChange("display-theme")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-4">📖 Documentation :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Composants disponibles :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>EnhancedRadioGroup</code> - Radio group standard avec couleurs</li>
              <li><code>CardRadioGroup</code> - Style card avec layout flexible</li>
              <li><code>ChipRadioGroup</code> - Style chip/badge compact</li>
              <li><code>CPURadioGroup</code> - Sélection de cores CPU</li>
              <li><code>ServerLocationRadioGroup</code> - Choix de localisation</li>
              <li><code>ColorSchemeRadioGroup</code> - Sélection de thème</li>
              <li><code>PlanRadioGroup</code> - Plans avec icônes</li>
              <li><code>LanguageRadioGroup</code> - Sélection de langue</li>
              <li><code>NotificationRadioGroup</code> - Préférences notifications</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Props principales :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>options</code> - Array d&apos;options avec label, value, description</li>
              <li><code>orientation</code> - &quot;horizontal&quot; | &quot;vertical&quot;</li>
              <li><code>colorScheme</code> - Couleur pour Enhanced (indigo, blue, etc.)</li>
              <li><code>layout</code> - &quot;grid&quot; | &quot;flex&quot; pour Card</li>
              <li><code>columns</code> - Nombre de colonnes pour grid</li>
              <li><code>size</code> - &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</li>
              <li><code>variant</code> - &quot;default&quot; | &quot;outline&quot; | &quot;filled&quot;</li>
              <li><code>showIcons</code> - Afficher les icônes dans les cards</li>
              <li><code>required</code> - Champ requis</li>
              <li><code>disabled</code> - Groupe désactivé</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}