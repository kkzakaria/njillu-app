# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT**: Always refer to the comprehensive development guide in `/DEVELOPMENT_GUIDE/` for detailed specifications, patterns, and best practices. This file provides a summary - the development guide contains the authoritative documentation.

## Project Overview

This is a comprehensive digital platform for customs broker file management and processing. It's a Next.js 15.4 application with Supabase integration, built with TypeScript, Tailwind CSS, and shadcn/ui components. The project covers the complete customs operations process from file creation to finalization.

### Business Domain
- **Complete document management**: Secure storage and organization of customs documents
- **Integrated customs processes**: FDI (Import Clearance Form) and RFCV (Empty Container Supply Request) management
- **Financial management**: Client invoicing, payment tracking, and shipping company submissions
- **Administration**: Multi-user management with granular roles and permissions

## Key Development Commands

### Development

- `pnpm dev` or `npm run dev` - Start development server with Turbopack
- `pnpm build` or `npm run build` - Build production application
- `pnpm start` or `npm start` - Start production server
- `pnpm lint` or `npm run lint` - Run ESLint

### Testing

- `npm test` or `pnpm test` - Run Jest unit and integration tests
- Bundle analysis with `@next/bundle-analyzer` when needed

### Supabase Local Development

- `supabase start` - Start local Supabase services (requires Docker)
- `supabase stop` - Stop local Supabase services
- `supabase status` - Check status of local services
- `supabase db reset` - Reset local database with migrations
- `supabase db diff` - Generate migration from schema changes
- `supabase functions serve` - Serve Edge Functions locally

### Environment Setup

The application requires these environment variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` - Supabase anonymous key

## Architecture Overview

### Supabase Integration Pattern

The application uses a three-client pattern for Supabase integration:

1. **Client-side** (`/lib/supabase/client.ts`): Browser client for client components
2. **Server-side** (`/lib/supabase/server.ts`): Server client for server components and API routes
3. **Middleware** (`/lib/supabase/middleware.ts`): Session management and route protection

### Authentication Flow

- Uses cookie-based session management through `@supabase/ssr`
- Middleware handles automatic session refresh and route protection
- Authentication pages: login, sign-up, forgot password, update password
- Protected routes redirect to `/auth/login` when unauthenticated

### Project Structure

**Reference**: See `/DEVELOPMENT_GUIDE/PROJECT_STRUCTURE.md` for complete project organization details.

```text
app/
├── [locale]/                       # Internationalized routes (next-intl)
│   ├── (auth)/                     # Authentication route group
│   │   ├── login/                  # Login page
│   │   ├── forgot-password/        # Password reset request
│   │   ├── otp/                    # OTP verification
│   │   └── update-password/        # Password update
│   ├── (main)/                     # Protected application routes
│   │   ├── (documentation)/        # Document management
│   │   │   ├── folders/            # Folder management
│   │   │   ├── containers/         # Container management
│   │   │   ├── edit-bill-fdi/      # FDI invoice editing
│   │   │   ├── fdi/                # FDI management
│   │   │   ├── rfcv/               # RFCV management
│   │   │   └── declaration/        # Customs declaration
│   │   ├── (exploitation)/         # Operations management
│   │   │   ├── shipping-company-submission/
│   │   │   └── payment-invoice/
│   │   ├── (invoicing)/            # Client invoicing
│   │   │   ├── client-invoice/
│   │   │   └── invoice-history/
│   │   ├── request-for-funds/      # Fund request management
│   │   ├── user-profile/           # User profile management
│   │   ├── users-management/       # User management
│   │   └── settings/               # Application settings
│   ├── (error)/                    # Error pages
│   │   ├── not-found/              # 404 error page
│   │   └── unauthorized/           # Unauthorized access
│   └── page.tsx                    # Homepage

components/                         # Reusable UI components (Shadcn UI + custom)
├── ui/                            # Shadcn UI components (DO NOT MODIFY)
└── [component-name]/              # Custom components (SOLID structure)
    ├── index.ts                   # Barrel export
    ├── [component-name].tsx       # Main component
    ├── components/                # Sub-components
    ├── hooks/                     # Component-specific hooks
    ├── lib/                       # Component utilities
    ├── types/                     # Component type definitions
    └── __tests__/                 # Component tests

hooks/                             # Reusable React hooks
i18n/                             # Internationalization (next-intl)
lib/                              # Utilities and Supabase configuration
stores/                           # Zustand stores (UI state only)
supabase/                         # Database migrations and functions
types/                            # Global TypeScript definitions
```

### Technology Stack

**Reference**: See `/DEVELOPMENT_GUIDE/MAIN_TECHNOLIGIES.md` for detailed technology integration patterns.

- **Framework**: Next.js 15.4 with App Router only
- **Language**: TypeScript with strict mode enabled
- **Backend**: Supabase (database, authentication, real-time features)
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui (New York style) - DO NOT modify library components directly
- **State Management**: Zustand (UI state only, minimized usage)
- **URL State**: nuqs for type-safe search parameters
- **Internationalization**: next-intl with locale routing
- **Icons**: Lucide React
- **Testing**: Jest for unit and integration tests
- **Linting**: ESLint configured for Next.js, TypeScript, and React

## Database Development Guidelines

When working with database migrations and RLS policies, follow these conventions:

### Migration Files

- Place in `supabase/migrations/`
- Use naming format: `YYYYMMDDHHmmss_description.sql`
- Always enable RLS on new tables
- Write SQL in lowercase with thorough comments
- Include granular RLS policies for each operation (select, insert, update, delete)

### RLS Policy Standards

- Create separate policies for each operation and role
- Use `auth.uid()` instead of `current_user`
- Wrap functions in SELECT for performance: `(select auth.uid())`
- Always specify roles with `TO authenticated` or `TO anon`
- Add indexes on columns used in policies
- Prefer `PERMISSIVE` over `RESTRICTIVE` policies

## Development Conventions

**Reference**: See `/DEVELOPMENT_GUIDE/NAMING_CONVENTIONS.md` for complete naming standards.

### Naming Conventions

**Routes and Pages**:
- Route folders: `kebab-case` (e.g., `user-profile/`, `edit-bill-fdi/`)
- Next.js files: lowercase (`page.tsx`, `layout.tsx`, `loading.tsx`)

**Components**:
- File names: `kebab-case` (e.g., `user-card.tsx`, `navigation-menu.tsx`)
- Component names: `PascalCase` (e.g., `UserCard`, `NavigationMenu`)

**Hooks and Functions**:
- Files: `camelCase` with "use" prefix for hooks (e.g., `useLocalStorage.ts`)
- Functions: `camelCase` with descriptive names
- Event handlers: "handle" prefix (e.g., `handleFormSubmit`, `handleInputChange`)

**Types and Constants**:
- Type files: `camelCase` with ".types" suffix (e.g., `user.types.ts`)
- Types: `PascalCase` (e.g., `UserRole`, `ApiStatus`)
- Constants: `SCREAMING_SNAKE_CASE`

### Import Aliases

- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/lib/utils` → `./lib/utils`
- `@/components/ui` → `./components/ui`
- `@/hooks` → `./hooks`

### Authentication Patterns

- Always create new Supabase clients (don't use global variables) - see REFERENCE.md for examples
- Use appropriate client type based on context (client/server/middleware)
- Handle cookie management properly in server contexts
- Implement proper error handling for auth state changes
- Use `supabase.auth.getClaims()` for server-side authentication checks
- Redirect unauthenticated users to `/auth/login` from protected pages

## Architecture Patterns

**Reference**: See `/DEVELOPMENT_GUIDE/COMPONENT_STRUCTURE.md` and `/DEVELOPMENT_GUIDE/PAGE_STRUCTURE.md` for detailed SOLID architecture patterns.

### Component Structure (SOLID Principles)

**Custom Components** follow SOLID structure:
```text
components/example-component/
├── index.ts                    # Barrel export
├── example-component.tsx       # Main component
├── components/                 # Sub-components
├── hooks/                      # Component-specific hooks
├── lib/                        # Component utilities
├── types/                      # Component types
└── __tests__/                  # Component tests
```

**Library Components** (shadcn/ui):
- **NEVER modify** library components directly
- Wrap them in custom components when customization needed
- Keep original structure from `components/ui/`

### Page Structure (SOLID Principles)

```text
app/[locale]/(main)/example-feature/
├── page.tsx                    # Next.js route (re-export only)
├── example-feature-page.tsx    # Actual page implementation
├── components/                 # Feature-specific components
├── hooks/                      # Feature-specific hooks
├── lib/                        # Feature utilities and actions
├── types/                      # Feature types
└── stores/                     # Feature state (if needed)
```

### State Management Strategy

- **Zustand**: UI state only (sidebar, theme, modals) - minimize usage
- **nuqs**: URL state management (preferred for filters, pagination)
- **Server Components**: Data fetching and server state
- **Supabase**: Backend state and real-time subscriptions

### Development Workflow

1. Start local Supabase: `supabase start`
2. Run dev server: `pnpm dev`
3. Make database changes via migrations
4. Test authentication flows thoroughly
5. Use Supabase Studio at `http://localhost:54323` for database management

### Project History and Context

This project is a cleaned version of the original Supabase + Next.js template. The original template included:

- Tutorial components and step-by-step guides
- Hero sections with Supabase/Next.js branding
- Deploy buttons and environment variable warnings
- Example implementations for common patterns

All examples and tutorial components have been removed to create a clean base, but are preserved in `REFERENCE.md` for reference when implementing similar functionality.

## Code Patterns and Examples

This project was cleaned from the original Supabase template. For reference implementations, see `REFERENCE.md` which contains:

### Authentication Components

- Auth button with user state management
- Environment variable validation warnings
- Server-side user authentication checks

### Protected Page Pattern

```tsx
// Standard pattern for protected pages
const supabase = await createClient();
const { data, error } = await supabase.auth.getClaims();
if (error || !data?.claims) {
  redirect("/auth/login");
}
```

### Common Components Available in REFERENCE.md

- Tutorial step components
- Code block display components
- Hero sections with logo integration
- Deploy buttons for Vercel
- Navigation with authentication state

## Best Practices

**Reference**: See `/DEVELOPMENT_GUIDE/BEST_PRACTRICES_RECOMMENDATIONS.md` for comprehensive best practices and code examples.

### Performance
- Use Server Components by default, Client Components only when necessary
- Implement `loading.tsx` files and Suspense boundaries
- Use `next/dynamic` for non-critical components (`ssr: false` for client-only)
- Use React.memo() for expensive components with stable props
- Always use descriptive variable and function names

### Security
- Always validate user permissions server-side
- Use Supabase RLS policies for data access control
- Validate all inputs on both client and server side
- Use Zod schemas for consistent validation
- Never expose sensitive data in client-side code

### UI/UX
- Implement proper ARIA labels and semantic HTML
- Ensure keyboard navigation works for all interactive elements
- Always provide loading states for async operations
- Use skeleton loaders for better perceived performance
- Design mobile-first with progressive enhancement

### Internationalization
- Always use translation keys with next-intl, never hardcoded strings
- Consider RTL support and proper date/number formatting per locale

## Testing and Validation

- Test authentication flows: sign-up, login, logout, password reset
- Verify RLS policies with different user contexts
- Test protected route redirects
- Validate environment variable setup
- Ensure middleware session handling works correctly
- Run Jest unit and integration tests

## important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
