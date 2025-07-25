# Component Structure (SOLID Principles)

Note: This component structure follows SOLID principles and applies ONLY to custom components. Library components (Shadcn UI, etc.) must respect their original library structure and should NEVER be modified directly. Library components can only be wrapped in custom components if customization is needed.

components/example-component/
├── index.ts                               # Barrel export file
├── example-component.tsx                  # Main component implementation
├── components/                            # Sub-components (if needed)
│   ├── example-component-header.tsx       # Header sub-component
│   ├── example-component-body.tsx         # Body sub-component
│   └── example-component-footer.tsx       # Footer sub-component
├── hooks/                                 # Component-specific hooks
│   ├── use-example-component-state.ts     # Local state management hook
│   ├── use-example-component-logic.ts     # Business logic hook
│   └── use-example-component-effects.ts   # Side effects hook
├── lib/                                   # Component-specific utilities
│   ├── example-component-utils.ts         # Utility functions
│   ├── example-component-validators.ts    # Validation logic
│   └── example-component-constants.ts     # Component constants
├── types/                                 # Component-specific types
│   └── example-component.types.ts         # Type definitions and interfaces
├── styles/                                # Component-specific styles (if needed)
│   └── example-component.module.css       # CSS Module styles
└── __tests__/                             # Component tests
    ├── example-component.test.tsx         # Main component tests
    ├── hooks/                             # Hook tests
    │   └── use-example-component-state.test.ts
    └── utils/                             # Utility tests
        └── example-component-utils.test.ts

Component Types and Rules:

Custom Components ✅

Follow the SOLID structure above
Can be modified and extended freely
Should follow our naming conventions
Examples: UserProfileCard, DataTable, CustomModal

Library Components ❌ (Direct Modification)

Shadcn UI: Keep original structure from components/ui/
Third-party libraries: Respect original component structure
NEVER modify library component code directly
Examples: Button, Dialog, Input from Shadcn UI

Wrapped Library Components ✅ (Recommended Approach)
When customization of library components is needed:

components/custom-button/
├── index.ts                               # Barrel export
├── custom-button.tsx                      # Wrapper component
├── hooks/                                 # Custom logic hooks
│   └── use-custom-button-logic.ts         # Button-specific logic
├── types/                                 # Extended types
│   └── custom-button.types.ts             # Custom props interface
└── __tests__/                             # Tests for custom logic
    └── custom-button.test.tsx

SOLID Principles Applied:
S - Single Responsibility Principle

Main component: Handles composition and coordination only
Sub-components: Each handles a specific UI concern
Hooks: Separated by responsibility (state, logic, effects)
Utils: Pure functions with specific purposes

O - Open/Closed Principle

Component accepts props interface for extension
Hooks can be composed and extended
Utilities are composable functions
Sub-components can be replaced or extended

L - Liskov Substitution Principle

Props interface is consistent and predictable
Hooks follow consistent return patterns
Sub-components follow same interface patterns

I - Interface Segregation Principle

Props are specific to component needs
Hooks expose only relevant functionality
Types are focused and specific

D - Dependency Inversion Principle

Component depends on props interface, not implementations
Business logic is abstracted in hooks
External dependencies are injected through props

Wrapping Library Components Example:

```typescript
// components/custom-button/custom-button.tsx
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { useCustomButtonLogic } from './hooks/use-custom-button-logic';
import type { CustomButtonProps } from './types/custom-button.types';

export function CustomButton(props: CustomButtonProps) {
  const { buttonProps, analytics } = useCustomButtonLogic(props);

  return (
    <Button
      {...buttonProps}
      onClick={(e) => {
        analytics.track('button_click');
        buttonProps.onClick?.(e);
      }}
    >
      {props.children}
    </Button>
  );
}

// types/custom-button.types.ts
import type { ButtonProps } from '@/components/ui/button';

export interface CustomButtonProps extends ButtonProps {
  trackingId?: string;
  analyticsEvent?: string;
}
```

Directory Structure Overview:

components/
├── ui/                                    # Shadcn UI components (DO NOT MODIFY)
│   ├── button.tsx                         # Original Shadcn Button
│   ├── dialog.tsx                         # Original Shadcn Dialog
│   └── input.tsx                          # Original Shadcn Input
├── custom-button/                         # Custom wrapper (SOLID structure)
│   ├── index.ts
│   ├── custom-button.tsx
│   └── ...
└── user-profile-card/                     # Pure custom component (SOLID structure)
    ├── index.ts
    ├── user-profile-card.tsx
    └── ...

Benefits:

Library Integrity: Maintains library components in their original state
Upgrade Safety: Library updates won't break custom modifications
Maintainability: Clear separation between library and custom code
Testability: Custom logic can be tested independently
Reusability: Wrapped components can be reused with custom behavior
Type Safety: Extended interfaces provide better TypeScript support

Rules Summary:

✅ DO: Create custom components with SOLID structure
✅ DO: Wrap library components when customization is needed
✅ DO: Extend library component props interfaces
❌ DON'T: Modify library component source code directly
❌ DON'T: Change library component file structure
❌ DON'T: Add custom logic directly to library components
