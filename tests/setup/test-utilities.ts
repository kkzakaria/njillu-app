/**
 * Test Utilities and Helper Functions
 * Provides common testing utilities, assertions, and helper functions
 */

import { waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Performance timing utilities
 */
export class PerformanceTimer {
  private startTime: number;
  private measurements: { [key: string]: number } = {};

  start(): void {
    this.startTime = performance.now();
  }

  stop(): number {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    return performance.now() - this.startTime;
  }

  measure(label: string): number {
    const duration = this.stop();
    this.measurements[label] = duration;
    return duration;
  }

  getMeasurements(): { [key: string]: number } {
    return { ...this.measurements };
  }

  reset(): void {
    this.startTime = 0;
    this.measurements = {};
  }
}

/**
 * Database testing utilities
 */
export class DatabaseTestUtils {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Checks if a table exists in the database
   */
  async tableExists(tableName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();

    return !error && data !== null;
  }

  /**
   * Gets the count of records in a table
   */
  async getTableCount(tableName: string, filters: Record<string, any> = {}): Promise<number> {
    let query = this.supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
  }

  /**
   * Checks if a column exists in a table
   */
  async columnExists(tableName: string, columnName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .single();

    return !error && data !== null;
  }

  /**
   * Checks if an index exists
   */
  async indexExists(indexName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('schemaname', 'public')
      .eq('indexname', indexName)
      .single();

    return !error && data !== null;
  }

  /**
   * Gets table constraints (foreign keys, unique constraints, etc.)
   */
  async getTableConstraints(tableName: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);

    if (error) throw error;
    return data || [];
  }

  /**
   * Executes raw SQL query (use with caution in tests)
   */
  async executeRawSQL(sql: string): Promise<any> {
    const { data, error } = await this.supabase.rpc('execute_sql', { query: sql });
    if (error) throw error;
    return data;
  }

  /**
   * Waits for database transaction to complete
   */
  async waitForTransaction(
    checkFn: () => Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    await waitFor(checkFn, { timeout, interval });
  }
}

/**
 * Data validation utilities
 */
export class DataValidationUtils {
  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates phone number format (basic validation)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validates UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validates ISO date string
   */
  static isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString();
  }

  /**
   * Validates postal code for different countries
   */
  static isValidPostalCode(postalCode: string, country: string): boolean {
    const patterns: { [key: string]: RegExp } = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      GB: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
      FR: /^\d{5}$/,
      DE: /^\d{5}$/,
      IT: /^\d{5}$/,
      ES: /^\d{5}$/,
      NL: /^\d{4} ?[A-Z]{2}$/,
      AU: /^\d{4}$/,
      JP: /^\d{3}-\d{4}$/
    };

    const pattern = patterns[country.toUpperCase()];
    return pattern ? pattern.test(postalCode.toUpperCase()) : true; // Default to true for unknown countries
  }

  /**
   * Validates JSON structure
   */
  static isValidJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates that an object has required properties
   */
  static hasRequiredProperties<T extends Record<string, any>>(
    obj: T,
    requiredProps: (keyof T)[]
  ): boolean {
    return requiredProps.every(prop => 
      obj.hasOwnProperty(prop) && 
      obj[prop] !== null && 
      obj[prop] !== undefined &&
      (typeof obj[prop] !== 'string' || obj[prop].trim() !== '')
    );
  }

  /**
   * Deep validates nested object structure
   */
  static validateNestedObject(
    obj: any,
    schema: { [key: string]: any }
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    function validateRecursive(current: any, schemaPath: any, path: string = ''): void {
      if (typeof schemaPath === 'object' && schemaPath !== null && !Array.isArray(schemaPath)) {
        if (typeof current !== 'object' || current === null) {
          errors.push(`${path || 'root'} should be an object`);
          return;
        }

        Object.entries(schemaPath).forEach(([key, expectedType]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (!(key in current)) {
            errors.push(`Missing required property: ${currentPath}`);
            return;
          }

          if (typeof expectedType === 'string') {
            if (expectedType === 'array' && !Array.isArray(current[key])) {
              errors.push(`${currentPath} should be an array`);
            } else if (expectedType !== 'array' && typeof current[key] !== expectedType) {
              errors.push(`${currentPath} should be of type ${expectedType}`);
            }
          } else if (typeof expectedType === 'object') {
            validateRecursive(current[key], expectedType, currentPath);
          }
        });
      }
    }

    validateRecursive(obj, schema);
    return { valid: errors.length === 0, errors };
  }
}

/**
 * Test data generation utilities
 */
export class TestDataGenerator {
  /**
   * Generates random string of specified length
   */
  static randomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generates random email address
   */
  static randomEmail(domain: string = 'test.com'): string {
    return `test${this.randomString(6)}@${domain}`;
  }

  /**
   * Generates random UUID (v4 format)
   */
  static randomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generates random phone number
   */
  static randomPhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const centralOffice = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `+1${areaCode}${centralOffice}${lineNumber}`;
  }

  /**
   * Generates random date within range
   */
  static randomDate(startDate: Date = new Date(2020, 0, 1), endDate: Date = new Date()): Date {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    return new Date(startTime + Math.random() * (endTime - startTime));
  }

  /**
   * Generates random number within range
   */
  static randomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates random boolean
   */
  static randomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  /**
   * Picks random element from array
   */
  static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generates random address
   */
  static randomAddress(): {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    region?: string;
  } {
    const streets = ['Main St', 'Oak Ave', 'Elm Street', 'Park Road', 'First Avenue'];
    const cities = ['Springfield', 'Madison', 'Georgetown', 'Franklin', 'Riverside'];
    const countries = ['US', 'CA', 'GB', 'FR', 'DE'];
    
    return {
      street: `${this.randomNumber(1, 9999)} ${this.randomChoice(streets)}`,
      city: this.randomChoice(cities),
      postal_code: this.randomNumber(10000, 99999).toString(),
      country: this.randomChoice(countries),
      region: 'Test Region'
    };
  }
}

/**
 * Async testing utilities
 */
export class AsyncTestUtils {
  /**
   * Waits for a condition to be true with timeout
   */
  static async waitForCondition(
    condition: () => Promise<boolean> | boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.sleep(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Executes functions in parallel with concurrency limit
   */
  static async parallelLimit<T>(
    items: T[],
    asyncFn: (item: T) => Promise<any>,
    concurrency: number = 5
  ): Promise<any[]> {
    const results: any[] = [];
    const executing: Promise<any>[] = [];

    for (const item of items) {
      const promise = asyncFn(item).then(result => {
        results.push(result);
        executing.splice(executing.indexOf(promise), 1);
      });
      
      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Retries async operation with exponential backoff
   */
  static async retry<T>(
    asyncFn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Times out a promise after specified duration
   */
  static async timeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}

/**
 * Memory and resource monitoring utilities
 */
export class ResourceMonitor {
  private initialMemory: NodeJS.MemoryUsage;
  private measurements: Array<{ timestamp: number; memory: NodeJS.MemoryUsage }> = [];

  constructor() {
    this.initialMemory = process.memoryUsage();
  }

  /**
   * Takes a memory measurement snapshot
   */
  snapshot(): NodeJS.MemoryUsage {
    const memory = process.memoryUsage();
    this.measurements.push({
      timestamp: Date.now(),
      memory
    });
    return memory;
  }

  /**
   * Gets memory usage difference from initial
   */
  getMemoryDifference(): {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  } {
    const current = process.memoryUsage();
    return {
      heapUsed: current.heapUsed - this.initialMemory.heapUsed,
      heapTotal: current.heapTotal - this.initialMemory.heapTotal,
      external: current.external - this.initialMemory.external,
      rss: current.rss - this.initialMemory.rss
    };
  }

  /**
   * Gets peak memory usage
   */
  getPeakMemoryUsage(): NodeJS.MemoryUsage | null {
    if (this.measurements.length === 0) return null;

    return this.measurements.reduce((peak, measurement) => {
      return measurement.memory.heapUsed > peak.heapUsed 
        ? measurement.memory 
        : peak;
    }).memory;
  }

  /**
   * Checks for memory leaks based on growth pattern
   */
  detectMemoryLeak(threshold: number = 10 * 1024 * 1024): boolean { // 10MB threshold
    if (this.measurements.length < 2) return false;

    const first = this.measurements[0].memory.heapUsed;
    const last = this.measurements[this.measurements.length - 1].memory.heapUsed;
    
    return (last - first) > threshold;
  }

  /**
   * Forces garbage collection if available
   */
  forceGC(): void {
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Resets monitoring data
   */
  reset(): void {
    this.initialMemory = process.memoryUsage();
    this.measurements = [];
  }
}

/**
 * Custom test assertions
 */
export class CustomAssertions {
  /**
   * Asserts that a value is within a percentage range
   */
  static assertWithinPercentage(actual: number, expected: number, percentage: number): void {
    const tolerance = Math.abs(expected * (percentage / 100));
    const difference = Math.abs(actual - expected);
    
    if (difference > tolerance) {
      throw new Error(
        `Expected ${actual} to be within ${percentage}% of ${expected} (tolerance: ±${tolerance}, difference: ${difference})`
      );
    }
  }

  /**
   * Asserts that an operation completes within time limit
   */
  static async assertCompletesWithinTime<T>(
    asyncOperation: () => Promise<T>,
    maxTimeMs: number
  ): Promise<T> {
    const startTime = performance.now();
    const result = await asyncOperation();
    const duration = performance.now() - startTime;
    
    if (duration > maxTimeMs) {
      throw new Error(`Operation took ${duration}ms, expected <= ${maxTimeMs}ms`);
    }
    
    return result;
  }

  /**
   * Asserts that memory usage doesn't exceed limit
   */
  static assertMemoryUsageWithinLimit(monitor: ResourceMonitor, limitMB: number): void {
    const peakUsage = monitor.getPeakMemoryUsage();
    if (!peakUsage) return;
    
    const peakMB = peakUsage.heapUsed / (1024 * 1024);
    if (peakMB > limitMB) {
      throw new Error(`Peak memory usage ${peakMB.toFixed(2)}MB exceeded limit of ${limitMB}MB`);
    }
  }

  /**
   * Asserts that an array contains all expected items in any order
   */
  static assertArrayContainsAll<T>(actual: T[], expected: T[]): void {
    const missing = expected.filter(item => !actual.includes(item));
    if (missing.length > 0) {
      throw new Error(`Array missing expected items: ${JSON.stringify(missing)}`);
    }
  }

  /**
   * Asserts that an object has all expected properties with correct types
   */
  static assertObjectStructure(
    obj: any,
    expectedStructure: { [key: string]: string }
  ): void {
    const errors: string[] = [];
    
    Object.entries(expectedStructure).forEach(([key, expectedType]) => {
      if (!(key in obj)) {
        errors.push(`Missing property: ${key}`);
      } else if (typeof obj[key] !== expectedType) {
        errors.push(`Property ${key} has type ${typeof obj[key]}, expected ${expectedType}`);
      }
    });
    
    if (errors.length > 0) {
      throw new Error(`Object structure validation failed:\n${errors.join('\n')}`);
    }
  }
}

/**
 * Export all utilities as a single object for easy importing
 */
export const TestUtils = {
  PerformanceTimer,
  DatabaseTestUtils,
  DataValidationUtils,
  TestDataGenerator,
  AsyncTestUtils,
  ResourceMonitor,
  CustomAssertions
};