/**
 * MSW server setup for Node.js environment (Jest tests)
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup server with request handlers
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn'
  });
});

// Reset handlers after each test  
afterEach(() => {
  server.resetHandlers();
});

// Stop server after all tests
afterAll(() => {
  server.close();
});