/**
 * Authentication helper utilities for E2E tests
 */

import { Page, BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export const authStateFile = {
  path: './e2e/auth-state.json',
  exists: () => fs.existsSync('./e2e/auth-state.json'),
};

export interface AuthUser {
  email: string;
  password: string;
  role?: string;
}

export const testUsers: Record<string, AuthUser> = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  },
  user: {
    email: process.env.TEST_USER_EMAIL || 'user@test.com',
    password: process.env.TEST_USER_PASSWORD || 'user123',
    role: 'user',
  },
  viewer: {
    email: process.env.TEST_VIEWER_EMAIL || 'viewer@test.com',
    password: process.env.TEST_VIEWER_PASSWORD || 'viewer123',
    role: 'viewer',
  },
};

/**
 * Login with test user credentials
 */
export async function login(page: Page, userType: keyof typeof testUsers = 'user') {
  const user = testUsers[userType];
  
  await page.goto('/auth/login');
  
  // Wait for login form to be ready
  await page.waitForSelector('[data-testid="email-input"]');
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  
  // Submit form
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login redirect
  await page.waitForURL('/protected', { timeout: 10000 });
  
  return user;
}

/**
 * Save authentication state for reuse across tests
 */
export async function saveAuthState(context: BrowserContext) {
  await context.storageState({ path: authStateFile.path });
}

/**
 * Load authentication state from file
 */
export async function loadAuthState(context: BrowserContext) {
  if (authStateFile.exists()) {
    await context.addStorageState({ path: authStateFile.path });
    return true;
  }
  return false;
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Click logout button (could be in header, menu, etc.)
  const logoutButton = page.locator('[data-testid="logout-button"]').first();
  
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // Try to find logout in user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.locator('[data-testid="logout-menu-item"]').click();
    }
  }
  
  // Wait for redirect to login page
  await page.waitForURL('/auth/login', { timeout: 5000 });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Navigate to protected page
    await page.goto('/protected');
    
    // If we're redirected to login, we're not authenticated
    if (page.url().includes('/auth/login')) {
      return false;
    }
    
    // If we can access protected content, we're authenticated
    await page.waitForSelector('[data-testid="protected-content"]', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Setup authentication for test suite
 */
export async function setupAuth(page: Page, userType: keyof typeof testUsers = 'user') {
  // Check if already authenticated
  if (await isAuthenticated(page)) {
    return testUsers[userType];
  }
  
  // Login with specified user
  const user = await login(page, userType);
  
  // Save auth state for reuse
  await saveAuthState(page.context());
  
  return user;
}

/**
 * Mock authentication for tests that don't need real auth
 */
export async function mockAuth(page: Page, userRole: string = 'user') {
  // Mock authentication state
  await page.addInitScript((role) => {
    // Mock user session in localStorage
    localStorage.setItem('auth-user', JSON.stringify({
      id: 'test-user-id',
      email: `test-${role}@example.com`,
      role: role,
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    }));
    
    // Mock authentication token
    localStorage.setItem('auth-token', 'mock-jwt-token');
  }, userRole);
  
  // Mock API responses for authentication
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        user: {
          id: 'test-user-id',
          email: `test-${userRole}@example.com`,
          role: userRole,
          name: `Test ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
        },
      },
    });
  });
}

/**
 * Create test user session with specific permissions
 */
export async function createTestSession(page: Page, permissions: string[] = []) {
  const session = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
      name: 'Test User',
      permissions,
    },
    token: 'mock-jwt-token',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  
  await page.addInitScript((sessionData) => {
    localStorage.setItem('auth-session', JSON.stringify(sessionData));
  }, session);
  
  return session;
}

/**
 * Wait for authentication to be ready
 */
export async function waitForAuth(page: Page, timeout: number = 5000) {
  try {
    await page.waitForFunction(() => {
      // Check for auth token or user data
      return localStorage.getItem('auth-token') || 
             localStorage.getItem('auth-user') ||
             localStorage.getItem('auth-session');
    }, { timeout });
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up authentication state
 */
export async function cleanupAuth() {
  if (authStateFile.exists()) {
    try {
      fs.unlinkSync(authStateFile.path);
    } catch (error) {
      console.warn('Failed to cleanup auth state file:', error);
    }
  }
}

/**
 * Test authentication flows
 */
export const authFlows = {
  /**
   * Test successful login flow
   */
  async testLogin(page: Page, userType: keyof typeof testUsers = 'user') {
    const user = testUsers[userType];
    
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to protected area
    await page.waitForURL('/protected');
    return user;
  },
  
  /**
   * Test failed login flow
   */
  async testFailedLogin(page: Page) {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await page.waitForSelector('[data-testid="login-error"]');
    return page.locator('[data-testid="login-error"]');
  },
  
  /**
   * Test protected route access
   */
  async testProtectedRoute(page: Page, route: string) {
    await page.goto(route);
    
    // Should redirect to login if not authenticated
    if (!await isAuthenticated(page)) {
      await page.waitForURL('/auth/login');
      return false;
    }
    
    return true;
  },
  
  /**
   * Test logout flow
   */
  async testLogout(page: Page) {
    await logout(page);
    
    // Should redirect to login
    await page.waitForURL('/auth/login');
    
    // Should not be able to access protected routes
    await page.goto('/protected');
    await page.waitForURL('/auth/login');
    
    return true;
  },
};