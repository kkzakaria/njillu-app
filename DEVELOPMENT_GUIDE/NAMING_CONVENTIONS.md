# Naming Convention

1. Pages and Routing (App Router)

    Route folders: kebab-case
        Examples: app/about-us/page.tsx, app/user-profile/page.tsx
    Next.js special files: lowercase
        Examples: page.tsx, layout.tsx, loading.tsx, error.tsx

2. React Components

    File names: kebab-case
        Examples: user-card.tsx, navigation-menu.tsx, product-list.tsx
    Component names: PascalCase
        Examples: export default function UserCard() { ... }
        Examples: export const NavigationMenu = () => { ... }

3. Custom Hooks

    Files: camelCase with "use" prefix
        Examples: useLocalStorage.ts, useApiCall.ts, useUserData.ts
    Functions: camelCase with "use" prefix
        Example: export const useLocalStorage = () => { ... }

4. Utilities and Helpers

    Files: camelCase
        Examples: formatDate.ts, apiClient.ts, validationSchemas.ts
    Functions: camelCase
        Examples: export const formatDate = () => { ... }
        Examples: export const validateEmail = () => { ... }

5. Types and Interfaces

    Files: camelCase with ".types" suffix
        Examples: user.types.ts, api.types.ts, product.types.ts
    Types: PascalCase
        Examples: type UserRole = 'admin' | 'user' | 'guest'
        Examples: type ApiStatus = 'loading' | 'success' | 'error'

6. Variables and Constants

    camelCase for all variables
    SCREAMING_SNAKE_CASE for constants and environment variables

7. Functions and Methods

    camelCase for all functions
        Examples: const handleSubmit = () => { ... }
        Examples: const fetchUserData = async () => { ... }
    "handle" prefix + action in camelCase for all event handlers
        Examples: const handleClick = () => { ... }
        Examples: const handleFormSubmit = () => { ... }
        Examples: const handleInputChange = () => { ... }

8. CSS Classes and Styles

    CSS Modules: same name as component + ".module.css"
        Examples: user-card.module.css, navigation.module.css
    Classes: camelCase
        Examples: .userCard { ... }
        Examples: .navigationMenu { ... }
        Examples: .isActive { ... }
    Tailwind CSS
        Use standard Tailwind utility classes
        For reusable components, create custom classes in kebab-case
    Styled components: PascalCase with descriptive prefix

9. Assets and Resources

    Images: kebab-case with extension
        Examples: user-avatar.png, company-logo.svg, hero-background.jpg
    Icons: kebab-case with "icon-" prefix
        Examples: icon-search.svg, icon-user.svg, icon-arrow-right.svg
