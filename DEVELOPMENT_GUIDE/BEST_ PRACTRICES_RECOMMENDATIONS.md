# Best Practices & Recommendations Guide

Note: This guide provides essential best practices for performance, security, and UI/UX. It should be updated regularly as new patterns and requirements emerge.

## 🚀 Performance Best Practices

Next.js App Router Optimization
    Use Server Components by default, Client Components only when necessary
    Implement proper loading states with loading.tsx files
    Use Suspense boundaries for granular loading control
    Leverage Next.js built-in optimizations (Image, Font, Script components)
    Use next/dynamic for non-critical components (ssr: false for client-only)

```typescript

// ✅ Good: Server Component for data fetching
export default async function UserProfilePage() {
  const userData = await getUserData(); // Server-side data fetching
  return <UserProfileClient data={userData} />;
}

// ✅ Good: Dynamic import for non-critical components
const NonCriticalChart = dynamic(() => import('./components/analytics-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Client-only for heavy interactive components
});

const ClientOnlyModal = dynamic(() => import('./components/interactive-modal'), {
  ssr: false // Avoid hydration issues for complex client components
});

// ❌ Bad: Client Component for static data
'use client';
export default function UserProfilePage() {
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    fetchUserData().then(setUserData);
  }, []);
}
```

## Component Performance

Use React.memo() for expensive components that receive stable props
Implement proper dependency arrays in useEffect, useMemo, and useCallback
Avoid inline objects and functions in JSX props
Use useCallback for functions passed to child components

```typescript

// ✅ Good: Memoized component with stable props
const ExpensiveDataVisualizationComponent = React.memo(({ chartData, onDataPointClick }: Props) => {
  const processedChartData = useMemo(() => processChartData(chartData), [chartData]);
  const handleDataPointClick = useCallback((dataPoint) => onDataPointClick(dataPoint), [onDataPointClick]);
  
  return <div>{/* component content */}</div>;
});

// ❌ Bad: Inline objects and functions
function ParentComponent() {
  return (
    <ExpensiveDataVisualizationComponent
      chartData={userData}
      config={{ theme: 'dark' }} // New object every render
      onDataPointClick={(item) => handleAction(item)} // New function every render
    />
  );
}
```

## Bundle Optimization

Use dynamic imports for heavy components and libraries
Implement code splitting at route and component level
Bundle analyze regularly with @next/bundle-analyzer
Tree-shake unused library exports

```typescript

// ✅ Good: Dynamic import for heavy components
const HeavyChartVisualizationComponent = dynamic(() => import('./components/heavy-chart-visualization'), {
  loading: () => <ChartLoadingSkeleton />,
  ssr: false
});

// ✅ Good: Specific imports to enable tree-shaking
import { formatDateToUserLocale } from '@/lib/date-formatting-utils';
import { Button } from '@/components/ui/button';

// ❌ Bad: Full library imports
import *as utils from '@/lib/utils';
import* as UI from '@/components/ui';
```

## 🔒 Security Best Practices

Authentication & Authorization
Always validate user permissions on server-side
Use Supabase RLS (Row Level Security) policies
Implement proper session management
Never trust client-side data

```typescript

// ✅ Good: Server-side permission check with descriptive function name
export async function getUserDataWithPermissionValidation(requestedUserId: string) {
  const { data: authenticatedUser } = await supabase.auth.getUser();
  if (!authenticatedUser || authenticatedUser.id !== requestedUserId) {
    throw new Error('Unauthorized access to user data');
  }
  // Fetch data with RLS protection
  return supabase.from('users').select('*').eq('id', requestedUserId).single();
}

// ❌ Bad: Client-side only check
function UserProfile({ userId }: Props) {
  const { user } = useAuth();
  if (user.id !== userId) return <div>Unauthorized</div>; // Can be bypassed
}
```

## Data Validation

Validate all inputs on both client and server side
Use Zod schemas for consistent validation
Sanitize user inputs to prevent XSS
Implement rate limiting for API routes

```typescript

// ✅ Good: Comprehensive validation with descriptive schema
import { z } from 'zod';

const UserProfileUpdateValidationSchema = z.object({
  displayName: z.string().min(2).max(50),
  emailAddress: z.string().email(),
  userRole: z.enum(['admin', 'user', 'guest'])
});

export async function updateUserProfileWithValidation(formData: FormData) {
  // Server-side validation
  const validatedUserData = UserProfileUpdateValidationSchema.parse({
    displayName: formData.get('displayName'),
    emailAddress: formData.get('emailAddress'),
    userRole: formData.get('userRole')
  });
  
  // Update with validated data
  return supabase.from('users').update(validatedUserData);
}
```

## Environment & Configuration

Never expose sensitive data in client-side code
Use environment variables for all configurations
Implement proper CORS policies
Use HTTPS in production

```typescript

// ✅ Good: Server-side environment variables with descriptive names
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Server only
const databaseConnectionString = process.env.DATABASE_URL; // Server only

// ❌ Bad: Sensitive data in client code
const apiKey = 'sk-1234567890abcdef'; // Exposed to client

🎯 State Management Best Practices
Zustand Usage - UI State Only (Minimized)

    Minimize Zustand usage - UI state only
    Prefer URL state with NUQS and Server Components
    Keep stores focused and small
    Use selectors to prevent unnecessary re-renders
```

```typescript

// ✅ Good: Minimal Zustand for UI-only state
interface UIOnlyStore {
  sidebarIsExpanded: boolean;
  currentThemeMode: 'light' | 'dark';
  toggleSidebarExpansion: () => void;
  switchThemeMode: () => void;
}

export const useUIOnlyStore = create<UIOnlyStore>((set) => ({
  sidebarIsExpanded: false,
  currentThemeMode: 'light',
  toggleSidebarExpansion: () => set((state) => ({
    sidebarIsExpanded: !state.sidebarIsExpanded
  })),
  switchThemeMode: () => set((state) => ({
    currentThemeMode: state.currentThemeMode === 'light' ? 'dark' : 'light'
  }))
}));

// ✅ PREFERRED: Use NUQS for URL state management
import { useQueryState } from 'nuqs';

function ProductListWithUrlState() {
  const [selectedProductCategory, setSelectedProductCategory] = useQueryState('category');
  const [currentPageNumber, setCurrentPageNumber] = useQueryState('page');
  const [searchQueryText, setSearchQueryText] = useQueryState('search');

  // Server Component will receive these as searchParams
  return <ProductListServerComponent
    category={selectedProductCategory}
    page={currentPageNumber}
    search={searchQueryText}
  />;
}

// ❌ Bad: Using Zustand for data that should be in URL or server state
interface BadStore {
  usersList: User[];
  selectedUserId: string;
  searchQuery: string; // Should be in URL
  fetchUsers: () => void; // Should be server state
}
```

## 🏷️ Naming Conventions - Always Use Descriptive Names

Functions and Variables
Always use descriptive names that explain purpose and context
Avoid abbreviations and single-letter variables
Include units and context when relevant

```typescript

// ✅ Good: Descriptive function and variable names
const calculateMonthlySubscriptionFeeWithTax = (basePrice: number, taxRate: number) => {
  const monthlySubscriptionFee = basePrice;
  const applicableTaxAmount = monthlySubscriptionFee * taxRate;
  const totalMonthlyFeeIncludingTax = monthlySubscriptionFee + applicableTaxAmount;
  return totalMonthlyFeeIncludingTax;
};

const handleUserProfileFormSubmission = async (formData: FormData) => {
  const userProfileUpdateData = extractUserDataFromForm(formData);
  await updateUserProfileInDatabase(userProfileUpdateData);
  showSuccessNotificationToUser('Profile updated successfully');
};

// ❌ Bad: Unclear and abbreviated names
const calc = (p: number, t: number) => {
  const f = p;
  const tx = f * t;
  const tot = f + tx;
  return tot;
};

const handle = async (data: FormData) => {
  const d = extract(data);
  await update(d);
  show('Updated');
};
```

## Components and Hooks

Component names should describe what they render and their purpose
Hook names should describe what functionality they provide

```typescript

// ✅ Good: Descriptive component and hook names
function UserProfileEditableFormWithValidation({ userId }: Props) { }
function InvoiceGenerationWizardStepTwo({ invoiceData }: Props) { }
function ResponsiveNavigationMenuWithUserActions() { }

function useUserAuthenticationStateWithPermissions() { }
function useInvoiceCalculationWithTaxRates() { }
function useFormValidationWithRealTimeErrorDisplay() { }

// ❌ Bad: Generic and unclear names
function Form({ data }: Props) { }
function Step({ info }: Props) { }
function Nav() { }

function useAuth() { }
function useCalc() { }
function useForm() { }
```

## 🎨 UI/UX Best Practices

Accessibility (A11Y)
Implement proper ARIA labels and roles
Ensure keyboard navigation works for all interactive elements
Maintain proper color contrast ratios
Use semantic HTML elements

```typescript

// ✅ Good: Accessible modal component with descriptive naming
function UserProfileEditModal({ isModalOpen, onModalClose, userProfileTitle, children }: Props) {
  return (
    <Dialog open={isModalOpen} onOpenChange={onModalClose}>
      <DialogContent
        role="dialog"
        aria-labelledby="user-profile-modal-title"
        aria-describedby="user-profile-modal-description"
      >
        <DialogHeader>
          <DialogTitle id="user-profile-modal-title">{userProfileTitle}</DialogTitle>
        </DialogHeader>
        <div id="user-profile-modal-description">{children}</div>
        <DialogClose asChild>
          <Button variant="outline" aria-label="Close user profile modal">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
```

## Loading States & Feedback

Always provide loading states for async operations
Use skeleton loaders for better perceived performance
Implement proper error boundaries
Show success/error feedback for user actions

```typescript

// ✅ Good: Comprehensive loading states with descriptive naming
function UserListWithLoadingStatesAndErrorHandling() {
  const {
    data: userListData,
    isLoading: isUserListLoading,
    error: userListFetchError
  } = useUsersListWithPagination();

  if (isUserListLoading) return <UserListLoadingSkeleton />;
  if (userListFetchError) return <ErrorMessageWithRetryButton error={userListFetchError} retry={() => refetchUsersList()} />;
  if (!userListData?.length) return <EmptyUserListState />;

  return (
    <div>
      {userListData.map(individualUser =>
        <UserCardWithActions key={individualUser.id} user={individualUser} />
      )}
    </div>
  );
}
```

## Form Design & Validation

Provide real-time validation feedback
Use clear and helpful error messages
Implement proper field focus management
Show form submission states

```typescript

// ✅ Good: Form with proper validation feedback and descriptive naming
function UserRegistrationFormWithValidation() {
  const {
    register,
    handleSubmit,
    formState: { errors: formValidationErrors, isSubmitting: isFormSubmissionInProgress }
  } = useForm({
    resolver: zodResolver(UserRegistrationValidationSchema)
  });

  const handleUserRegistrationFormSubmission = async (formData: UserRegistrationData) => {
    await submitUserRegistrationToServer(formData);
    showSuccessNotificationToUser('Registration completed successfully');
  };

  return (
    <form onSubmit={handleSubmit(handleUserRegistrationFormSubmission)}>
      <div>
        <Label htmlFor="user-email-address">Email Address</Label>
        <Input
          id="user-email-address"
          type="email"
          {...register('emailAddress')}
          aria-invalid={!!formValidationErrors.emailAddress}
          aria-describedby={formValidationErrors.emailAddress ? 'email-validation-error' : undefined}
        />
        {formValidationErrors.emailAddress && (
          <span id="email-validation-error" className="text-destructive">
            {formValidationErrors.emailAddress.message}
          </span>
        )}
      </div>

      <Button type="submit" disabled={isFormSubmissionInProgress}>
        {isFormSubmissionInProgress ? 'Creating Account...' : 'Create User Account'}
      </Button>
    </form>
  );
}
```

## Responsive Design

Design mobile-first with progressive enhancement
Use Tailwind's responsive utilities consistently
Test on multiple device sizes
Ensure touch targets are at least 44px

```typescript

// ✅ Good: Responsive component design with descriptive naming
function ResponsiveUserProfileCard({ userProfileTitle, userProfileContent }: Props) {
  return (
    <Card className="w-full sm:w-auto sm:min-w-[300px] lg:max-w-[400px]">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl">
          {userProfileTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <p className="text-sm sm:text-base">{userProfileContent}</p>
      </CardContent>
    </Card>
  );
}
```

## Internationalization (i18n)

Always use translation keys, never hardcoded strings
Implement proper pluralization
Consider RTL support for international markets
Use appropriate date/number formatting per locale

```typescript

// ✅ Good: Proper i18n implementation with descriptive naming
function WelcomeMessageWithUserCount({ activeUserCount }: Props) {
  const translationFunction = useTranslations('welcomePage');
  
  return (
    <div>
      <h1>{translationFunction('pageTitle')}</h1>
      <p>{translationFunction('activeUserCount', { count: activeUserCount })}</p>
      <time>{translationFunction('lastLoginTime', { date: new Date() })}</time>
    </div>
  );
}

// ❌ Bad: Hardcoded strings
function WelcomeMessage({ userCount }: Props) {
  return (
    <div>
      <h1>Welcome!</h1>
      <p>{userCount} users online</p>
    </div>
  );
}
```

## 📱 Mobile-First Considerations

Touch Interactions
Ensure minimum 44px touch targets
Implement proper touch feedback
Support swipe gestures where appropriate
Consider thumb-friendly navigation patterns

## Performance on Mobile

Optimize images with proper formats (WebP, AVIF)
Minimize JavaScript bundle size
Use service workers for offline functionality
Implement proper caching strategies

## ⚡ Key Principles Summary

Performance First: Optimize for Core Web Vitals
Security by Design: Validate everything, trust nothing
Accessible by Default: Build for all users
Mobile-First: Design for smallest screens first
Type Safety: Leverage TypeScript everywhere
User Feedback: Always inform users of system state
Progressive Enhancement: Start with basics, enhance with JavaScript
Maintainable Code: Follow SOLID principles and clean architecture
Descriptive Naming: Always use clear, descriptive names for everything
State Management: Minimize Zustand (UI only), prefer URL state with NUQS
Dynamic Loading: Use next/dynamic for non-critical components
