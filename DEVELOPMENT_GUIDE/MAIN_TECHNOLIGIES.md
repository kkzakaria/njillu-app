# Main Technologies

## Next.js 15.4 with App Router only

Role: Main React framework for building the application Integration: Works with TypeScript for type safety, uses Tailwind CSS for styling, integrates with Supabase for backend operations, and serves as the foundation for all other technologies in the stack.

## TypeScript with strict mode enabled

Role: Provides static type checking and enhanced development experience Integration: Used across all components, hooks, utilities, and API interactions. Works closely with Next.js for better IntelliSense and compile-time error detection. Ensures type safety for Supabase operations and Zustand store definitions.

## Supabase

Role: Backend-as-a-Service providing database, authentication, and real-time features Integration: Handles user authentication, data storage, and API operations. TypeScript types are generated from Supabase schemas. Works with Next.js API routes and server components for secure data fetching.

## Tailwind CSS

Role: Utility-first CSS framework for rapid UI development Integration: Primary styling solution for all components. Works seamlessly with Shadcn UI components and Next.js. Provides responsive design capabilities and consistent design system across the application.

## Shadcn UI

Role: Collection of reusable UI components built on top of Radix UI Integration: Built with Tailwind CSS for styling, provides accessible and customizable components. Integrates with TypeScript for proper typing and works within the Next.js component ecosystem.

## Zustand

Role: Lightweight state management for global UI state only Integration: Manages client-side UI state (modals, themes, user preferences). Works with TypeScript for type-safe state management. Complements Supabase for server state while handling local UI state.

## Nuqs

Role: Type-safe URL state management for search parameters Integration: Manages URL query parameters in a type-safe manner. Works with Next.js App Router for URL state synchronization and TypeScript for parameter validation.

## next-intl

Role: Internationalization library for multi-language support Integration: Integrated with Next.js App Router for locale routing. Works with TypeScript for type-safe translations and provides localized content across all components.

## Lucide React

Role: Icon library providing consistent and customizable icons Integration: Used within Shadcn UI components and custom components. Styled with Tailwind CSS classes and integrated with the overall design system.

## ESLint

Role: Code linting and formatting tool for maintaining code quality Integration: Configured for Next.js, TypeScript, and React best practices. Ensures consistent code style across all files and integrates with the development workflow.

## Jest

Role: Testing framework for unit and integration tests Integration: Tests TypeScript components, utilities, and hooks. Works with Next.js testing utilities and can test Supabase integrations in a controlled environment.
