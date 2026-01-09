# Development Setup

<div align="center">

**Complete Guide to Setting Up Diora Development Environment**

*Get up and running with Diora in minutes*

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![React Native](https://img.shields.io/badge/React%20Native-Latest-blue?style=for-the-badge&logo=react)](https://reactnative.dev/)

</div>

---

## Overview

This guide will walk you through setting up Diora for local development with all necessary dependencies and configurations.

**Note:** The backend is already deployed and live at `https://diora.onrender.com`. You can develop the frontend using the live backend, or set up a complete local environment for full development.

## Quick Start (Using Live Backend)

If you only want to work on the frontend and use the deployed backend:

1. **Clone the repository:**
```bash
git clone https://github.com/https-sharif/diora-app.git
cd diora-app
```

2. **Setup frontend environment:**
```bash
cd frontend
npm install
```

3. **Create frontend `.env` file:**
```env
API_URL=https://diora.onrender.com/api
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. **Start frontend development:**
```bash
npm run dev
```

## Full Local Development Setup

For complete local development with your own backend instance:

### Prerequisites

Before you begin, make sure you have:
- Node.js installed (v14 or higher)
- MongoDB installed locally or a MongoDB Atlas account
- Cloudinary account for image storage
- Stripe account for payment processing

### Environment Setup

1. Create a `.env` file in the backend directory with these variables:
```env
PORT=5010
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
APP_URL=your_app_url
```

2. Create a `.env` file in the frontend directory:
```env
API_URL=http://localhost:5010/api
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/https-sharif/diora-app.git
cd diora-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Development Workflow

### Using Live Backend (Recommended for Frontend Development)

1. Start the frontend app:
```bash
cd frontend
npm run dev
```

2. Scan the QR code with Expo Go app on your phone, or:
   - Press `w` to open in web browser
   - Press `i` to open iOS simulator
   - Press `a` to open Android emulator

### Full Local Development

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. (Optional) Build for web deployment:
   ```bash
   cd frontend
   npm run build:web
   ```## Service Configuration

### Cloudinary Setup
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to your dashboard and copy:
   - Cloud name
   - API Key
   - API Secret
3. Add them to your `.env` file

### Stripe Setup
1. Create an account at [stripe.com](https://stripe.com)
2. Get your secret key from the dashboard
3. Set up webhook endpoint: `http://localhost:5000/api/webhook`
4. Copy the webhook secret
5. Add both keys to your `.env` file

### MongoDB Setup
1. Install MongoDB locally or create MongoDB Atlas account
2. For local: Start MongoDB service
3. For Atlas: Create cluster and get connection string
4. Add connection URI to your `.env` file

### Firebase Setup (Optional)
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firebase Cloud Messaging
3. Generate a private key for service account
4. Download the JSON file and add path to `.env`

## Troubleshooting

### Common Issues

**Port already in use**: Change PORT in your `.env` file to another port (e.g., 5001)

**MongoDB connection failed**: Ensure MongoDB is running locally or Atlas credentials are correct

**Image upload fails**: Check Cloudinary credentials in `.env` file

**Payment processing errors**: Verify Stripe keys and webhook configuration

### Development Tips

- Use `npm run dev` for hot reloading in both backend and frontend
- Check console logs for detailed error messages
- Ensure all environment variables are set before starting
- Use the API documentation to test endpoints
- Monitor network requests in browser dev tools

## Testing the Setup

Once everything is running:

1. **Create Account**: Register a new user account
2. **Post Content**: Try uploading an outfit post with image
3. **Shopping**: Browse products and add to cart
4. **Messaging**: Test real-time messaging between accounts
5. **Admin Features**: Request shop promotion and test admin panel
6. **Payments**: Use Stripe test cards to verify payment flow

## Environment Variables Reference

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/diora

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase (Notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## Mobile Development Troubleshooting

### Common Expo/React Native Issues

#### Metro Bundler Issues

**Problem:** "Error: Unable to resolve module"
```bash
# Solution: Clear Metro cache
npx expo start -c
# or
npm start -- --reset-cache
```

**Problem:** Metro bundler won't start
```bash
# Solution: Kill any running Metro processes
lsof -ti:8081 | xargs kill -9
# Then restart
npm start
```

#### iOS Simulator Issues

**Problem:** "Could not connect to development server"
- Ensure your Mac and device are on the same network
- Check firewall settings aren't blocking port 8081
- Try restarting the iOS simulator
```bash
# Reset iOS simulator
xcrun simctl erase all
```

**Problem:** "No Xcode or CLT version detected"
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

#### Android Emulator Issues

**Problem:** "Unable to load script from assets"
```bash
# Solution 1: Reverse the port
adb reverse tcp:8081 tcp:8081

# Solution 2: Start dev server with local IP
npm start
# Then press 'a' for Android
```

**Problem:** "SDK location not found"
- Set ANDROID_HOME environment variable in your shell profile:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Build Errors

**Problem:** "Module not found" after installing new package
```bash
# Solution: Clear all caches and reinstall
rm -rf node_modules
rm package-lock.json
npm install
npx expo start -c
```

**Problem:** TypeScript errors after updating packages
```bash
# Regenerate TypeScript types
npx expo customize tsconfig.json
```

#### Network/API Issues

**Problem:** API calls fail on physical device
- Use your computer's local IP instead of localhost
- Update `API_URL` in frontend `.env`:
```env
API_URL=http://192.168.1.XXX:5010/api
```

**Problem:** CORS errors in web browser
- Backend must allow the frontend origin in CORS settings
- Check backend Express CORS configuration

#### Performance Issues

**Problem:** Slow app performance in development
- Development builds are slower; test production build:
```bash
npx expo build:web
# or for mobile
eas build --platform ios
```

**Problem:** Images not loading
- Clear Expo cache:
```bash
npx expo start -c
```
- Check Cloudinary credentials in backend `.env`
- Verify image URLs are accessible

### Getting Help

If issues persist:
1. Check the [Expo documentation](https://docs.expo.dev)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/expo) with `expo` tag
3. Visit [Expo Forums](https://forums.expo.dev)
4. Check the project's [GitHub Issues](https://github.com/https-sharif/diora-app/issues)

## Next Steps

After successful setup:
- Explore the codebase using the [Project Structure](structure.md) guide
- Learn about the system architecture in [Architecture Overview](architecture.md)
- Check out the [API Documentation](api.md) for endpoint details
- Review the [Feature Showcase](showcase.md) to understand all capabilities
3. Add these to your backend `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your secret key from the Stripe dashboard
3. Add to your backend `.env` file:
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
```
4. For development, use Stripe's test mode keys
5. For testing payments, use Stripe's test card numbers:
   - Card number: 4242 4242 4242 4242
   - Any future expiry date
   - Any 3-digit CVC

### Firebase Setup (Optional - for Push Notifications)
1. Create a Firebase project at https://console.firebase.google.com
2. Download your service account key (JSON file)
3. Add these to your backend `.env` file:
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```
