# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application with Supabase integration for authentication and database functionality. It's built with TypeScript, Tailwind CSS, and shadcn/ui components. The project includes both local development with Supabase CLI and production deployment capabilities.

## Key Development Commands

### Development

- `pnpm dev` or `npm run dev` - Start development server with Turbopack
- `pnpm build` or `npm run build` - Build production application
- `pnpm start` or `npm start` - Start production server
- `pnpm lint` or `npm run lint` - Run ESLint

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

```text
app/
├── auth/                    # Authentication pages
├── protected/               # Protected routes (requires auth)
├── layout.tsx              # Root layout with theme provider
└── page.tsx                # Landing page

components/
├── forgot-password-form.tsx # Forgot password form component
├── login-form.tsx          # Login form component
├── logout-button.tsx       # Logout button component
├── sign-up-form.tsx        # Sign up form component
├── theme-switcher.tsx      # Theme switching component
├── update-password-form.tsx # Update password form component
└── ui/                     # shadcn/ui components

lib/
├── supabase/               # Supabase client configurations
└── utils.ts                # Utility functions

supabase/
├── config.toml             # Local Supabase configuration
└── migrations/             # Database migrations
```

### UI Framework

- **CSS Framework**: Tailwind CSS with CSS variables for theming
- **Component Library**: shadcn/ui (New York style)
- **Theme System**: next-themes with light/dark mode support
- **Font**: Geist Sans with optimal display settings
- **Icons**: Lucide React

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

## Key Conventions

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

## Testing and Validation

- Test authentication flows: sign-up, login, logout, password reset
- Verify RLS policies with different user contexts
- Test protected route redirects
- Validate environment variable setup
- Ensure middleware session handling works correctly

## important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
