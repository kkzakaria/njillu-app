"use client"

import { useState } from "react"
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  SearchIcon, 
  CreditCardIcon,
  MapPinIcon,
  CalendarIcon,
  DollarSignIcon,
  FileTextIcon,
  LockIcon
} from "lucide-react"
import { EnhancedInput, SimpleInput, PasswordInput } from "@/components/enhanced-input"

export function InputDemo() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [name, setName] = useState<string>("John Doe")
  const [search, setSearch] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  
  // États pour les validations
  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [nameSuccess, setNameSuccess] = useState<string>("Nom valide")

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setEmailError("Format d'email invalide")
    } else {
      setEmailError("")
    }
  }

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("")
      return
    }
    if (value.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères")
    } else {
      setPasswordError("")
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Enhanced Input - Démonstration</h2>
        <p className="text-muted-foreground">
          Composant Input avancé avec icônes, validation, états et multiples options
        </p>
      </div>

      {/* Variantes de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variantes de base</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Input simple</h4>
            <SimpleInput
              label="Nom complet"
              placeholder="Entrez votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Valeur : {name || "Vide"}
            </p>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Input avec icône</h4>
            <EnhancedInput
              label="Email"
              type="email"
              placeholder="exemple@email.com"
              leftIcon={<MailIcon size={16} />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                validateEmail(e.target.value)
              }}
              error={emailError}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Input mot de passe</h4>
            <PasswordInput
              label="Mot de passe"
              placeholder="Minimum 8 caractères"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                validatePassword(e.target.value)
              }}
              error={passwordError}
            />
          </div>
        </div>
      </div>

      {/* Tailles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tailles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-3">
            <h4 className="font-medium">Petite (sm)</h4>
            <EnhancedInput
              size="sm"
              placeholder="Input petite"
              leftIcon={<UserIcon size={14} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Normale (md)</h4>
            <EnhancedInput
              size="md"
              placeholder="Input normale"
              leftIcon={<UserIcon size={16} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Grande (lg)</h4>
            <EnhancedInput
              size="lg"
              placeholder="Input grande"
              leftIcon={<UserIcon size={18} />}
            />
          </div>
        </div>
      </div>

      {/* Variantes visuelles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Styles visuels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-3">
            <h4 className="font-medium">Par défaut</h4>
            <EnhancedInput
              variant="default"
              placeholder="Style par défaut"
              leftIcon={<SearchIcon size={16} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Rempli</h4>
            <EnhancedInput
              variant="filled"
              placeholder="Style rempli"
              leftIcon={<SearchIcon size={16} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Ghost</h4>
            <EnhancedInput
              variant="ghost"
              placeholder="Style ghost"
              leftIcon={<SearchIcon size={16} />}
            />
          </div>
        </div>
      </div>

      {/* États de validation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">États de validation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-3">
            <h4 className="font-medium">Normal</h4>
            <EnhancedInput
              label="Téléphone"
              placeholder="+33 1 23 45 67 89"
              leftIcon={<PhoneIcon size={16} />}
              description="Format international recommandé"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Erreur</h4>
            <EnhancedInput
              label="Code postal"
              placeholder="75001"
              error="Code postal invalide"
              leftIcon={<MapPinIcon size={16} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Succès</h4>
            <EnhancedInput
              label="Nom d&apos;utilisateur"
              placeholder="johndoe"
              success="Nom d'utilisateur disponible"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Fonctionnalités avancées */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fonctionnalités avancées</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Input avec clear ❌</h4>
            <EnhancedInput
              label="Recherche"
              placeholder="Tapez pour chercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              clearable
              leftIcon={<SearchIcon size={16} />}
              description="Le bouton X apparaît quand du texte est saisi"
            />
            <p className="text-xs text-muted-foreground">
              Recherche actuelle : {search || "Vide"}
            </p>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Input avec toggle password 👁️</h4>
            <PasswordInput
              label="Confirmer le mot de passe"
              placeholder="Retapez votre mot de passe"
              description="Cliquez sur l'œil pour afficher/masquer"
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Input numérique</h4>
            <EnhancedInput
              label="Montant"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              leftIcon={<DollarSignIcon size={16} />}
              description="Montant en euros"
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Input désactivé</h4>
            <EnhancedInput
              label="Champ non modifiable"
              value="Valeur fixe"
              disabled
              leftIcon={<LockIcon size={16} />}
              description="Ce champ ne peut pas être modifié"
            />
          </div>
        </div>
      </div>

      {/* Types d'input spécialisés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Types spécialisés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-3">
            <h4 className="font-medium">Email</h4>
            <EnhancedInput
              type="email"
              label="Adresse email"
              placeholder="utilisateur@domaine.com"
              leftIcon={<MailIcon size={16} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Téléphone</h4>
            <EnhancedInput
              type="tel"
              label="Numéro de téléphone"
              placeholder="+33 1 23 45 67 89"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<PhoneIcon size={16} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Date</h4>
            <EnhancedInput
              type="date"
              label="Date de naissance"
              leftIcon={<CalendarIcon size={16} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Carte de crédit</h4>
            <EnhancedInput
              type="text"
              label="Numéro de carte"
              placeholder="1234 5678 9012 3456"
              leftIcon={<CreditCardIcon size={16} />}
            />
          </div>
        </div>
      </div>

      {/* États */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">États</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-3">
            <h4 className="font-medium">Normal</h4>
            <SimpleInput 
              placeholder="Input normal"
              leftIcon={<UserIcon size={16} />}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Avec valeur</h4>
            <SimpleInput 
              value="Texte saisi"
              placeholder="Input avec valeur"
              leftIcon={<UserIcon size={16} />}
              clearable
              onClear={() => {}}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Désactivé</h4>
            <SimpleInput 
              placeholder="Input désactivé"
              disabled
              leftIcon={<UserIcon size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Exemples d'usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Exemples d&apos;usage</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Formulaire d&apos;inscription</h4>
              <EnhancedInput
                label="Nom complet"
                placeholder="Jean Dupont"
                leftIcon={<UserIcon size={16} />}
                clearable
                onClear={() => {}}
              />
              <EnhancedInput
                label="Email"
                type="email"
                placeholder="jean@exemple.com"
                leftIcon={<MailIcon size={16} />}
              />
              <PasswordInput
                label="Mot de passe"
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Informations de contact</h4>
              <EnhancedInput
                label="Téléphone"
                type="tel"
                placeholder="+33 1 23 45 67 89"
                leftIcon={<PhoneIcon size={16} />}
              />
              <EnhancedInput
                label="Adresse"
                placeholder="123 rue de la Paix, Paris"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPinIcon size={16} />}
                clearable
                onClear={() => setAddress("")}
              />
              <EnhancedInput
                label="Notes"
                placeholder="Informations complémentaires"
                leftIcon={<FileTextIcon size={16} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test interactif */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Test interactif</h3>
        <div className="p-4 border rounded-lg">
          <div className="space-y-4">
            <EnhancedInput
              label="Test complet"
              placeholder="Tapez quelque chose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              clearable
              leftIcon={<SearchIcon size={16} />}
              description="Testez toutes les fonctionnalités"
            />
            
            <div className="p-3 bg-muted rounded">
              <h4 className="font-medium mb-2">État actuel :</h4>
              <pre className="text-sm">
{`Valeur: "${search}"
Longueur: ${search.length} caractères
Vide: ${search.length === 0 ? 'Oui' : 'Non'}
Clear visible: ${search.length > 0 ? 'Oui' : 'Non'}`}
              </pre>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSearch("Hello World")}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              >
                Texte exemple
              </button>
              <button
                onClick={() => setSearch("test@email.com")}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
              >
                Email test
              </button>
              <button
                onClick={() => setSearch("")}
                className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm"
              >
                Vider
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Props disponibles :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Configuration de base :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>label</code>: string - Label du champ</li>
              <li><code>placeholder</code>: string - Texte placeholder</li>
              <li><code>description</code>: string - Texte d&apos;aide</li>
              <li><code>error</code>: string - Message d&apos;erreur</li>
              <li><code>success</code>: string - Message de succès</li>
              <li><code>disabled</code>: boolean - État désactivé</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Options avancées :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>size</code>: &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; - Taille</li>
              <li><code>variant</code>: &quot;default&quot; | &quot;filled&quot; | &quot;ghost&quot; | &quot;error&quot; | &quot;success&quot;</li>
              <li><code>clearable</code>: boolean - Bouton effacer</li>
              <li><code>leftIcon</code>: ReactNode - Icône à gauche</li>
              <li><code>rightIcon</code>: ReactNode - Icône à droite</li>
              <li><code>showPasswordToggle</code>: boolean - Toggle mot de passe</li>
              <li><code>onClear</code>: () =&gt; void - Callback effacer</li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Composants spécialisés :</h4>
          <div className="bg-background p-3 rounded border">
            <pre className="text-sm">
{`<SimpleInput />        // Version basique
<PasswordInput />      // Avec toggle password automatique
<EnhancedInput />      // Version complète avec toutes options`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}