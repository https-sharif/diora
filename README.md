# Diora

<div align="center">
  <img src="frontend/assets/images/darkIcon.png" alt="Diora Logo" width="200" height="200" />
  <h1 style="font-size: 3rem; font-weight: bold;">Diora</h1>
</div>

<div align="center">

**A Fashion Discovery & Shopping Platform**

*Seamlessly connecting fashion inspiration with shopping experiences*

[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

Diora is a comprehensive mobile application that bridges the gap between fashion inspiration and purchasing decisions. The platform creates a seamless ecosystem where users can discover outfit ideas, share their style, and shop curated fashion items from verified retailers - all within a single, intuitive interface.

### Key Value Propositions
- **Social Fashion Discovery**: Share and discover outfit inspirations within a vibrant community
- **Integrated Shopping**: Direct access to fashion items through verified retailer partnerships
- **Style Personalization**: AI-driven recommendations based on user preferences and behavior
- **Real-time Interaction**: Live messaging, notifications, and community engagement features
- **Secure Commerce**: End-to-end secure payment processing and order management

## Live Deployment

### Backend API
- **Production URL**: [https://diora.onrender.com](https://diora.onrender.com)
- **Platform**: Render
## Deployment

- **Backend**: https://diora.onrender.com
- **Status**: Live and operational

### Mobile App
- **Status**: Development build available via Expo
- **Download**: Scan QR code from development server or use Expo Go app

## Quick Start

### Prerequisites
- **Node.js** (v16.0 or higher)
- **MongoDB** (v5.0 or higher) 
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** or **Android Emulator** (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/https-sharif/diora-app.git
   cd diora-app
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend && npm install
   
   # Frontend dependencies  
   cd ../frontend && npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Configure your environment variables
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start backend server
   cd backend && npm run dev
   
   # Terminal 2: Start frontend (new terminal)
   cd frontend && npm start
   ```

5. **Open the app**
   - Scan QR code with Expo Go app (mobile)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

> For detailed setup instructions, see the [Setup Guide](docs/setup.md)

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React Native (Expo SDK 50+) | Cross-platform mobile framework |
| | TypeScript | Type safety and developer experience |
| | Expo Router | File-based navigation system |
| | Zustand | Lightweight state management |
| | Socket.io Client | Real-time communication |
| **Backend** | Node.js + Express.js | Server runtime and web framework |
| | MongoDB + Mongoose | NoSQL database with ODM |
| | Socket.io | WebSocket communication |
| | JWT | Authentication and authorization |
| | Bcryptjs | Password hashing and security |
| **External Services** | Cloudinary | Image storage and optimization |
| | Stripe | Payment processing |
| | Firebase | Push notifications |

> See [Architecture Overview](docs/architecture.md) for detailed technical information

## Core Features

### Social Fashion Network
- Style sharing with outfit photos and details
- Fashion feed with trending content
- Community interaction (likes, comments, shares)
- User profiles and following system
- Real-time messaging

### Shopping Experience
- Curated fashion product catalog
- Smart search and filtering
- Shopping cart and wishlist management
- Secure Stripe checkout
- Order tracking and history

### Merchant Tools
- Branded shop profiles
- Inventory and order management
- Analytics dashboard
- Promotion and marketing tools

### Administration
- User and content moderation
- Report system and community guidelines
- Platform analytics and monitoring
- Automated maintenance tasks

> Explore all features in detail: [Feature Showcase](docs/showcase.md)

## Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/setup.md) | Complete installation and configuration |
| [Architecture](docs/architecture.md) | System design and technical decisions |
| [API Reference](docs/api.md) | Complete REST API documentation |
| [Project Structure](docs/structure.md) | Codebase organization and conventions |
| [Feature Showcase](docs/showcase.md) | Visual tour of app capabilities |

## Platform Support

| **Platform** | **Status** | **Version Requirements** |
|--------------|------------|-------------------------|
| **iOS** | Supported | iOS 13.0+ |
| **Android** | Supported | Android 8.0+ (API 26+) |
| **Web** | In Development | Modern browsers |

## Key Technical Features

### Real-time Capabilities
- Live messaging with Socket.io
- Real-time notifications and updates
- Live order tracking
- Instant like/comment updates

### Security & Authentication
- JWT-based authentication
- Bcrypt password hashing
- Secure payment processing with Stripe
- Protected API endpoints with middleware

### Performance Optimizations
- Image optimization with Cloudinary
- Lazy loading and pagination
- Efficient state management with Zustand
- Optimized database queries with MongoDB indexing

### User Experience
- Dark/Light theme support
- Offline capability for cached content
- Progressive image loading
- Responsive design for all screen sizes

## Development Scripts

### Backend
```bash
npm run dev          # Development server with hot reload
```

### Frontend
```bash
npm run dev          # Expo development server
```

## Environment Variables

### Required Backend Variables
- `PORT` - Server port (default: 5010)
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Authentication secret key
- `CLOUDINARY_CLOUD_NAME` - Image storage config
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook verification
- `APP_URL` - Application URL for callbacks

### Required Frontend Variables
- `API_URL` - Backend API endpoint
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key

> Complete environment setup in [Setup Guide](docs/setup.md)

## Team

| Role | Name | GitHub |
|------|------|---------|
| **Lead Developer** | Shariful Islam | [@https-sharif](https://github.com/https-sharif) |
| **Frontend Developer** | Tajnova Jahan | [@Tajnova18](https://github.com/Tajnova18) |
| **Full-Stack Developer** | Nafis Khan | [@NafisKHAN19](https://github.com/NafisKHAN19) |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

---

**Made with care by the Diora Team**

*Connecting fashion enthusiasts worldwide*

[![GitHub stars](https://img.shields.io/github/stars/https-sharif/diora-app?style=social)](https://github.com/https-sharif/diora-app/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/https-sharif/diora-app?style=social)](https://github.com/https-sharif/diora-app/network)

</div>
