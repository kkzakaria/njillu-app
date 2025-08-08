# 🚀 Production-Ready Responsive List-Detail Layout System

Enterprise-grade Next.js application with comprehensive responsive list-detail layout system, ready for production deployment.

## ✨ Features

### 🎯 Core Functionality
- **Responsive List-Detail Layout** - Mobile-first responsive design system
- **Multi-Entity Support** - Bills of Lading, Folders, Container Arrivals
- **Advanced Search & Filtering** - Real-time search with type-ahead
- **Internationalization** - French, English, Spanish with localized URLs
- **Authentication System** - Secure Supabase auth with session management
- **Real-time Updates** - Live data synchronization across components

### 🏗️ Technical Architecture
- **Next.js 15** - Latest App Router with React 19
- **TypeScript** - Full type safety with modular type system
- **Supabase** - PostgreSQL database with Row Level Security
- **Tailwind CSS** - Utility-first styling with shadcn/ui components
- **Responsive Design** - Mobile (768px), Tablet (1024px), Desktop (1280px+)

### 📊 Production Features
- **Performance Monitoring** - Core Web Vitals tracking
- **Error Tracking** - Sentry integration for production
- **Security Hardening** - Comprehensive security headers and policies
- **Automated Testing** - Unit, Integration, E2E, and Accessibility tests
- **CI/CD Pipeline** - Automated deployment with quality gates

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase project

### Installation

```bash
# Clone repository
git clone <repository-url>
cd njillu-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
njillu-app/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   ├── api/                      # API routes and health checks
│   └── globals.css               # Global styles and CSS variables
├── components/                   # React components
│   ├── list-detail/             # Core list-detail layout system
│   ├── ui/                      # shadcn/ui components (DO NOT MODIFY)
│   └── [various].tsx            # Feature components
├── lib/                         # Utilities and configurations
│   ├── auth/                    # Authentication security system
│   ├── supabase/                # Supabase client configurations
│   └── utils.ts                 # Utility functions
├── types/                       # Modular TypeScript type system
│   ├── bl/                      # Bills of Lading types
│   ├── folders/                 # Folder management types
│   ├── containers/              # Container arrival types
│   └── shared/                  # Common utility types
├── i18n/                        # Internationalization
│   ├── messages/                # Translation files (fr/en/es)
│   └── [config files]          # i18n configuration
├── docs/                        # Documentation
│   ├── DEPLOYMENT_GUIDE.md      # Complete deployment guide
│   ├── PERFORMANCE_MONITORING.md # Performance monitoring setup
│   └── [various].md             # Technical documentation
├── .github/                     # GitHub Actions workflows
│   └── workflows/               # CI/CD pipeline configuration
└── [config files]              # Various configuration files
```

## 🔧 Available Scripts

### Development
```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
```

### Testing
```bash
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:integration # Run integration tests
pnpm test:e2e         # Run E2E tests with Playwright
pnpm test:coverage    # Generate coverage report
```

### Production
```bash
pnpm build:production    # Production build with optimizations
pnpm build:analyze      # Build with bundle analysis
pnpm health-check       # Check application health
pnpm deploy:production  # Deploy to production (Vercel)
```

## 🌐 Internationalization

The application supports three languages with localized URLs:

- **French (default)**: `/fr/auth/connexion`
- **English**: `/en/auth/login`  
- **Spanish**: `/es/auth/iniciar-sesion`

### Translation System
- **Modular Architecture** - Domain-organized translation files
- **Type-Safe** - Full TypeScript support for translations
- **Hook-Based API** - `useAuth()`, `useCommon()`, `useNavigation()`
- **Server & Client** - Support for both component types

## 🏛️ Architecture Highlights

### Responsive List-Detail System
- **Mobile-First Design** - Optimized for all screen sizes
- **Virtual Scrolling** - Handle large datasets efficiently
- **Advanced Filtering** - Real-time search and filter capabilities
- **Accessibility** - WCAG 2.1 AA compliant
- **Performance** - Lazy loading and optimized rendering

### Security Architecture
- **Defense in Depth** - Multiple security layers
- **Row Level Security** - Database-level access control
- **Cryptographic Tokens** - SHA-256 token generation
- **Flow Guards** - Multi-layered access control
- **Security Headers** - Comprehensive HTTP security headers

### Type System (v2.0)
- **Modular Design** - Domain-specific type modules
- **Tree-Shakeable** - Import only what you need
- **Hierarchical** - Organized by business domains
- **Migration Guide** - Smooth transition from v1.0

## 🚀 Production Deployment

### Automated Deployment (Recommended)
The application includes a comprehensive CI/CD pipeline that automatically:

1. **Quality Gates** - Type checking, linting, testing, security scanning
2. **Preview Deployments** - Automatic preview URLs for pull requests
3. **Production Deployment** - Automated deployment to main branch
4. **Health Monitoring** - Post-deployment health checks and performance monitoring

### Manual Deployment
```bash
# Set up environment variables in Vercel dashboard
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Deploy to production
vercel --prod

# Verify deployment
pnpm health-check
```

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 📊 Performance

### Performance Targets
| Metric | Target | Monitoring |
|--------|--------|------------|
| First Contentful Paint | < 1.5s | Lighthouse CI |
| Largest Contentful Paint | < 2.5s | Core Web Vitals |
| Cumulative Layout Shift | < 0.1 | Real User Monitoring |
| Bundle Size | < 1MB | Webpack Bundle Analyzer |
| API Response Time | < 500ms | Health Check API |

### Optimization Features
- **Bundle Splitting** - Optimized code splitting
- **Image Optimization** - Next.js Image with WebP/AVIF
- **Caching Strategy** - Multi-level caching (CDN, API, Database)
- **Performance Monitoring** - Real-time metrics and alerts

## 🔒 Security

### Security Features
- **Authentication** - Supabase Auth with session management
- **Authorization** - Row Level Security (RLS) policies
- **Input Validation** - Comprehensive input sanitization
- **Security Headers** - CSP, HSTS, X-Frame-Options
- **Vulnerability Scanning** - Automated dependency scanning
- **Secret Management** - Environment-based configuration

### Security Compliance
- **OWASP Top 10** - Protection against common vulnerabilities
- **GDPR Ready** - Privacy-by-design architecture
- **SOC 2** - Security framework compliance
- **Penetration Testing** - Regular security assessments

## 🧪 Testing

The application includes comprehensive testing:

### Test Coverage
- **Unit Tests** - Component and utility function testing
- **Integration Tests** - API and database integration
- **E2E Tests** - Cross-browser user workflow testing
- **Accessibility Tests** - WCAG 2.1 AA compliance validation
- **Performance Tests** - Core Web Vitals and load testing

### Testing Tools
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - E2E and cross-browser testing
- **Lighthouse CI** - Performance and accessibility auditing

## 📚 Documentation

Comprehensive documentation is available:

- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Complete production deployment guide
- **[PERFORMANCE_MONITORING.md](docs/PERFORMANCE_MONITORING.md)** - Performance monitoring setup
- **[SECURITY.md](SECURITY.md)** - Security policy and best practices
- **[INTERNATIONALIZATION.md](docs/INTERNATIONALIZATION.md)** - i18n implementation details
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database structure and patterns

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `develop`
2. Make changes with comprehensive tests
3. Run quality checks: `pnpm lint && pnpm type-check && pnpm test`
4. Create pull request with detailed description
5. Automated testing and review process
6. Merge to `develop`, then `main` for production

### Code Standards
- **TypeScript** - Strict mode enabled, no `any` types
- **ESLint** - Configured for Next.js and React best practices
- **Prettier** - Consistent code formatting
- **Conventional Commits** - Semantic commit messages
- **Test Coverage** - Minimum 80% coverage required

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Security**: See [SECURITY.md](SECURITY.md) for reporting vulnerabilities

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

**Built with ❤️ using Next.js, TypeScript, Supabase, and modern web technologies.**
