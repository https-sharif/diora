# Architecture & Data Flow

This document explains how Diora works internally - how data moves through the system and how different parts communicate with each other.

## System Overview

Diora is built as a client-server application:
- **Mobile App (Frontend)**: What users interact with - built with React Native
- **API Server (Backend)**: Handles all data processing and business logic - built with Node.js
- **Database**: Stores all information - MongoDB
- **External Services**: Cloudinary (images), Stripe (payments), Firebase (notifications)

## How Data Flows Through The System

### When a User Logs In
1. User enters email and password in the mobile app
2. App calls `authService.login()` which sends credentials to the backend
3. Backend checks credentials against the database
4. If valid, backend creates a JWT token and sends it back
5. App stores the token and uses it for all future requests
6. App navigates user to the main feed

### When a User Posts an Outfit
1. User selects photo and writes caption in the mobile app
2. App uploads image to Cloudinary and gets back an image URL
3. App calls `postService.createPost()` with caption and image URL
4. Backend receives the data and saves it to MongoDB
5. Backend notifies followers through WebSocket connections
6. Other users see the new post in their feeds immediately

### When a User Shops for Items
1. User browses products or searches for specific items
2. App calls `productService.getProducts()` to fetch product data
3. Backend queries MongoDB for products matching the criteria
4. When user adds item to cart, app calls `cartService.addToCart()`
5. Backend updates the user's cart in the database
6. Cart state is synchronized across the app

### When a User Makes a Purchase
1. User proceeds to checkout with items in their cart
2. App calls `orderService.createOrder()` with order details
3. Backend calculates total and creates order record in MongoDB
4. Backend calls Stripe API to process payment with user's payment method
5. If payment succeeds, order status updates to "confirmed"
6. Both customer and shop owner receive notifications
7. Shop owner can then fulfill the order

### When Users Send Messages
1. User types message and hits send
2. App uses WebSocket connection to send message instantly
3. If recipient is online, they receive message immediately
4. If recipient is offline, message is stored in database for later delivery
5. When offline user comes online, stored messages are delivered

## Technical Implementation Details

### Frontend Architecture Patterns

**Component-Service Pattern**: UI components don't directly make API calls. Instead, they use service functions that handle all backend communication.

**Hook-Based State Management**: Custom hooks manage complex state logic and provide clean interfaces for components to use shared data.

**Type-Safe Development**: TypeScript ensures data consistency across the entire frontend, catching errors before they reach production.

### Backend Architecture Patterns

**MVC Pattern**: 
- **Models**: Define how data is structured in the database
- **Views**: JSON responses sent back to the frontend
- **Controllers**: Handle business logic and coordinate between models and responses

**Middleware Chain**: Each API request passes through multiple middleware functions:
1. **Rate Limiting**: Prevents abuse by limiting requests per user
2. **Authentication**: Verifies user tokens and extracts user information
3. **Validation**: Ensures request data meets requirements
4. **Business Logic**: Actual processing (in controllers)
5. **Response**: Formatted data sent back to frontend

**Database Design**: MongoDB collections are structured to optimize for the app's most common queries while maintaining data relationships.

## Real-time Features Explained

### WebSocket Connections
- **What it is**: A persistent connection between the app and server that allows instant two-way communication
- **Why we use it**: Regular HTTP requests are like sending letters - you send a request and wait for a response. WebSockets are like phone calls - both sides can communicate instantly
- **Used for**: Live messaging, instant notifications, real-time updates

### Message Delivery System
- **Online Users**: Messages are delivered instantly through WebSocket connections
- **Offline Users**: Messages are stored in the database and delivered when they come back online
- **Group Conversations**: Multiple users can participate with proper permission controls

### Notification System
- **Triggers**: System events like new followers, post likes, order updates, and administrative actions
- **Delivery**: Notifications are sent through WebSockets for immediate delivery
- **Persistence**: All notifications are stored in the database for later viewing
- **User Preferences**: Users can control which types of notifications they want to receive

## Data Storage Strategy

### Database Organization
- **Users Collection**: Stores user profiles, preferences, and authentication data
- **Posts Collection**: Contains outfit posts with references to user who created them
- **Products Collection**: Shop items with pricing, descriptions, and inventory
- **Orders Collection**: Purchase records linking customers, products, and payment status
- **Messages Collection**: Chat history between users with timestamps and delivery status

### Performance Optimizations
- **Indexing**: Database indexes on frequently searched fields (usernames, product categories)
- **Caching**: Frequently accessed data is cached to reduce database queries
- **CDN Delivery**: Images are served through Cloudinary's global CDN for fast loading

## External Service Integration

### Payment Processing with Stripe
- **What it handles**: All payment operations including storing customer payment methods and processing transactions
- **How it works**: When a user makes a purchase, our backend sends payment details to Stripe's secure servers
- **Why we use it**: Stripe handles all payment security and compliance requirements, so we don't store sensitive payment information
- **Data flow**: Order created → Payment sent to Stripe → Payment confirmed → Order status updated → Notifications sent

### Image Management with Cloudinary
- **What it handles**: All user-uploaded images including outfit photos and profile pictures
- **How it works**: When users upload images, they go directly to Cloudinary which processes, optimizes, and stores them
- **Benefits**: 
  - Automatic image optimization for faster loading
  - Multiple image sizes for different screen resolutions
  - Global CDN delivery for fast access worldwide
- **Data flow**: User selects image → App uploads to Cloudinary → Cloudinary returns image URL → URL stored in our database

### Push Notifications with Firebase
- **What it handles**: Sending notifications to users' devices even when the app is closed
- **How it works**: Our server sends notification requests to Firebase, which delivers them to user devices
- **Types of notifications**: New messages, order updates, follower activity, promotional approvals
- **User control**: Users can customize which notification types they want to receive

### Real-time Communication with Socket.io
- **What it handles**: Instant messaging and live notifications within the app
- **How it works**: Maintains persistent connections between user devices and our server
- **Use cases**: 
  - Instant message delivery between users
  - Live notification updates (likes, comments, follows)
  - Real-time order status updates
- **Connection management**: Automatically handles user online/offline status and message queuing

## Security Architecture

### Request Validation
All API endpoints validate input data and sanitize requests to prevent injection attacks. Rate limiting protects against abuse while CORS policies control cross-origin access.

### Authentication & Authorization
JWT tokens carry user identity and role information. The system validates permissions at both route and resource levels, ensuring users can only access appropriate data and functions.

### Content Moderation
User-generated content flows through moderation systems that flag inappropriate material. Administrative tools provide oversight capabilities while automated systems handle basic policy enforcement.
