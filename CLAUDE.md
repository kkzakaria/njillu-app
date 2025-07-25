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
- **Internationalization**: next-intl with modular translation architecture
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui (New York style), magicui (Globe component)
- **Animations**: Motion (React motion library)
- **Theme**: next-themes for dark/light mode switching
- **Icons**: Lucide React
- **Font**: Geist Sans
- **Linting**: ESLint configured for Next.js and TypeScript

### Supabase Integration Pattern

The application uses a three-client pattern for Supabase integration:

1. **Client-side** (`/lib/supabase/client.ts`): Browser client for client components
2. **Server-side** (`/lib/supabase/server.ts`): Server client for server components and API routes  
3. **Middleware** (`/lib/supabase/middleware.ts`): Session management and route protection

### Internationalization Architecture

**Three-Language Support**: French (default), English, Spanish with localized URLs:
- `/fr/auth/connexion`, `/en/auth/login`, `/es/auth/iniciar-sesion`

**Modular Translation System**:
- Organized by functional domains (auth, navigation, common, customs, etc.)
- Each domain has separate JSON files per language 
- Hooks-based API: `useAuth()`, `useCommon()`, `useNavigation()`
- Server and client component patterns supported

**Hybrid Middleware**: Combines next-intl internationalization with Supabase authentication in single middleware chain.

### Authentication Flow

- Uses cookie-based session management through `@supabase/ssr`
- Middleware automatically handles session refresh and route protection
- Authentication pages: login, sign-up, forgot password, update password (all localized)
- Protected routes redirect unauthenticated users to localized `/auth/login`
- Server-side authentication pattern: `supabase.auth.getClaims()` for protected pages

### Project Structure

```text
app/
├── [locale]/               # Internationalized routes
│   ├── auth/              # Localized authentication pages
│   ├── protected/         # Protected route example
│   ├── layout.tsx         # Locale-specific layout
│   └── page.tsx           # Localized homepage
├── globals.css            # Global styles with CSS variables
├── layout.tsx             # Root layout
└── not-found.tsx          # 404 page

components/
├── ui/                    # shadcn/ui components (DO NOT MODIFY)
│   └── [various].tsx
├── magicui/               # Enhanced UI components
│   └── globe.tsx          # Interactive 3D Globe with COBE
├── *-form.tsx            # Authentication forms (localized)
├── theme-switcher.tsx    # Dark/light mode toggle
├── language-switcher.tsx # Language selection dropdown
└── home-navigation.tsx   # Navigation component

i18n/
├── messages/              # Translation files
│   ├── fr/               # French translations (default)
│   ├── en/               # English translations  
│   └── es/               # Spanish translations
│       ├── auth/         # Authentication-specific
│       ├── common/       # Shared UI elements
│       ├── customs/      # Domain-specific (FDI, RFCV)
│       ├── home/         # Homepage content
│       ├── language/     # Language switcher
│       ├── metadata/     # App metadata
│       └── navigation/   # Navigation labels
├── routing.ts            # Route definitions with localized paths
├── request.ts            # Translation loading system
└── navigation.ts         # Localized navigation helpers

hooks/
└── useTranslation.ts     # Domain-specific translation hooks

lib/
├── supabase/             # Supabase client configurations
│   ├── client.ts         # Browser client
│   ├── middleware.ts     # Session management
│   └── server.ts         # Server client
└── utils.ts              # Utility functions and helpers

types/
└── i18n.types.ts         # TypeScript definitions for translations

supabase/
├── config.toml           # Local Supabase configuration
└── migrations/           # Database migrations
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
- `@/i18n` → `./i18n`
- `@/hooks` → `./hooks`
- `@/types` → `./types`

### shadcn/ui Integration

- **DO NOT modify** components in `components/ui/` directly
- Use shadcn/ui CLI to add new components: `npx shadcn-ui@latest add [component]`
- Configuration in `components.json` (New York style, CSS variables enabled)
- Custom styling through CSS variables in `globals.css`

### Internationalization Patterns

**Client Component Translation**:
```tsx
'use client';
import { useAuth } from '@/hooks/useTranslation';

export function LoginForm() {
  const t = useAuth();
  return <h1>{t('login.title')}</h1>;
}
```

**Server Component Translation**:
```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('auth');
  return <h1>{t('login.title')}</h1>;
}
```

**Localized Navigation**:
```tsx
import { Link } from '@/i18n/navigation';
// Automatically routes to localized paths
<Link href="/auth/login">Login</Link>
```

**Translation Hooks Available**:
- `useAuth()` - Authentication-related translations
- `useCommon()` - Common UI elements
- `useNavigation()` - Navigation labels
- `useCustoms()` - Domain-specific terms (FDI, RFCV)
- `useLanguage()` - Language switcher labels

## Key Implementation Details

### Hybrid Middleware Configuration

The middleware (`middleware.ts`) combines internationalization and authentication:

1. **First**: next-intl handles locale detection and URL rewriting
2. **Then**: Supabase middleware handles session management and route protection

**Protected Routes**: All routes except static files and public assets
**Redirect Flow**: Unauthenticated users → localized `/auth/login` (e.g., `/fr/auth/connexion`)

**Route Examples**:
- `/` → `/fr/` (default locale)
- `/auth/login` → `/fr/auth/connexion` (French), `/en/auth/login` (English)
- `/protected` → `/fr/protege`, `/en/protected`, `/es/protegido`

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

### Translation System

**Modular Architecture**: 36 translation files (12 per language) organized by functional domain
**Loading Strategy**: Dynamic imports with Promise.all() for parallel loading
**Fallback System**: Automatic fallback to default locale (French) on translation failures
**TypeScript Support**: Full type safety with generated types from translation structure

## Development Workflow

1. **Setup**: Install dependencies with `pnpm install`
2. **Environment**: Create `.env.local` with Supabase credentials
3. **Database**: Start local Supabase with `supabase start` (optional)
4. **Development**: Run `pnpm dev` to start development server
5. **Testing**: Test authentication flows and protected routes
6. **Building**: Use `pnpm build` to create production build

## Reference Documentation

**Core Documentation**:
- `REFERENCE.md` - Preserved examples from original Supabase template
- `docs/INTERNATIONALIZATION.md` - Comprehensive i18n implementation guide
- `DEVELOPMENT_GUIDE/` - Detailed development guidelines and best practices

**Key References**:
- Authentication component implementations
- Translation system architecture and usage patterns
- Component structure and naming conventions
- Project-specific business domain patterns (FDI, RFCV)

## Project Context

This is an enhanced version of the official Supabase Next.js starter template with comprehensive internationalization. The project has been cleaned of tutorial components while adding:

- **Full i18n Support**: Three-language system with localized routing
- **Enhanced UI**: 3D Globe component using COBE and Motion animations  
- **Modular Translations**: Domain-organized translation files for maintainability
- **Type Safety**: Complete TypeScript support for translations and routing
- **Production Ready**: Hybrid middleware, fallback systems, and comprehensive documentation

The project serves as a production-ready foundation for building multilingual Next.js applications with Supabase integration.