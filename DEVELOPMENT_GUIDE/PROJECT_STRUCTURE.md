# Project Structure

Note: This is the base project structure and is not fixed. It may evolve as the project develops and should be updated regularly to reflect any changes and improvements.

├─ app/                                    # App Router (Next.js 15.4)
│   └─ [locale]/                           # Internationalized routes (next-intl)
│       ├── (auth)/                        # Route group for authentication
│       │   ├── login/                     # Login page route
│       │   ├── forgot-password/           # Password reset request route
│       │   ├── otp/                       # OTP verification for password reset route
│       │   └── update-password/           # Password update route
│       ├── (main)/                        # Protected route group for main application
│       │   ├── (documentation)/           # Route group for documentation management
│       │   │   ├── folders/               # Folder management route
│       │   │   ├── containers/            # Container management route
│       │   │   ├── edit-bill-fdi/         # FDI invoice editing route
│       │   │   ├── fdi/                   # FDI management route
│       │   │   ├── rfcv/                  # RFCV management route
│       │   │   └── declaration/           # Customs declaration management route
│       │   ├── (exploitation)/            # Route group for operations management
│       │   │   ├── shipping-company-submission/  # Shipping company invoice submission route
│       │   │   └── payment-invoice/       # Payment invoice management route
│       │   ├── (invoicing)/               # Route group for client invoicing
│       │   │   ├── client-invoice/        # Client invoice management route
│       │   │   └── invoice-history/       # Invoice history route
│       │   ├── request-for-funds/         # Fund request management route
│       │   ├── user-profile/              # User profile management route
│       │   ├── users-management/          # User management route
│       │   └── settings/                  # Application settings route
│       ├── (error)/                       # Route group for error pages
│       │   ├── not-found/                 # 404 error page route
│       │   └── unauthorized/              # Unauthorized access warning route
│       └── page.tsx                       # Homepage route
├─ components/                             # Reusable generic components (Shadcn UI + custom)
├─ hooks/                                  # Reusable generic hooks (custom React hooks)
├─ i18n/                                   # Internationalization configuration and messages (next-intl)
├─ lib/                                    # Reusable generic utilities (TypeScript utilities)
├─ public/                                 # Static assets and resources (images, icons)
├─ supabase/                               # Supabase functions and migrations (database schema)
├─ types/                                  # TypeScript type definitions for the application
└─ stores/                                 # Zustand stores for global UI state management

Key Directory Roles:

app/[locale]/: Next.js App Router with internationalization support via next-intl
(auth)/: Authentication-related pages using Supabase Auth
(main)/: Protected application routes requiring authentication
components/: Reusable UI components built with Shadcn UI and Tailwind CSS
hooks/: Custom React hooks for business logic and data fetching
i18n/: Translation files and next-intl configuration
lib/: Utility functions, Supabase client configuration, and helper functions
stores/: Zustand stores for managing global UI state
supabase/: Database migrations, functions, and Supabase-specific configurations
types/: TypeScript interfaces and type definitions for the entire application
