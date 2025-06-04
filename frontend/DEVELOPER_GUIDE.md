# Frontend Developer Guide

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Component Development](#component-development)
- [Code Style & Standards](#code-style--standards)
- [Build & Deployment](#build--deployment)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## 🛠️ Technology Stack

### Core Framework

- **React**: Modern React with hooks and concurrent features
- **TypeScript**: Static typing for better development experience
- **Vite**: Fast build tool and development server (migrated from CRA)

### State Management

- **Redux Toolkit**: Modern Redux with simplified setup
- **React Redux**: React bindings for Redux

### UI Framework & Styling

- **Semantic UI React**: Component library for consistent UI
- **Semantic UI CSS**: Base styling framework
- **Sass**: CSS preprocessor for advanced styling
- **CSS Modules**: Scoped styling support

### Routing & Navigation

- **React Router DOM**: Client-side routing
- **React Router Last Location**: Location history tracking

### Forms & Validation

- **React Hook Form**: Performant forms with easy validation
- **Hookform Resolvers**: Integration with validation schemas
- **Yup**: Schema validation

### HTTP & Data Fetching

- **Axios**: HTTP client for API requests
- **Axios Hooks**: React hooks for Axios integration

### UI Components & Libraries

- **React Big Calendar**: Calendar component for events
- **React Beautiful DnD**: Drag and drop functionality
- **React Base Table**: High-performance table component
- **React Dropzone**: File upload with drag & drop
- **React Easy Crop**: Image cropping functionality
- **React Player**: Media player component
- **React Toastify**: Toast notifications
- **React Modal Hook**: Modal management

### Utilities

- **Lodash**: Utility functions
- **Date-fns**: Date manipulation library
- **Change Case**: String case conversion
- **Fast Deep Equal**: Deep equality checks
- **Query String**: URL query string parsing

### Development Tools

- **ESLint**: Code linting with multiple configurations
- **Prettier**: Code formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Vitest**: Testing framework
- **Source Map Explorer**: Bundle analysis

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── favicon.ico            # Site favicon
│   ├── manifest.json          # PWA manifest
│   ├── robots.txt             # Search engine crawling rules
│   └── treeckle-logo.png      # App logo
├── src/                       # Source code
│   ├── app.tsx                # Main app component
│   ├── index.tsx              # Application entry point
│   ├── configs.ts             # Environment configuration
│   ├── react-app-env.d.ts     # React type definitions
│   ├── _base.scss             # Global base styles
│   ├── index.scss             # Global styles
│   ├── app.module.scss        # App component styles
│   ├── assets/                # Static assets (images, icons)
│   │   ├── images/            # Image files
│   │   └── icons/             # Icon files
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Generic components
│   │   │   ├── Button/        # Custom button components
│   │   │   ├── Modal/         # Modal components
│   │   │   ├── Form/          # Form components
│   │   │   ├── Table/         # Table components
│   │   │   └── Layout/        # Layout components
│   │   ├── auth/              # Authentication components
│   │   ├── booking/           # Booking-related components
│   │   ├── event/             # Event-related components
│   │   ├── venue/             # Venue-related components
│   │   └── user/              # User-related components
│   ├── pages/                 # Page components (route components)
│   │   ├── AuthPage/          # Authentication page
│   │   ├── DashboardPage/     # Main dashboard
│   │   ├── BookingPage/       # Booking management
│   │   ├── EventPage/         # Event management
│   │   ├── VenuePage/         # Venue management
│   │   ├── ProfilePage/       # User profile
│   │   └── AdminPage/         # Admin panel
│   ├── redux/                 # Redux store setup
│   │   ├── store.ts           # Store configuration
│   │   ├── slices/            # Redux Toolkit slices
│   │   │   ├── authSlice.ts   # Authentication state
│   │   │   ├── bookingSlice.ts # Booking state
│   │   │   ├── eventSlice.ts  # Event state
│   │   │   ├── venueSlice.ts  # Venue state
│   │   │   └── userSlice.ts   # User state
│   │   └── middleware/        # Custom middleware
│   ├── routes/                # Routing configuration
│   │   ├── AppRouter.tsx      # Main router component
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   └── routeConstants.ts  # Route path constants
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx    # Authentication context
│   │   └── ThemeContext.tsx   # Theme context
│   ├── custom-hooks/          # Custom React hooks
│   │   ├── useApi.ts          # API request hook
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useLocalStorage.ts # Local storage hook
│   │   └── useDebounce.ts     # Debouncing hook
│   ├── managers/              # API managers
│   │   ├── AuthManager.ts     # Authentication API calls
│   │   ├── BookingManager.ts  # Booking API calls
│   │   ├── EventManager.ts    # Event API calls
│   │   ├── VenueManager.ts    # Venue API calls
│   │   └── UserManager.ts     # User API calls
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.ts            # Authentication types
│   │   ├── booking.ts         # Booking types
│   │   ├── event.ts           # Event types
│   │   ├── venue.ts           # Venue types
│   │   ├── user.ts            # User types
│   │   └── api.ts             # API response types
│   ├── constants/             # Application constants
│   │   ├── apiConstants.ts    # API endpoints
│   │   ├── appConstants.ts    # General app constants
│   │   ├── routeConstants.ts  # Route constants
│   │   └── uiConstants.ts     # UI-related constants
│   └── utils/                 # Utility functions
│       ├── dateUtils.ts       # Date manipulation utilities
│       ├── formatUtils.ts     # Formatting utilities
│       ├── validationUtils.ts # Validation utilities
│       ├── storageUtils.ts    # Local storage utilities
│       └── apiUtils.ts        # API utilities
├── component-creator.js      # Component scaffolding script
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── eslint.config.mjs         # ESLint configuration
├── build-prod.sh             # Production build script
├── build.sh                  # Development build script
├── Dockerfile                # Docker configuration
└── nginx/                    # Nginx configuration for production
    └── nginx.conf
```

## 🚀 Development Setup

### 1. Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) 16+ (LTS recommended)
- [Yarn](https://yarnpkg.com/) (required, npm is not supported)
- [Git](https://git-scm.com/)

### 2. Clone and Navigate

```bash
git clone https://github.com/CAPTxTreeckle/Treeckle-3.0.git
cd Treeckle-3.0/frontend
```

### 3. Install Dependencies

```bash
# Install all dependencies (use yarn, not npm)
yarn install
```

### 4. Start Development Server

```bash
# Start development server
yarn dev

# Start with HTTPS (for OAuth testing)
yarn dev:https
```

The application will be available at `http://localhost:3000`

## 🔄 Development Workflow

### Available Scripts

```bash
# Development
yarn dev                   # Start development server
yarn dev:https             # Start with HTTPS

# Building
yarn build                 # Build for production
yarn build:analyze         # Build with bundle analysis

# Code Quality
yarn format                # Format code with Prettier
yarn lint                  # Run ESLint
yarn lint --fix            # Auto-fix ESLint issues

# Testing
yarn test                  # Run tests
yarn test:ui               # Run tests with UI

# Utilities
yarn create-component      # Create new component scaffolding
yarn serve                 # Preview production build
```

### Pre-commit Checks

Before building for production, the following checks run automatically:

1. **Prettier formatting**: `yarn format`
2. **ESLint linting**: `yarn lint --fix`
3. **TypeScript compilation**: Type checking

### Component Creation

Use the scaffolding script to create new components:

```bash
yarn create-component
```

This will prompt you for:

- Component name
- Component type (functional, class, etc.)
- Whether to include styles
- Whether to include tests

## 🧩 Component Development

### Component Architecture

Components follow a consistent structure:

```
ComponentName/
├── index.tsx              # Main component file
├── ComponentName.module.scss  # Component styles
├── types.ts               # Component-specific types
└── hooks.ts               # Component-specific hooks (if needed)
```

### Best Practices

1. **Use TypeScript interfaces** for all props
2. **Implement proper error boundaries** for complex components
3. **Use React.memo** for performance optimization when needed
4. **Follow the single responsibility principle**
5. **Use composition over inheritance**
6. **Implement proper loading and error states**

## 📏 Code Style & Standards

### Coding Standards

#### 1. File and Folder Naming

- Use **PascalCase** for component files and folders
- Use **camelCase** for utility files and hooks
- Use **kebab-case** for CSS/SCSS files

#### 2. Component Structure

```tsx
// ✅ Good component structure
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// Type imports
import { ComponentProps } from "./types";

// Styles
import styles from "./Component.module.scss";

// Constants
const COMPONENT_CONSTANTS = {
  DEFAULT_VALUE: "default",
} as const;

const Component: React.FC<ComponentProps> = ({ prop1, prop2, ...rest }) => {
  // State
  const [localState, setLocalState] = useState("");

  // Redux
  const dispatch = useDispatch();
  const globalState = useSelector((state) => state.feature);

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleAction = () => {
    // Handler logic
  };

  // Render helpers
  const renderContent = () => {
    // Render logic
  };

  return <div className={styles.component}>{renderContent()}</div>;
};

export default Component;
```

#### 3. Type Definitions

```tsx
// ✅ Good type definitions
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization: Organization;
  profileImage?: ProfileImage | null;
  createdAt: number;
  updatedAt: number;
}

export enum UserRole {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
  RESIDENT = "RESIDENT",
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
```

#### 4. Constants Organization

```tsx
// constants/appConstants.ts
export const APP_CONFIG = {
  NAME: "Treeckle",
  VERSION: "3.0.0",
  API_TIMEOUT: 10000,
} as const;

export const USER_ROLES = {
  ADMIN: "ADMIN",
  ORGANIZER: "ORGANIZER",
  RESIDENT: "RESIDENT",
} as const;

export const BOOKING_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
```

## 🚀 Build & Deployment

### Performance Optimization

#### Code Splitting

```tsx
// Lazy loading components
import { lazy, Suspense } from "react";

const BookingPage = lazy(() => import("../pages/BookingPage"));
const EventPage = lazy(() => import("../pages/EventPage"));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Switch>
      <Route path="/bookings" component={BookingPage} />
      <Route path="/events" component={EventPage} />
    </Switch>
  </Suspense>
);
```

## ⚡ Performance Optimization

### React Performance

#### 1. Memoization

```tsx
// Memoize expensive calculations
const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map((item) => expensiveCalculation(item));
  }, [data]);

  return <div>{processedData}</div>;
};

// Memoize callbacks
const OptimizedComponent = ({ onSave }) => {
  const handleSave = useCallback(
    (data) => {
      onSave(data);
    },
    [onSave],
  );

  return <ChildComponent onSave={handleSave} />;
};

// Memoize components
export default React.memo(Component);
```

#### 2. Virtual Scrolling

```tsx
// For large lists
import { FixedSizeList as List } from "react-window";

const VirtualizedList = ({ items }) => (
  <List height={600} itemCount={items.length} itemSize={50} itemData={items}>
    {({ index, style, data }) => (
      <div style={style}>
        <ItemComponent item={data[index]} />
      </div>
    )}
  </List>
);
```

#### 3. Image Optimization

```tsx
// Lazy loading images
import { useState } from "react";

const LazyImage = ({ src, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="image-container">
      {!loaded && <div className="image-placeholder" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? "block" : "none" }}
        {...props}
      />
    </div>
  );
};
```

### Bundle Optimization

#### 1. Tree Shaking

```tsx
// ✅ Import only what you need
import { debounce } from "lodash/debounce";
import { format } from "date-fns";

// ❌ Avoid importing entire libraries
import _ from "lodash";
import * as dateFns from "date-fns";
```

#### 2. Dynamic Imports

```tsx
// Dynamic imports for conditional functionality
const loadAdvancedFeatures = async () => {
  if (user.role === "ADMIN") {
    const { AdminPanel } = await import("./AdminPanel");
    return AdminPanel;
  }
  return null;
};
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Errors

**TypeScript compilation errors:**

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
yarn install

# Check TypeScript configuration
yarn tsc --noEmit
```

**Module resolution errors:**

```bash
# Clear all caches
rm -rf node_modules
rm yarn.lock
yarn install
```

#### 2. Runtime Errors

**Redux state issues:**

```tsx
// Check Redux DevTools
// Ensure proper action dispatching
const dispatch = useDispatch<AppDispatch>();

// Verify state shape
const state = useSelector((state: RootState) => state.feature);
```

**Routing issues:**

```tsx
// Check route configuration
// Verify protected route logic
// Ensure proper redirect logic
```

#### 3. Performance Issues

**Large bundle size:**

```bash
# Analyze bundle
yarn build:analyze

# Check for duplicate dependencies
npx duplicate-package-checker-webpack-plugin
```

**Slow rendering:**

```tsx
// Use React DevTools Profiler
// Add performance monitoring
const Component = () => {
  console.time("Component render");

  useEffect(() => {
    console.timeEnd("Component render");
  });

  return <div>Content</div>;
};
```

#### 4. Development Server Issues

**Port conflicts:**

```bash
# Kill processes on port 3000
npx kill-port 3000

# Use different port
VITE_PORT=3001 yarn dev
```

**Hot reload not working:**

```bash
# Check file system limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf

# Restart development server
yarn dev
```

### Debug Tools

#### 1. Browser DevTools

- **React DevTools**: Component inspection and profiling
- **Redux DevTools**: State debugging and time-travel
- **Network Tab**: API request monitoring
- **Performance Tab**: Runtime performance analysis

#### 2. VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**

### Getting Help

1. Check the [React documentation](https://reactjs.org/docs)
2. Check the [Redux Toolkit documentation](https://redux-toolkit.js.org/)
3. Check the [Semantic UI React documentation](https://react.semantic-ui.com/)
4. Review existing patterns in the codebase

---

**Happy coding! 🎉**
