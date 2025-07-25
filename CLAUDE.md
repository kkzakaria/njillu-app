# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a clean Next.js application with Supabase integration, based on the official Supabase starter template. It provides a foundation for building applications with authentication, protected routes, and modern React patterns. The project has been cleaned of tutorial components while preserving reference implementations.

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

### Environment Setup

The application requires these environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` - Supabase anonymous key

## Architecture Overview

### Technology Stack
- **Framework**: Next.js (latest) with App Router
- **Language**: TypeScript with strict mode enabled
- **Backend**: Supabase (database, authentication, real-time features)
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui (New York style)
- **Theme**: next-themes for dark/light mode switching
- **Icons**: Lucide React
- **Font**: Geist Sans
- **Linting**: ESLint configured for Next.js and TypeScript

### Supabase Integration Pattern

The application uses a three-client pattern for Supabase integration:

1. **Client-side** (`/lib/supabase/client.ts`): Browser client for client components
2. **Server-side** (`/lib/supabase/server.ts`): Server client for server components and API routes  
3. **Middleware** (`/lib/supabase/middleware.ts`): Session management and route protection

### Authentication Flow

- Uses cookie-based session management through `@supabase/ssr`
- Middleware automatically handles session refresh and route protection
- Authentication pages: login, sign-up, forgot password, update password
- Protected routes redirect unauthenticated users to `/auth/login`
- Server-side authentication pattern: `supabase.auth.getClaims()` for protected pages

### Project Structure

```text
app/
├── auth/                    # Authentication pages
│   ├── confirm/            # Email confirmation
│   ├── error/              # Auth error handling
│   ├── forgot-password/    # Password reset request
│   ├── login/              # Login page
│   ├── sign-up/            # Registration page
│   ├── sign-up-success/    # Registration success
│   └── update-password/    # Password update
├── protected/              # Protected route example
├── globals.css             # Global styles with CSS variables
├── layout.tsx              # Root layout with theme provider
└── page.tsx                # Homepage

components/
├── ui/                     # shadcn/ui components (DO NOT MODIFY)
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   └── label.tsx
├── forgot-password-form.tsx # Password reset form
├── login-form.tsx          # Login form component
├── logout-button.tsx       # Logout functionality
├── sign-up-form.tsx        # Registration form
├── theme-switcher.tsx      # Dark/light mode toggle
└── update-password-form.tsx # Password update form

lib/
├── supabase/               # Supabase client configurations
│   ├── client.ts           # Browser client
│   ├── middleware.ts       # Session management
│   └── server.ts           # Server client
└── utils.ts                # Utility functions and helpers

supabase/
├── config.toml             # Local Supabase configuration
└── migrations/             # Database migrations
    └── 20250724181317_remote_schema.sql
```

## Development Conventions

### Authentication Patterns

**Server-side Authentication Check** (for protected pages):
```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }
  
  // Page content for authenticated users
}
```

**Client Creation Rules**:
- Always create new Supabase clients (never use global variables)
- Use appropriate client type based on context (client/server/middleware)
- Handle cookie management properly in server contexts
- The server client includes important notes about Fluid compute compatibility

### Naming Conventions

**Files and Components**:
- Component files: `kebab-case` (e.g., `theme-switcher.tsx`)
- Component names: `PascalCase` (e.g., `ThemeSwitcher`)
- Page files: lowercase (`page.tsx`, `layout.tsx`, `loading.tsx`)

**Import Aliases**:
- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/app` → `./app`

### shadcn/ui Integration

- **DO NOT modify** components in `components/ui/` directly
- Use shadcn/ui CLI to add new components: `npx shadcn-ui@latest add [component]`
- Configuration in `components.json` (New York style, CSS variables enabled)
- Custom styling through CSS variables in `globals.css`

## Key Implementation Details

### Middleware Configuration

The middleware (`middleware.ts`) protects all routes except:
- Static files (`_next/static`, `_next/image`)
- Public assets (images, favicon)
- Authentication routes (`/auth/*`, `/login`)

Routes without authenticated users are redirected to `/auth/login`.

### Environment Variable Handling

The `lib/utils.ts` includes `hasEnvVars` check that prevents middleware from running when environment variables are not configured, allowing development without immediate Supabase setup.

### Theme System

- Uses `next-themes` with system preference detection
- CSS variables defined in `globals.css` for both light and dark modes
- Theme switcher component (`components/theme-switcher.tsx`) available
- Configured to disable transition animations on theme change

### Database Migrations

- Located in `supabase/migrations/`
- Current schema: `20250724181317_remote_schema.sql`
- Use `supabase db diff` to generate new migrations
- Local development with `supabase start` and Studio at `http://localhost:54323`

## Development Workflow

1. **Setup**: Install dependencies with `pnpm install`
2. **Environment**: Create `.env.local` with Supabase credentials
3. **Database**: Start local Supabase with `supabase start` (optional)
4. **Development**: Run `pnpm dev` to start development server
5. **Testing**: Test authentication flows and protected routes
6. **Building**: Use `pnpm build` to create production build

## Reference Documentation

The project includes `REFERENCE.md` with preserved examples from the original Supabase template, including:
- Complete authentication component implementations
- Tutorial step components
- Environment variable warning components
- Deploy button implementations
- Code block display components

These examples can be referenced when implementing similar functionality without cluttering the current clean codebase.

## Project Context

This is a cleaned version of the official Supabase Next.js starter template. All tutorial and example components have been removed while maintaining the core authentication and routing functionality. The project serves as a clean foundation for building Next.js applications with Supabase integration.