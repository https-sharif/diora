# Diora

A mobile application that integrates fashion discovery with streamlined shopping capabilities. This platform enables users to share outfit inspirations while providing direct access to similar fashion items through verified retailers.

## Overview

Diora addresses the gap between fashion inspiration and purchasing by creating a seamless interface between content sharing and retail accessibility. The platform enables users to both showcase their style and efficiently locate desired fashion items.

## Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- React Navigation/Expo Router
- Socket.io Client
- Axios
- Lucide React Native Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- Cloudinary (Image Storage)
- Stripe (Payment Processing)
- Firebase Admin (Notifications)

## Features

### Social Features
- Outfit posts with images and styling details
- Fashion inspiration feed
- Comments and style discussions
- Like/Star system for outfit appreciation
- User following for style inspiration
- Real-time messaging

### Shopping Features
- Curated fashion product listings
- Style-based category browsing
- Shopping cart management
- Fashion wishlist
- Secure checkout with Stripe
- Order tracking
- Similar style recommendations

### Retail Management
- Branded shop profiles
- Fashion inventory management
- Order fulfillment
- Style analytics dashboard
- Seasonal collection management
- Shop promotion request system

### Administrative Features
- Platform statistics and analytics
- User management (suspend, ban, warn users)
- Content moderation (hide/show posts and products)
- Shop promotion request approval
- Report system for community guidelines
- Real-time monitoring dashboard
- System health tracking

### Additional Features
- Real-time notifications
- Search functionality (users, posts, products)
- Content reporting system
- User onboarding flows
- Dark/Light theme support
- Push notifications via Firebase

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Stripe account
- Firebase project (for notifications)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/https-sharif/diora-app.git
   cd diora-app
   ```

2. Initialize backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Configure frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

For detailed configuration instructions, refer to the [setup documentation](docs/setup.md).

## Documentation

For detailed information about the project:

- [API Documentation](docs/api.md) - Complete REST API reference
- [Project Structure](docs/structure.md) - Detailed explanation of codebase organization
- [Architecture Overview](docs/architecture.md) - System design and data flow patterns
- [Setup Guide](docs/setup.md) - Installation and development setup
- [Feature Showcase](docs/showcase.md) - Visual tour of app features and screens

## Authors

- **Shariful Islam** - [@https-sharif](https://github.com/https-sharif)
- **Tajnova Jahan** - [@Tajnova18](https://github.com/Tajnova18)
- **Nafis Khan** - [@NafisKHAN19](https://github.com/NafisKHAN19)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
