"use client"

import { useState } from "react"
import { CreditCardIcon, PhoneIcon, CalendarIcon, BuildingIcon, MapPinIcon, HashIcon } from "lucide-react"
import { NumberInput, CurrencyInput, PercentageInput } from "@/components/number-input"
import { PhoneInput } from "@/components/phone-input"
import { 
  MaskedInput, 
  CreditCardInput, 
  PhoneFrInput, 
  PostalCodeInput, 
  SiretInput, 
  DateInput, 
  ExpiryDateInput,
  MASK_PATTERNS,
  validateCreditCard,
  validatePostalCode,
  validateSiret,
  validatePhoneFr
} from "@/components/masked-input"

export function SpecializedInputsDemo() {
  // États pour Number Input
  const [quantity, setQuantity] = useState<number | undefined>(5)
  const [price, setPrice] = useState<number | undefined>(99.99)
  const [percentage, setPercentage] = useState<number | undefined>(15)
  const [temperature, setTemperature] = useState<number | undefined>(20)

  // États pour Phone Input
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [businessPhone, setBusinessPhone] = useState<string>("")

  // États pour Masked Input
  const [creditCard, setCreditCard] = useState<string>("")
  const [phoneFr, setPhoneFr] = useState<string>("")
  const [postalCode, setPostalCode] = useState<string>("")
  const [siret, setSiret] = useState<string>("")
  const [birthDate, setBirthDate] = useState<string>("")
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [customMask, setCustomMask] = useState<string>("")

  // États de validation
  const [cardError, setCardError] = useState<string>("")
  const [postalError, setPostalError] = useState<string>("")
  const [siretError, setSiretError] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string>("")

  const validateCard = (value: string) => {
    if (value && !validateCreditCard(value)) {
      setCardError("Numéro de carte invalide")
    } else {
      setCardError("")
    }
  }

  const validatePostal = (value: string) => {
    if (value && !validatePostalCode(value)) {
      setPostalError("Code postal invalide")
    } else {
      setPostalError("")
    }
  }

  const validateSiretNumber = (value: string) => {
    if (value && !validateSiret(value)) {
      setSiretError("Numéro SIRET invalide")
    } else {
      setSiretError("")
    }
  }

  const validatePhoneNumber = (value: string) => {
    if (value && !validatePhoneFr(value)) {
      setPhoneError("Numéro de téléphone invalide")
    } else {
      setPhoneError("")
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Inputs Spécialisés - Démonstration</h2>
        <p className="text-muted-foreground">
          Collection d&apos;inputs spécialisés pour des cas d&apos;usage spécifiques
        </p>
      </div>

      {/* Number Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">📊 Number Inputs</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Input numérique avec boutons +/-</h4>
            <div className="space-y-4">
              <NumberInput
                label="Quantité"
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={100}
                step={1}
                buttonStyle="sides"
                description="Boutons sur les côtés"
              />
              <NumberInput
                label="Température (°C)"
                value={temperature}
                onChange={setTemperature}
                min={-50}
                max={50}
                step={0.5}
                buttonStyle="stacked"
                description="Boutons empilés"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Inputs spécialisés</h4>
            <div className="space-y-4">
              <CurrencyInput
                label="Prix"
                value={price}
                onChange={setPrice}
                min={0}
                step={0.01}
                description="Format monétaire automatique"
              />
              <PercentageInput
                label="Remise"
                value={percentage}
                onChange={setPercentage}
                description="Pourcentage avec limites 0-100%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Phone Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">📞 Phone Inputs</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Téléphone international</h4>
            <PhoneInput
              label="Numéro de téléphone"
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="Entrez votre numéro"
              description="Sélection automatique du pays avec drapeaux"
            />
            <p className="text-sm text-muted-foreground">
              Valeur : {phoneNumber || "Vide"}
            </p>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Téléphone professionnel</h4>
            <PhoneInput
              label="Téléphone entreprise"
              value={businessPhone}
              onChange={setBusinessPhone}
              defaultCountry="FR"
              countries={["FR", "BE", "CH", "LU", "MC"]}
              placeholder="Numéro professionnel"
              description="Limité aux pays francophones"
            />
          </div>
        </div>
      </div>

      {/* Masked Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🎭 Masked Inputs</h3>
        
        {/* Paiement */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">💳 Informations de paiement</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <CreditCardInput
                label="Numéro de carte"
                value={creditCard}
                onChange={(value) => {
                  setCreditCard(value)
                  validateCard(value)
                }}
                error={cardError}
                description="16 chiffres formatés automatiquement"
              />
            </div>
            <ExpiryDateInput
              label="Date d&apos;expiration"
              value={expiryDate}
              onChange={setExpiryDate}
              description="MM/AA"
            />
          </div>
        </div>

        {/* Informations françaises */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">🇫🇷 Formats français</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <PhoneFrInput
                label="Téléphone français"
                value={phoneFr}
                onChange={(value) => {
                  setPhoneFr(value)
                  validatePhoneNumber(value)
                }}
                error={phoneError}
                description="Format 01 23 45 67 89"
              />
              <PostalCodeInput
                label="Code postal"
                value={postalCode}
                onChange={(value) => {
                  setPostalCode(value)
                  validatePostal(value)
                }}
                error={postalError}
                description="5 chiffres"
              />
            </div>

            <div className="space-y-4">
              <SiretInput
                label="Numéro SIRET"
                value={siret}
                onChange={(value) => {
                  setSiret(value)
                  validateSiretNumber(value)
                }}
                error={siretError}
                description="14 chiffres formatés"
              />
              <DateInput
                label="Date de naissance"
                value={birthDate}
                onChange={setBirthDate}
                description="Format dd/mm/yyyy"
              />
            </div>
          </div>
        </div>

        {/* Masque personnalisé */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">🎨 Masque personnalisé</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MaskedInput
              label="Plaque d&apos;immatriculation"
              mask="AA-999-AA"
              value={customMask}
              onChange={setCustomMask}
              placeholder="AB-123-CD"
              description="Format français AA-123-AA"
            />
            <MaskedInput
              label="Numéro de sécurité sociale"
              mask={MASK_PATTERNS.NIR}
              placeholder="1 23 45 67 890 123 45"
              description="Format NIR français"
            />
          </div>
        </div>
      </div>

      {/* Tailles et variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🎨 Tailles et styles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-3">
            <h4 className="font-medium">Petite taille</h4>
            <NumberInput
              size="sm"
              value={10}
              buttonStyle="sides"
              placeholder="Petit"
            />
            <PhoneInput
              size="sm"
              placeholder="Téléphone petit"
            />
            <CreditCardInput
              size="sm"
              placeholder="Carte petite"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Taille normale</h4>
            <NumberInput
              size="md"
              value={20}
              buttonStyle="sides"
              placeholder="Normal"
            />
            <PhoneInput
              size="md"
              placeholder="Téléphone normal"
            />
            <CreditCardInput
              size="md"
              placeholder="Carte normale"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Grande taille</h4>
            <NumberInput
              size="lg"
              value={30}
              buttonStyle="sides"
              placeholder="Grand"
            />
            <PhoneInput
              size="lg"
              placeholder="Téléphone grand"
            />
            <CreditCardInput
              size="lg"
              placeholder="Carte grande"
            />
          </div>
        </div>
      </div>

      {/* États */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🎭 États</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-3">
            <h4 className="font-medium">Normal</h4>
            <NumberInput
              value={5}
              placeholder="État normal"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Erreur</h4>
            <NumberInput
              value={-5}
              variant="error"
              error="Valeur invalide"
              placeholder="État erreur"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Désactivé</h4>
            <NumberInput
              value={10}
              disabled
              placeholder="État désactivé"
            />
          </div>
        </div>
      </div>

      {/* Exemples d'usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">💼 Exemples d&apos;usage</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">🛒 Commande e-commerce</h4>
              <NumberInput
                label="Quantité"
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={10}
                buttonStyle="sides"
                size="sm"
              />
              <CurrencyInput
                label="Prix unitaire"
                value={price}
                onChange={setPrice}
                min={0}
                step={0.01}
              />
              <div className="p-2 bg-background rounded border">
                <p className="text-sm font-medium">
                  Total : {((quantity || 0) * (price || 0)).toFixed(2)} €
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">📋 Inscription entreprise</h4>
              <SiretInput
                label="SIRET"
                value={siret}
                onChange={(value) => {
                  setSiret(value)
                  validateSiretNumber(value)
                }}
                error={siretError}
              />
              <PhoneInput
                label="Téléphone"
                value={businessPhone}
                onChange={setBusinessPhone}
                defaultCountry="FR"
              />
              <PostalCodeInput
                label="Code postal"
                value={postalCode}
                onChange={(value) => {
                  setPostalCode(value)
                  validatePostal(value)
                }}
                error={postalError}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test interactif */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🧪 Test interactif</h3>
        <div className="p-4 border rounded-lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput
                label="Nombre"
                value={quantity}
                onChange={setQuantity}
                buttonStyle="stacked"
                min={0}
                max={1000}
              />
              <PhoneInput
                label="Téléphone"
                value={phoneNumber}
                onChange={setPhoneNumber}
              />
            </div>
            
            <div className="p-3 bg-muted rounded">
              <h4 className="font-medium mb-2">États actuels :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <pre>
{`Nombre: ${quantity || 'undefined'}
Téléphone: "${phoneNumber}"
Carte: "${creditCard}"
Code postal: "${postalCode}"`}
                  </pre>
                </div>
                <div>
                  <pre>
{`Validations:
- Carte: ${creditCard ? (validateCreditCard(creditCard) ? '✅' : '❌') : '⏸️'}
- Postal: ${postalCode ? (validatePostalCode(postalCode) ? '✅' : '❌') : '⏸️'}
- SIRET: ${siret ? (validateSiret(siret) ? '✅' : '❌') : '⏸️'}
- Tél FR: ${phoneFr ? (validatePhoneFr(phoneFr) ? '✅' : '❌') : '⏸️'}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📖 Documentation :</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium mb-2">NumberInput :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>buttonStyle</code>: &quot;sides&quot; | &quot;stacked&quot;</li>
              <li><code>min/max</code>: Limites numériques</li>
              <li><code>step</code>: Incrément</li>
              <li><code>formatOptions</code>: Format Intl</li>
              <li>Composants : CurrencyInput, PercentageInput</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">PhoneInput :</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>defaultCountry</code>: Pays par défaut</li>
              <li><code>countries</code>: Liste de pays</li>
              <li>Drapeaux et indicatifs automatiques</li>
              <li>Validation intégrée</li>
              <li>Format international</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">MaskedInput :</h4>  
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>20+ masques prédéfinis</li>
              <li>Validation automatique</li>
              <li>Composants spécialisés</li>
              <li>Masques personnalisés</li>
              <li>Guide visuel optionnel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}