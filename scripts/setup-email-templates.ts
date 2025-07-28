#!/usr/bin/env tsx

/**
 * Script de configuration des templates d'email pour Supabase
 * 
 * Usage:
 *   npx tsx scripts/setup-email-templates.ts
 *   ou
 *   pnpm setup:email-templates
 * 
 * Ce script configure les templates d'email OTP pour l'inscription
 * avec support multilingue (FR/EN/ES)
 */

import fs from 'fs';
import path from 'path';

// Types pour la configuration
interface LocalizedContent {
  fr: string;
  en: string;
  es: string;
}

interface TemplateConfig {
  subject: LocalizedContent;
  files: LocalizedContent;
}

interface TemplatesConfig {
  signup: TemplateConfig;
}

interface SupabaseAuthConfig {
  auth: {
    email: {
      template: {
        signup: {
          subject: string;
          content_path: string;
        };
      };
    };
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Configuration des templates
const TEMPLATES_CONFIG: TemplatesConfig = {
  signup: {
    subject: {
      fr: "🔐 Votre code d'inscription - {{ .SiteName }}",
      en: "🔐 Your sign-up code - {{ .SiteName }}",
      es: "🔐 Tu código de registro - {{ .SiteName }}"
    },
    files: {
      fr: './templates/email/signup-otp.html',
      en: './templates/email/en/signup-otp.html',
      es: './templates/email/es/signup-otp.html'
    }
  }
};

// Variables Supabase requises
const REQUIRED_SUPABASE_VARS: string[] = [
  '{{ .Token }}',
  '{{ .SiteName }}',
  '{{ .ConfirmationURL }}',
  '{{ .SupportEmail }}',
  '{{ .SiteURL }}'
];

// Variables optionnelles recommandées
const RECOMMENDED_SUPABASE_VARS: string[] = [
  '{{ .Email }}',
  '{{ .UserMetaData }}',
  '{{ .ExpiresAt }}'
];

/**
 * Lit le contenu d'un template avec gestion d'erreur typée
 */
function readTemplate(filePath: string): string {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Template file not found: ${fullPath}`);
    }
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error reading template ${filePath}:`, errorMessage);
    process.exit(1);
  }
}

/**
 * Génère la configuration Supabase CLI
 */
function generateSupabaseConfig(): void {
  console.log('📝 Generating Supabase CLI configuration...\n');
  
  const config: SupabaseAuthConfig = {
    auth: {
      email: {
        template: {
          signup: {
            subject: TEMPLATES_CONFIG.signup.subject.fr,
            content_path: TEMPLATES_CONFIG.signup.files.fr
          }
        }
      }
    }
  };

  // Convertir en TOML avec types
  const tomlConfig = `
# Configuration des templates d'email
[auth.email.template.signup]
subject = "${config.auth.email.template.signup.subject}"
content_path = "${config.auth.email.template.signup.content_path}"

# Configuration OTP - 5 minutes
[auth]
mailer_otp_exp = 300     # Durée de validité des OTP email (5 minutes)
smtp_max_frequency = 300 # Temps minimum entre emails (5 minutes)
jwt_exp = 3600           # Expiration JWT (1 heure)
enable_signup = true
enable_confirmations = false
`;

  // Écrire le fichier de configuration
  const configPath = './supabase/config/auth.toml';
  const configDir = path.dirname(configPath);
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, tomlConfig.trim());
  console.log(`✅ Supabase CLI config written to: ${configPath}`);
}

/**
 * Génère les instructions pour le Dashboard Supabase
 */
function generateDashboardInstructions(): void {
  console.log('\n📋 Supabase Cloud Dashboard Instructions:\n');
  
  console.log('1. 🔗 Access your project:');
  console.log('   https://app.supabase.com/project/YOUR_PROJECT_ID/settings/auth\n');
  
  console.log('2. 📧 Navigate to "Email Templates" section\n');
  
  console.log('3. 🎯 Configure "Magic Link / OTP" template:\n');
  
  // Instructions pour chaque langue avec types
  (Object.entries(TEMPLATES_CONFIG.signup.subject) as [keyof LocalizedContent, string][])
    .forEach(([lang, subject]) => {
      console.log(`   ${lang.toUpperCase()} Template:`);
      console.log(`   - Subject: ${subject}`);
      console.log(`   - HTML Content: Copy from ${TEMPLATES_CONFIG.signup.files[lang]}`);
      console.log('');
    });
  
  console.log('4. 💾 Save configuration\n');
}

/**
 * Génère les snippets de code pour l'API avec types
 */
function generateApiSnippets(): void {
  console.log('🚀 API Configuration Snippets:\n');
  
  console.log('TypeScript (avec types Supabase):');
  console.log('```typescript');
  console.log('import { createClient } from "@supabase/supabase-js";');
  console.log('');
  console.log('interface EmailTemplate {');
  console.log('  subject: string;');
  console.log('  content_html: string;');
  console.log('  content_text?: string;');
  console.log('}');
  console.log('');
  console.log('interface AuthSettings {');
  console.log('  email_template: {');
  console.log('    signup: EmailTemplate;');
  console.log('  };');
  console.log('}');
  console.log('');
  console.log('// Configuration via API Supabase');
  console.log('const supabase = createClient(url, serviceKey);');
  console.log('');
  console.log('const settings: AuthSettings = {');
  console.log('  email_template: {');
  console.log('    signup: {');
  console.log(`      subject: "${TEMPLATES_CONFIG.signup.subject.fr}",`);
  console.log('      content_html: await readTemplate("./templates/email/signup-otp.html")');
  console.log('    }');
  console.log('  }');
  console.log('};');
  console.log('');
  console.log('const { data, error } = await supabase.auth.admin.updateSettings(settings);');
  console.log('');
  console.log('if (error) {');
  console.log('  console.error("❌ Erreur configuration:", error);');
  console.log('} else {');
  console.log('  console.log("✅ Templates configurés avec succès");');
  console.log('}');
  console.log('```\n');
}

/**
 * Valide les templates avec retour structuré
 */
function validateTemplates(): ValidationResult {
  console.log('🔍 Validating email templates...\n');
  
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Vérifier l'existence des fichiers
  (Object.entries(TEMPLATES_CONFIG.signup.files) as [keyof LocalizedContent, string][])
    .forEach(([lang, file]) => {
      const fullPath = path.resolve(file);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${lang.toUpperCase()}: ${file}`);
      } else {
        console.log(`❌ ${lang.toUpperCase()}: ${file} (NOT FOUND)`);
        result.errors.push(`Template file not found: ${file}`);
        result.isValid = false;
      }
    });
  
  // Vérifier le contenu des templates si les fichiers existent
  if (result.errors.length === 0) {
    (Object.entries(TEMPLATES_CONFIG.signup.files) as [keyof LocalizedContent, string][])
      .forEach(([lang, file]) => {
        try {
          const content = readTemplate(file);
          
          // Vérifier les variables Supabase requises
          const missingRequired = REQUIRED_SUPABASE_VARS.filter(varName => !content.includes(varName));
          const missingRecommended = RECOMMENDED_SUPABASE_VARS.filter(varName => !content.includes(varName));
          
          if (missingRequired.length === 0) {
            console.log(`✅ ${lang.toUpperCase()}: All required variables present`);
          } else {
            console.log(`❌ ${lang.toUpperCase()}: Missing required variables: ${missingRequired.join(', ')}`);
            result.errors.push(`Missing required variables in ${lang}: ${missingRequired.join(', ')}`);
            result.isValid = false;
          }
          
          if (missingRecommended.length > 0) {
            console.log(`⚠️  ${lang.toUpperCase()}: Missing recommended variables: ${missingRecommended.join(', ')}`);
            result.warnings.push(`Missing recommended variables in ${lang}: ${missingRecommended.join(', ')}`);
          }
          
          // Vérifications supplémentaires
          if (!content.includes('DOCTYPE html')) {
            result.warnings.push(`${lang} template missing DOCTYPE declaration`);
          }
          
          if (!content.includes('meta name="viewport"')) {
            result.warnings.push(`${lang} template missing viewport meta tag`);
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Error reading template ${lang}: ${errorMessage}`);
          result.isValid = false;
        }
      });
  }
  
  console.log('');
  return result;
}

/**
 * Génère un exemple de test avec types
 */
function generateTestExample(): void {
  console.log('🧪 Test Example:\n');
  
  console.log('```typescript');
  console.log('// test-templates.ts');
  console.log('import { createClient } from "@supabase/supabase-js";');
  console.log('');
  console.log('interface TestUser {');
  console.log('  email: string;');
  console.log('  metadata: {');
  console.log('    full_name?: string;');
  console.log('    avatar_url?: string;');
  console.log('  };');
  console.log('}');
  console.log('');
  console.log('async function testSignupOTP(user: TestUser): Promise<void> {');
  console.log('  const supabase = createClient(');
  console.log('    process.env.NEXT_PUBLIC_SUPABASE_URL!,');
  console.log('    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!');
  console.log('  );');
  console.log('');
  console.log('  try {');
  console.log('    const { error } = await supabase.auth.signInWithOtp({');
  console.log('      email: user.email,');
  console.log('      options: {');
  console.log('        shouldCreateUser: true,');
  console.log('        data: user.metadata');
  console.log('      }');
  console.log('    });');
  console.log('');
  console.log('    if (error) {');
  console.log('      console.error("❌ Test failed:", error.message);');
  console.log('    } else {');
  console.log('      console.log("✅ OTP sent successfully!");');
  console.log('      console.log("📧 Check your email for the template");');
  console.log('    }');
  console.log('  } catch (err) {');
  console.log('    console.error("❌ Unexpected error:", err);');
  console.log('  }');
  console.log('}');
  console.log('');
  console.log('// Usage');
  console.log('testSignupOTP({');
  console.log('  email: "test@example.com",');
  console.log('  metadata: {');
  console.log('    full_name: "Jean Dupont"');
  console.log('  }');
  console.log('});');
  console.log('```\n');
}

/**
 * Affiche les statistiques de validation
 */
function displayValidationStats(result: ValidationResult): void {
  console.log('📊 Validation Summary:\n');
  
  if (result.isValid) {
    console.log('✅ All templates are valid and ready for use');
  } else {
    console.log('❌ Some templates have critical issues');
  }
  
  if (result.errors.length > 0) {
    console.log('\n🚨 Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.log(`\nFiles checked: ${Object.keys(TEMPLATES_CONFIG.signup.files).length}`);
  console.log(`Variables validated: ${REQUIRED_SUPABASE_VARS.length} required, ${RECOMMENDED_SUPABASE_VARS.length} recommended`);
  console.log('');
}

/**
 * Fonction principale avec gestion d'erreur typée
 */
function main(): void {
  console.log('🎨 Supabase Email Templates Setup (TypeScript)\n');
  console.log('═'.repeat(60));
  
  try {
    // Validation des templates
    const validationResult = validateTemplates();
    displayValidationStats(validationResult);
    
    if (!validationResult.isValid) {
      console.log('❌ Template validation failed. Please fix the errors above.');
      process.exit(1);
    }
    
    // Génération des configurations
    generateSupabaseConfig();
    generateDashboardInstructions();
    generateApiSnippets();
    generateTestExample();
    
    console.log('═'.repeat(60));
    console.log('🎉 Email templates configuration completed!\n');
    
    console.log('📋 Next Steps:');
    console.log('1. For Supabase Cloud: Follow the Dashboard instructions above');
    console.log('2. For Self-hosted: Use the generated supabase/config/auth.toml');
    console.log('3. For API: Use the provided TypeScript snippets');
    console.log('4. Test your email templates with the test script\n');
    
    console.log('🔧 Commands:');
    console.log('   pnpm dev                    # Start development server');
    console.log('   npx tsx test-templates.ts   # Test email sending');
    console.log('   pnpm build                  # Build for production\n');
    
    if (validationResult.warnings.length > 0) {
      console.log('💡 Consider fixing the warnings above for optimal email compatibility.');
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Script execution failed:', errorMessage);
    process.exit(1);
  }
}

// Types d'export pour utilisation comme module
export {
  TEMPLATES_CONFIG,
  REQUIRED_SUPABASE_VARS,
  RECOMMENDED_SUPABASE_VARS,
  readTemplate,
  validateTemplates,
  generateSupabaseConfig,
  type LocalizedContent,
  type TemplateConfig,
  type TemplatesConfig,
  type ValidationResult
};

// Exécution du script si appelé directement
if (require.main === module) {
  main();
}