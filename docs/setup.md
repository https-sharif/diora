# Setting Up Diora

This guide will walk you through setting up Diora for local development.

## Prerequisites

Before you begin, make sure you have:
- Node.js installed (v14 or higher)
- MongoDB installed locally or a MongoDB Atlas account
- Cloudinary account for image storage
- Stripe account for payment processing
- Firebase project for notifications (optional)

## Environment Setup

1. Create a `.env` file in the backend directory with these variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
```

2. Create a `config.js` file in the frontend directory:
```javascript
export const config = {
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000',
};
```

## Installation Steps

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

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend app:
```bash
cd frontend
npm run dev
```

## Service Configuration

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
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/firebase-service-account.json
```

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
