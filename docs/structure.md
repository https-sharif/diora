# Project Structure

<div align="center">

**Complete Codebase Organization and Component Reference**

*Navigate the Diora project structure with confidence*

[![Frontend](https://img.shields.io/badge/Frontend-React%20Native-blue?style=for-the-badge&logo=react)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)](backend/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?style=for-the-badge&logo=typescript)](tsconfig.json)

</div>

---

## Overview

This document provides a comprehensive guide to the Diora codebase organization, helping developers understand where to find specific functionality and how the project is structured.

## Repository Structure

```
diora-app/
├── README.md              # Project overview and quick start
├── LICENSE                # MIT license
├── docs/                  # Documentation files
│   ├── api.md            # API endpoint reference
│   ├── setup.md          # Development setup guide
│   ├── architecture.md   # System design and data flow
│   ├── structure.md      # This file - code organization
│   └── showcase.md       # Feature demonstrations
├── frontend/             # React Native mobile application
└── backend/              # Node.js API server
```

## Frontend Structure

The mobile application is built with React Native and Expo, organized in a feature-based structure:

```
frontend/
├── app/                    # Screen components and navigation
│   ├── (tabs)/            # Tab-based main screens
│   │   ├── index.tsx      # Home feed screen
│   │   ├── explore.tsx    # Search and discovery
│   │   ├── create.tsx     # Post creation
│   │   ├── shopping.tsx   # Product browsing
│   │   ├── profile.tsx    # User profile
│   │   ├── analytics.tsx  # Admin analytics
│   │   ├── monitor.tsx    # Admin monitoring
│   │   └── reports.tsx    # Admin reports
│   ├── admin/             # Admin-specific screens
│   ├── message/           # Messaging interfaces
│   ├── post/              # Post-related screens
│   ├── product/           # Product detail screens
│   ├── shop/              # Shop management screens
│   ├── user/              # User profile screens
│   ├── order/             # Order management screens
│   ├── report/            # Content reporting screens
│   ├── utils/             # Utility screens
│   ├── auth.tsx           # Authentication screen
│   ├── cart.tsx           # Shopping cart
│   ├── checkout.tsx       # Payment checkout
│   ├── empty.tsx          # Empty state screen
│   ├── formScreen.tsx     # Dynamic form screen
│   ├── imageScreen.tsx    # Image viewing screen
│   ├── index.tsx          # App entry point
│   ├── messages.tsx       # Message list
│   ├── notifications.tsx  # Notification center
│   ├── onboarding.tsx     # User onboarding flow
│   ├── pastOrder.tsx      # Order history
│   ├── settings.tsx       # User settings
│   ├── wishlist.tsx       # Saved products
│   ├── +not-found.tsx     # 404 error screen
│   └── _layout.tsx        # Root layout component
├── components/            # Reusable UI components
│   ├── AdminProfile.tsx   # Admin user profile component
│   ├── CategorySelector.tsx # Product category picker
│   ├── EmptyState.tsx     # Empty state displays
│   ├── ErrorBoundary.tsx  # Error handling wrapper
│   ├── GlobalToast.tsx    # App-wide notifications
│   ├── Loading.tsx        # Loading indicators
│   ├── NewConversationModal.tsx # New message creation modal
│   ├── NotLoggedIn.tsx    # Authentication prompt
│   ├── OnboardingManager.tsx # User onboarding flow
│   ├── PostCard.tsx       # Social post display
│   ├── PromotionRequestModal.tsx # Shop promotion modal
│   ├── RatingStar.tsx     # Star rating component
│   ├── ReviewInput.tsx    # Review form component
│   ├── ShopOnboarding.tsx # Shop setup component
│   ├── ShopProfile.tsx    # Shop profile display
│   ├── SkeletonLoader.tsx # Loading skeleton component
│   ├── Toast.tsx          # Toast notification component
│   ├── UserOnboarding.tsx # User setup component
│   └── UserProfile.tsx    # User profile display
├── contexts/              # React context providers
│   ├── ThemeContext.tsx   # App theme management
│   ├── ToastContext.tsx   # Global toast notifications
│   └── SafeAreaContext.tsx # Safe area handling
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication state
│   ├── useCart.ts         # Shopping cart management
│   ├── useMessages.ts     # Real-time messaging
│   └── useNotifications.ts # Notification handling
├── services/              # API communication layer
│   ├── adminService.ts    # Admin operations API calls
│   ├── authService.ts     # Authentication API calls
│   ├── commentService.ts  # Comment system API calls
│   ├── messageService.ts  # Messaging API calls
│   ├── notificationService.ts # Notification API calls
│   ├── orderService.ts    # Order processing API calls
│   ├── postService.ts     # Post-related API calls
│   ├── productService.ts  # Product API calls
│   ├── reportService.ts   # Content reporting API calls
│   ├── reviewService.ts   # Review system API calls
│   ├── searchService.ts   # Search functionality API calls
│   ├── shopService.ts     # Shop management API calls
│   ├── shoppingService.ts # Shopping cart API calls
│   ├── trendingService.ts # Trending content API calls
│   ├── userService.ts     # User management API calls
│   └── index.ts           # Service exports
├── stores/                # State management (Zustand)
│   ├── authStore.ts       # Global authentication state
│   ├── messageStore.ts    # Message state management
│   ├── notificationStore.ts # Notification state
│   └── shoppingStore.ts   # Shopping and cart state
├── types/                 # TypeScript type definitions
│   ├── User.ts            # User data types
│   ├── Post.ts            # Post data types
│   ├── Product.ts         # Product data types
│   ├── Order.ts           # Order data types
│   ├── Message.ts         # Message data types
│   ├── Report.ts          # Report data types
│   └── index.ts           # Exported types
├── validation/            # Form validation schemas
│   ├── authValidation.ts  # Login/signup validation
│   ├── postValidation.ts  # Post creation validation
│   ├── productValidation.ts # Product validation
│   └── profileValidation.ts # Profile update validation
├── utils/                 # Helper functions
│   ├── formatters.ts      # Data formatting utilities
│   ├── constants.ts       # App constants
│   ├── permissions.ts     # Permission checking
│   └── storage.ts         # Local storage utilities
├── styles/                # Shared styling
│   ├── colors.ts          # Color palette
│   ├── typography.ts      # Font configurations
│   └── spacing.ts         # Layout spacing
├── icon/                  # Icon components and assets
├── assets/                # Static assets
│   ├── fonts/             # Custom fonts
│   ├── icons/             # Icon files
│   └── images/            # Static images
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── config.js              # App configuration
```

## Backend Structure

The API server is built with Node.js and Express, following MVC architecture:

```
backend/
├── config/                # Database and service configurations
│   └── db.js              # MongoDB connection setup
├── controllers/           # Business logic handlers
│   ├── adminController.js     # Admin panel operations
│   ├── authController.js      # Authentication logic
│   ├── cartController.js      # Shopping cart management
│   ├── commentController.js   # Comment system
│   ├── messageController.js   # Messaging system
│   ├── notificationController.js # Notification handling
│   ├── orderController.js     # Order processing
│   ├── postController.js      # Post management
│   ├── productController.js   # Product catalog
│   ├── reportController.js    # Content reporting
│   ├── reviewController.js    # Review system
│   ├── searchController.js    # Search functionality
│   ├── shopController.js      # Shop management
│   ├── upload.js             # File upload handling
│   ├── userController.js     # User management
│   ├── userSearchController.js # Advanced user search
│   └── wishlistController.js  # Wishlist management
├── middleware/            # Authentication and security
│   ├── adminAuth.js       # Admin authorization
│   └── auth.js            # User authentication
├── models/                # Database schemas (Mongoose)
│   ├── Cart.js            # Shopping cart schema
│   ├── Comment.js         # Comment schema
│   ├── Conversation.js    # Message conversation schema
│   ├── Message.js         # Message schema
│   ├── Notification.js    # Notification schema
│   ├── Order.js           # Order schema
│   ├── Post.js            # Post schema
│   ├── Product.js         # Product schema
│   ├── PromotionRequest.js # Shop promotion schema
│   ├── Report.js          # Content report schema
│   ├── Review.js          # Review schema
│   ├── Shop.js            # Shop schema
│   ├── User.js            # User schema
│   └── Wishlist.js        # Wishlist schema
├── routes/                # API endpoint definitions
│   ├── admin.js           # Admin panel routes
│   ├── auth.js            # Authentication routes
│   ├── cart.js            # Shopping cart routes
│   ├── comment.js         # Comment routes
│   ├── message.js         # Messaging routes
│   ├── notification.js    # Notification routes
│   ├── order.js           # Order routes
│   ├── post.js            # Post routes
│   ├── product.js         # Product routes
│   ├── report.js          # Report routes
│   ├── review.js          # Review routes
│   ├── search.js          # Search routes
│   ├── shop.js            # Shop routes
│   ├── stripe.js          # Payment routes
│   ├── upload.js          # File upload routes
│   ├── user.js            # User routes
│   ├── userSearch.js      # User search routes
│   ├── webhook.js         # Webhook handlers
│   └── wishlist.js        # Wishlist routes
├── sockets/               # Real-time communication
│   ├── messageSocket.js   # Message socket handlers
│   └── socketSetup.js     # Socket.io configuration
├── utils/                 # Helper functions and utilities
│   ├── cloudinary.js      # Image upload utilities
│   └── migrations/        # Database migration scripts
├── uploads/               # Temporary file storage
├── package.json           # Dependencies and scripts
├── server.js              # Main server file
└── .env                   # Environment variables
```

## Code Organization Principles

### Frontend Architecture

#### Feature-Based Organization
- Related screens, components, and logic are grouped together
- Easy to locate and modify specific functionality
- Clear boundaries between different app areas

#### Service Layer Pattern
- API calls are centralized in service files
- Components don't make direct HTTP requests
- Consistent error handling and data transformation

#### Component Hierarchy
- **Screens**: Top-level views that users navigate to
- **Components**: Reusable UI elements used across screens
- **Hooks**: Shared logic and state management
- **Stores**: Global application state

### Backend Architecture

#### MVC Pattern
- **Models**: Database schemas and data validation
- **Views**: JSON API responses
- **Controllers**: Business logic and request handling

#### Middleware Chain
- Authentication and authorization
- Request validation and sanitization
- Error handling and logging
- Rate limiting and security

#### Route Organization
- Logical grouping of related endpoints
- Consistent naming conventions
- Clear separation of concerns

## File Naming Conventions

### Frontend
- **Components**: PascalCase (e.g., `PostCard.tsx`, `UserProfile.tsx`)
- **Screens**: lowercase (e.g., `explore.tsx`, `profile.tsx`)
- **Services**: camelCase with suffix (e.g., `authService.ts`)
- **Types**: PascalCase (e.g., `User.ts`, `Product.ts`)
- **Hooks**: camelCase with prefix (e.g., `useAuth.ts`)

### Backend
- **Controllers**: camelCase with suffix (e.g., `userController.js`)
- **Models**: PascalCase (e.g., `User.js`, `Product.js`)
- **Routes**: lowercase (e.g., `auth.js`, `user.js`)
- **Middleware**: camelCase (e.g., `auth.js`)

## Development Workflow

### Adding New Features

#### Frontend Development:
1. **Define Types**: Create TypeScript interfaces in `types/`
2. **Build Service**: Add API communication in `services/`
3. **Create Components**: Build reusable UI in `components/`
4. **Add Screens**: Create feature screens in `app/`
5. **Add Validation**: Define form rules in `validation/`
6. **Update State**: Add global state in `stores/` if needed

#### Backend Development:
1. **Define Model**: Create database schema in `models/`
2. **Build Controller**: Add business logic in `controllers/`
3. **Create Routes**: Define API endpoints in `routes/`
4. **Add Middleware**: Implement security/validation
5. **Test Endpoints**: Verify API functionality

### Key Directories by Role

#### For Frontend Developers:
- `app/` - Screen components and navigation
- `components/` - Reusable UI elements
- `services/` - API integration
- `types/` - Data structure definitions

#### For Backend Developers:
- `controllers/` - Business logic
- `models/` - Database schemas
- `routes/` - API endpoints
- `middleware/` - Authentication and security

#### For Full-Stack Developers:
- All of the above directories
- Focus on service/controller integration
- Type consistency between frontend and backend

---

> **Related Documentation:**
> - [Architecture & Data Flow](architecture.md) - System design and technical implementation
> - [API Documentation](api.md) - Complete endpoint reference
> - [Setup Guide](setup.md) - Development environment configuration