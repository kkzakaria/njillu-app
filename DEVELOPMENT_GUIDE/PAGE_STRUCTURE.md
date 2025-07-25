# Page Structure (SOLID Principles)

Note: This page structure follows SOLID principles to ensure maintainable, scalable, and testable code. Each file has a single responsibility and clear separation of concerns.

app/[locale]/(main)/example-feature/
├── page.tsx                               # Main page export (Re-export only)
├── example-feature-page.tsx               # Actual page implementation
├── components/                            # Feature-specific components
│   ├── example-feature-header.tsx         # Header component
│   ├── example-feature-list.tsx           # List display component
│   ├── example-feature-form.tsx           # Form component
│   ├── example-feature-filters.tsx        # Filters component
│   └── example-feature-modal.tsx          # Modal component
├── hooks/                                 # Feature-specific hooks
│   ├── use-example-feature-data.ts        # Data fetching hook
│   ├── use-example-feature-form.ts        # Form logic hook
│   └── use-example-feature-filters.ts     # Filter logic hook
├── lib/                                   # Feature-specific utilities
│   ├── example-feature-actions.ts         # Server actions
│   ├── example-feature-queries.ts         # Database queries
│   ├── example-feature-validators.ts      # Validation schemas
│   └── example-feature-utils.ts           # Utility functions
├── types/                                 # Feature-specific types
│   └── example-feature.types.ts           # Type definitions
└── stores/                                # Feature-specific state (if needed)
    └── example-feature-store.ts           # Zustand store

SOLID Principles Applied:
S - Single Responsibility Principle

Each component has one specific purpose (header, list, form, etc.)
Hooks handle specific logic (data fetching, form management, filters)
Utilities are separated by concern (actions, queries, validation)
page.tsx only handles Next.js routing export
example-feature-page.tsx contains the actual page implementation

O - Open/Closed Principle

Components are extensible through props and composition
Hooks can be extended without modifying existing code
Validators and utilities can be composed and extended

L - Liskov Substitution Principle

Components follow consistent interfaces
Hooks return predictable data structures
Functions maintain expected input/output contracts

I - Interface Segregation Principle

Types are specific to their use case
Components receive only the props they need
Hooks expose only relevant functionality

D - Dependency Inversion Principle

Components depend on abstractions (hooks) not implementations
Business logic is abstracted in hooks and utilities
Database operations are abstracted in queries and actions

File Responsibilities:

page.tsx: Next.js route file that re-exports the page component
example-feature-page.tsx: Contains the actual page implementation and logic
components/: Presentational components with minimal logic
hooks/: Business logic, data fetching, and state management
lib/actions.ts: Server-side operations and mutations
lib/queries.ts: Data fetching and database operations
lib/validators.ts: Input validation and data sanitization
lib/utils.ts: Pure utility functions and helpers
types/: TypeScript interfaces and type definitions
stores/: Global state management for the feature (when needed)

Code Example:

```typescript
// page.tsx - Next.js route file
export { default } from './example-feature-page';

// example-feature-page.tsx - Actual page implementation
import { ExampleFeatureHeader } from './components/example-feature-header';
import { ExampleFeatureList } from './components/example-feature-list';
// ... other imports

export default function ExampleFeaturePage() {
  // Page implementation here
  return (
    <div>
      <ExampleFeatureHeader />
      <ExampleFeatureList />
      {/* ... other components */}
    </div>
  );
}
```

Benefits:

Maintainability: Clear separation of concerns
Testability: Each piece can be tested in isolation, including the page component
Reusability: Components and hooks can be reused across features
Scalability: Easy to add new functionality without breaking existing code
Readability: Developers can quickly understand the structure and purpose
Next.js Compliance: Follows Next.js App Router conventions while maintaining clean architecture
