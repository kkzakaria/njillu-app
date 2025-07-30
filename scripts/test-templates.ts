#!/usr/bin/env tsx

/**
 * Script de test des templates d'email Supabase
 * 
 * Usage:
 *   npx tsx scripts/test-templates.ts
 *   ou
 *   pnpm test:email-templates
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { validateTemplates, TEMPLATES_CONFIG, type ValidationResult } from "./setup-email-templates";

// Types pour les tests
interface TestUser {
  email: string;
  metadata: {
    full_name?: string;
    avatar_url?: string;
    locale?: string;
  };
}

interface TestResult {
  success: boolean;
  message: string;
  duration: number;
  error?: Error;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
}

interface TestCase {
  name: string;
  user: TestUser;
  expectedResult: 'success' | 'error';
}

// Configuration des tests
const TEST_SUITES: TestSuite[] = [
  {
    name: "🧪 Tests d'inscription OTP basiques",
    tests: [
      {
        name: "Inscription avec email valide",
        user: {
          email: "test.signup@example.com",
          metadata: {
            full_name: "Jean Dupont",
            locale: "fr"
          }
        },
        expectedResult: 'success'
      },
      {
        name: "Inscription avec email international",
        user: {
          email: "测试@example.com",
          metadata: {
            full_name: "用户测试",
            locale: "en"
          }
        },
        expectedResult: 'success'
      },
      {
        name: "Inscription sans métadonnées",
        user: {
          email: "minimal@example.com",
          metadata: {}
        },
        expectedResult: 'success'
      }
    ]
  },
  {
    name: "🌐 Tests multilingues",
    tests: [
      {
        name: "Template français",
        user: {
          email: "fr.test@example.com",
          metadata: {
            full_name: "Jean Français",
            locale: "fr"
          }
        },
        expectedResult: 'success'
      },
      {
        name: "Template anglais",
        user: {
          email: "en.test@example.com",
          metadata: {
            full_name: "John English",
            locale: "en"
          }
        },
        expectedResult: 'success'
      },
      {
        name: "Template espagnol",
        user: {
          email: "es.test@example.com",
          metadata: {
            full_name: "Juan Español",
            locale: "es"
          }
        },
        expectedResult: 'success'
      }
    ]
  }
];

/**
 * Crée un client Supabase pour les tests
 */
function createTestClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error(`
❌ Variables d'environnement Supabase manquantes:
   - NEXT_PUBLIC_SUPABASE_URL: ${url ? '✓' : '❌'}
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${key ? '✓' : '❌'}
   
Vérifiez votre fichier .env.local
    `);
  }
  
  return createClient(url, key);
}

/**
 * Teste l'envoi d'un OTP pour inscription
 */
async function testSignupOTP(supabase: SupabaseClient, user: TestUser): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`   📧 Testing: ${user.email} (${user.metadata.locale || 'default'})`);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: true,
        data: user.metadata,
        emailRedirectTo: undefined // Pas de redirection pour les tests
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (error) {
      return {
        success: false,
        message: `Erreur OTP: ${error.message}`,
        duration,
        error
      };
    }
    
    return {
      success: true,
      message: "OTP envoyé avec succès",
      duration
    };
    
  } catch (err) {
    const duration = Date.now() - startTime;
    const error = err instanceof Error ? err : new Error('Unknown error');
    
    return {
      success: false,
      message: `Erreur inattendue: ${error.message}`,
      duration,
      error
    };
  }
}

/**
 * Exécute une suite de tests
 */
async function runTestSuite(supabase: SupabaseClient, testSuite: TestSuite): Promise<void> {
  console.log(`\n${testSuite.name}`);
  console.log('─'.repeat(50));
  
  let passed = 0;
  let failed = 0;
  const results: TestResult[] = [];
  
  for (const testCase of testSuite.tests) {
    const result = await testSignupOTP(supabase, testCase.user);
    results.push(result);
    
    const expectedSuccess = testCase.expectedResult === 'success';
    const actualSuccess = result.success;
    
    if (expectedSuccess === actualSuccess) {
      console.log(`   ✅ ${testCase.name} (${result.duration}ms)`);
      passed++;
    } else {
      console.log(`   ❌ ${testCase.name} (${result.duration}ms)`);
      console.log(`      Expected: ${testCase.expectedResult}, Got: ${actualSuccess ? 'success' : 'error'}`);
      if (result.error) {
        console.log(`      Error: ${result.message}`);
      }
      failed++;
    }
    
    // Délai entre les tests pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Suite Results: ${passed} passed, ${failed} failed`);
  
  if (results.length > 0) {
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`⏱️  Average response time: ${Math.round(avgDuration)}ms`);
  }
}

/**
 * Vérifie la configuration avant les tests
 */
async function preflightChecks(): Promise<boolean> {
  console.log('🔍 Preflight checks...\n');
  
  // 1. Vérifier les templates
  console.log('1. 📄 Template validation:');
  const validation: ValidationResult = validateTemplates();
  
  if (!validation.isValid) {
    console.log('❌ Templates validation failed. Fix errors before testing.');
    return false;
  }
  
  // 2. Vérifier les variables d'environnement
  console.log('\n2. 🔧 Environment variables:');
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${hasUrl ? '✅' : '❌'}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasKey ? '✅' : '❌'}`);
  
  if (!hasUrl || !hasKey) {
    console.log('\n❌ Missing required environment variables.');
    return false;
  }
  
  // 3. Tester la connexion Supabase
  console.log('\n3. 🔗 Supabase connection:');
  try {
    const supabase = createTestClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message !== 'No session available') {
      console.log(`   ❌ Connection failed: ${error.message}`);
      return false;
    }
    
    console.log('   ✅ Connection successful');
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.log(`   ❌ Connection error: ${error.message}`);
    return false;
  }
  
  console.log('\n✅ All preflight checks passed!\n');
  return true;
}

/**
 * Affiche les instructions post-test
 */
function showPostTestInstructions(): void {
  console.log('\n📋 Next Steps:\n');
  console.log('1. 📧 Check your email inbox(es) for the OTP emails');
  console.log('2. 🎨 Verify the template design and content');
  console.log('3. 🔢 Confirm the OTP codes are visible and properly formatted');
  console.log('4. ⏰ Check that expiration time (5 minutes) is mentioned');
  console.log('5. 🔒 Verify security messages are present');
  console.log('6. 📱 Test email display on mobile devices');
  console.log('\n💡 Tips:');
  console.log('   - Use real email addresses you can access');
  console.log('   - Check spam/junk folders if emails don\'t arrive');
  console.log('   - Test different email clients (Gmail, Outlook, Apple Mail)');
  console.log('   - Verify dark mode compatibility');
}

/**
 * Fonction principale
 */
async function main(): Promise<void> {
  console.log('🧪 Supabase Email Templates Test Suite\n');
  console.log('═'.repeat(60));
  
  try {
    // Vérifications préliminaires
    const preflightPassed = await preflightChecks();
    if (!preflightPassed) {
      process.exit(1);
    }
    
    // Créer le client Supabase
    const supabase = createTestClient();
    
    console.log('🚀 Starting email template tests...');
    console.log('⚠️  Note: This will send real emails to the test addresses\n');
    
    // Confirmation utilisateur
    if (process.env.NODE_ENV !== 'test') {
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    // Exécuter toutes les suites de tests
    for (const testSuite of TEST_SUITES) {
      await runTestSuite(supabase, testSuite);
      
      // Délai entre les suites
      if (testSuite !== TEST_SUITES[TEST_SUITES.length - 1]) {
        console.log('\n⏳ Waiting before next suite...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n═'.repeat(60));
    console.log('🎉 All test suites completed!');
    
    showPostTestInstructions();
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Test execution failed:', errorMessage);
    process.exit(1);
  }
}

// Gestion des signaux pour arrêt propre
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Tests cancelled by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Tests terminated');
  process.exit(0);
});

// Exécution si appelé directement
if (require.main === module) {
  main();
}

export {
  createTestClient,
  testSignupOTP,
  runTestSuite,
  preflightChecks,
  type TestUser,
  type TestResult,
  type TestSuite,
  type TestCase
};