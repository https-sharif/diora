# API Documentation

This document provides comprehensive information about the Diora REST API endpoints, authentication, and data models.

## Base URL

```
https://diora.onrender.com/api
```

## Route Structure Overview

The API is organized into the following route groups:

### Authentication Routes (`/auth`)
- [`POST /auth/signup`](#post-authsignup) - User registration
- [`POST /auth/login`](#post-authlogin) - User authentication

### User Management (`/user`)
- [`GET /user/me`](#get-userme) - Current user profile
- [`GET /user/:userId`](#get-useruserid) - Specific user profile
- [`GET /user/trending`](#get-usertrending) - Get trending users
- [`GET /user/settings/:userId`](#get-usersettingsuserid) - Get user settings
- [`PUT /user/settings`](#put-usersettings) - Update user settings
- [`PUT /user/profile`](#put-userprofile) - Update profile
- [`PUT /user/update/profile`](#put-userupdateprofile) - Update profile (alt)
- [`PUT /user/update/security`](#put-userupdatesecurity) - Update password
- [`PUT /user/update/email`](#put-userupdateemail) - Update email
- [`PUT /user/follow/:targetUserId`](#put-userfollowtargetuserid) - Follow/unfollow user
- [`POST /user/request-promotion`](#post-userrequest-promotion) - Request shop promotion
- [`PUT /user/complete-onboarding`](#put-usercomplete-onboarding) - Complete user onboarding
- [`PUT /user/complete-shop-onboarding`](#put-usercomplete-shop-onboarding) - Complete shop onboarding
- [`PUT /user/update-shop-details`](#put-userupdate-shop-details) - Update shop details
- [`POST /user/upload-image`](#post-userupload-image) - Upload user image

### Post Management (`/post`)
- [`GET /post/`](#get-post) - Get all posts
- [`GET /post/trending`](#get-posttrending) - Get trending posts
- [`POST /post/create`](#post-postcreate) - Create new post
- [`GET /post/:postId`](#get-postpostid) - Get specific post
- [`PUT /post/like/:postId`](#put-postlikepostid) - Like/unlike post
- [`GET /post/user/:userId`](#get-postuseruserid) - Get user's posts
- [`GET /post/user/:userId/liked`](#get-postuseruseridliked) - Get user's liked posts

### Comment System (`/comment`)
- [`POST /comment/create`](#post-commentcreate) - Create comment
- [`POST /comment/reply/:commentId`](#post-commentreplycommentid) - Reply to comment
- [`GET /comment/post/:postId`](#get-commentpostpostid) - Get post comments

### Product Catalog (`/product`)
- [`GET /product/`](#get-product) - Browse products
- [`GET /product/trending`](#get-producttrending) - Get trending products
- [`GET /product/shop/:shopId`](#get-productshopshopid) - Get products by shop
- [`POST /product/`](#post-product) - Create product (shops only)
- [`GET /product/:productId`](#get-productproductid) - Product details
- [`PUT /product/:productId`](#put-productproductid) - Update product (shops only)
- [`DELETE /product/:productId`](#delete-productproductid) - Delete product (shops only)

### Shop System (`/shop`)
- [`GET /shop/`](#get-shop) - All shops
- [`GET /shop/trending`](#get-shoptrending) - Trending shops
- [`GET /shop/analytics`](#get-shopanalytics) - Shop analytics (owners only)
- [`GET /shop/:shopId`](#get-shopshopid) - Shop profile
- [`POST /shop/`](#post-shop) - Create shop
- [`PUT /shop/follow/:shopId`](#put-shopfollowshopid) - Follow shop
- [`PUT /shop/profile`](#put-shopprofile) - Update shop profile
- [`PUT /shop/:shopId`](#put-shopshopid) - Update shop info
- [`DELETE /shop/:shopId`](#delete-shopshopid) - Delete shop

### Shopping Cart (`/cart`)
- [`GET /cart/`](#get-cart) - Get cart
- [`POST /cart/`](#post-cart) - Add to cart
- [`PATCH /cart/`](#patch-cart) - Update cart item
- [`DELETE /cart/`](#delete-cart) - Remove from cart
- [`DELETE /cart/clear`](#delete-cartclear) - Clear entire cart

### Wishlist (`/wishlist`)
- [`GET /wishlist/`](#get-wishlist) - Get wishlist
- [`POST /wishlist/`](#post-wishlist) - Add to wishlist
- [`DELETE /wishlist/`](#delete-wishlist) - Remove from wishlist
- [`POST /wishlist/toggle`](#post-wishlisttoggle) - Toggle wishlist item

### Order Management (`/order`)
- [`GET /order/success`](#get-ordersuccess) - Order success callback
- [`GET /order/cancel`](#get-ordercancel) - Order cancel callback
- [`POST /order/`](#post-order) - Create order
- [`POST /order/create-stripe-session`](#post-ordercreate-stripe-session) - Create payment session
- [`GET /order/`](#get-order) - Order history
- [`GET /order/shop`](#get-ordershop) - Shop orders (shop owners)
- [`GET /order/:orderId`](#get-orderorderid) - Order details
- [`PATCH /order/:orderId/status`](#patch-orderorderidstatus) - Update order status
- [`PATCH /order/:orderId/cancel`](#patch-orderorderidcancel) - Cancel order

### Messaging System (`/message`)
- [`GET /message/conversations`](#get-messageconversations) - Get conversations
- [`GET /message/conversations/user/:otherUserId`](#get-messageconversationsuserotheruser) - Get conversation ID
- [`POST /message/conversations`](#post-messageconversations) - Create conversation
- [`POST /message/conversations/group`](#post-messageconversationsgroup) - Create group conversation
- [`PUT /message/conversations/:conversationId/leave`](#put-messageconversationsconversationidleave) - Leave group
- [`PUT /message/conversations/:conversationId/edit`](#put-messageconversationsconversationidedit) - Edit group
- [`PUT /message/conversations/:conversationId/add-user`](#put-messageconversationsconversationidadd-user) - Add user to group
- [`GET /message/conversations/:conversationId/messages`](#get-messageconversationsconversationidmessages) - Get messages
- [`POST /message/messages`](#post-messagemessages) - Send message
- [`PUT /message/conversations/:conversationId/read`](#put-messageconversationsconversationidread) - Mark as read
- [`PUT /message/messages/:messageId/reaction`](#put-messagemessagesmessageidreaction) - Add reaction
- [`DELETE /message/messages/:messageId`](#delete-messagemessagesmessageid) - Delete message

### Review System (`/review`)
- [`POST /review/`](#post-review) - Create review
- [`GET /review/product/:productId`](#get-reviewproductproductid) - Product reviews
- [`GET /review/shop/:shopId`](#get-reviewshopshopid) - Shop reviews
- [`GET /review/reviewed/:userId/:targetType/:targetId`](#get-reviewrevieweduseridtargettypetargetid) - Check if reviewed
- [`PUT /review/:targetType/:id`](#put-reviewtargettypeid) - Update review
- [`DELETE /review/:targetType/:id`](#delete-reviewtargettypeid) - Delete review

### Search Features (`/search` & `/userSearch`)
- [`GET /search/`](#get-search) - General search
- [`GET /search/users`](#get-searchusers) - Search users
- [`GET /search/shops`](#get-searchshops) - Search shops
- [`GET /userSearch/users`](#get-usersearchusers) - Advanced user search
- [`GET /userSearch/shops`](#get-usersearchshops) - Advanced shop search
- [`GET /userSearch/all`](#get-usersearchall) - Combined search

### Notifications (`/notification`)
- [`GET /notification/`](#get-notification) - Get notifications
- [`POST /notification/add`](#post-notificationadd) - Add notification (internal)
- [`PATCH /notification/mark-as-read/:notificationId`](#patch-notificationmark-as-readnotificationid) - Mark as read
- [`PATCH /notification/mark-all-as-read`](#patch-notificationmark-all-as-read) - Mark all as read
- [`DELETE /notification/delete/:notificationId`](#delete-notificationdeletenotificationid) - Delete notification

### Reports & Moderation (`/report`)
- [`POST /report/`](#post-report) - Report content
- [`GET /report/stats`](#get-reportstats) - Report statistics (admin only)
- [`GET /report/`](#get-report) - Get reports (admin only)
- [`GET /report/:id`](#get-reportid) - Get specific report (admin only)
- [`PUT /report/:id`](#put-reportid) - Update report (admin only)
- [`POST /report/:id/moderate`](#post-reportidmoderate) - Moderate report (admin only)
- [`DELETE /report/cleanup`](#delete-reportcleanup) - Clean old reports (admin only)

### Admin Panel (`/admin`)
- [`GET /admin/stats`](#get-adminstats) - Platform statistics
- [`GET /admin/health`](#get-adminhealth) - System health check
- [`GET /admin/users/search`](#get-adminuserssearch) - User management
- [`POST /admin/users/:userId/suspend`](#post-adminusersuseridsuspend) - Suspend user
- [`POST /admin/users/:userId/ban`](#post-adminusersuseridban) - Ban user
- [`POST /admin/users/:userId/unban`](#post-adminusersuseridunban) - Unban user
- [`POST /admin/users/:userId/warn`](#post-adminusersuseridwarn) - Warn user
- [`GET /admin/posts/search`](#get-adminpostssearch) - Search posts
- [`POST /admin/posts/:postId/hide`](#post-adminpostspostidhide) - Hide post
- [`POST /admin/posts/:postId/show`](#post-adminpostspostidshow) - Show post
- [`GET /admin/products/search`](#get-adminproductssearch) - Search products
- [`POST /admin/products/:productId/hide`](#post-adminproductsproductidhide) - Hide product
- [`POST /admin/products/:productId/show`](#post-adminproductsproductidshow) - Show product
- [`GET /admin/promotion-requests`](#get-adminpromotion-requests) - Promotion requests
- [`PUT /admin/promotion-requests/:requestId`](#put-adminpromotion-requestsrequestid) - Handle promotion

### Payment Integration (`/stripe`)
- [`POST /stripe/create-account-link`](#post-stripecreate-account-link) - Shop Stripe setup
- [`GET /stripe/check-onboarding-status`](#get-stripecheck-onboarding-status) - Check Stripe status
- [`POST /order/create-stripe-session`](#post-ordercreate-stripe-session) - Payment checkout

### File Uploads (`/upload`)
- [`POST /upload/group-photo/:conversationId`](#post-uploadgroup-photoconversationid) - Upload group photo

### System Webhooks (`/webhook`)
- [`POST /webhook/`](#post-webhook) - Stripe payment webhooks

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

### User Types and Permissions

- **User**: Regular users who can post outfits, shop, and interact socially
- **Shop**: Business accounts that can list products and manage orders
- **Admin**: Platform administrators with full system access

## Error Handling

All API responses follow this format:

```json
{
  "status": boolean,
  "message": "string",
  "data": object (optional)
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Authentication Endpoints

### POST /auth/signup

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "fullName": "John Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "fullName": "John Doe",
    "type": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "jwt_token"
}
```

### POST /auth/login

Authenticate existing user.

**Request Body:**
```json
{
  "username": "username_or_email",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": true,
  "user": {
    "_id": "user_id",
    "username": "username",
    "fullName": "John Doe",
    "type": "user",
    "status": "active"
  },
  "token": "jwt_token",
  "message": "Login successful"
}
```

## User Management Endpoints

### GET /user/me
*Requires Authentication*

Get current user profile information.

**Response:**
```json
{
  "status": true,
  "user": {
    "_id": "user_id",
    "username": "username",
    "fullName": "John Doe",
    "avatar": "image_url",
    "bio": "User bio",
    "followers": ["user_id_1"],
    "following": ["user_id_2"],
    "type": "user"
  }
}
```

### GET /user/:userId
*Requires Authentication*

Get specific user profile.

**Response:** Same as `/user/me`

### GET /user/trending
*Requires Authentication*

Get trending users based on followers and activity.

**Response:**
```json
{
  "status": true,
  "users": [
    {
      "_id": "user_id",
      "username": "trendinguser",
      "fullName": "Trending User",
      "avatar": "avatar_url",
      "followers": 500,
      "postsCount": 25,
      "type": "user"
    }
  ]
}
```

### GET /user/settings/:userId
*Requires Authentication*

Get user's privacy and notification settings.

**Response:**
```json
{
  "status": true,
  "settings": {
    "privacy": {
      "profileVisibility": "public",
      "allowMessages": true,
      "showOnlineStatus": true
    },
    "notifications": {
      "pushNotifications": true,
      "emailNotifications": false,
      "likeNotifications": true,
      "commentNotifications": true
    }
  }
}
```

### PUT /user/settings
*Requires Authentication*

Update user settings.

**Request Body:**
```json
{
  "privacy": {
    "profileVisibility": "private",
    "allowMessages": false
  },
  "notifications": {
    "pushNotifications": false
  }
}
```

### PUT /user/update/security
*Requires Authentication*

Update user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### PUT /user/update/email
*Requires Authentication*

Update user email address.

**Request Body:**
```json
{
  "newEmail": "newemail@example.com",
  "password": "currentpassword"
}
```

### PUT /user/complete-onboarding
*Requires Authentication*

Mark user onboarding as complete.

**Request Body:**
```json
{
  "interests": ["fashion", "streetwear"],
  "location": "New York"
}
```

### PUT /user/complete-shop-onboarding
*Requires Authentication* *(Shop owners only)*

Complete shop onboarding process.

**Request Body:**
```json
{
  "businessDetails": {
    "category": "fashion",
    "description": "Premium clothing store"
  }
}
```

### PUT /user/update-shop-details
*Requires Authentication* *(Shop owners only)*

Update shop-specific details.

**Request Body:**
```json
{
  "businessName": "New Shop Name",
  "businessDescription": "Updated description"
}
```

### POST /user/upload-image
*Requires Authentication*

Upload user image (avatar or other).

**Request Body (multipart/form-data):**
- `image`: file (required)

### PUT /user/profile
*Requires Authentication*

Update user profile information.

**Request Body (multipart/form-data):**
- `fullName`: string (optional)
- `bio`: string (optional)
- `avatar`: file (optional)

### PUT /user/follow/:targetUserId
*Requires Authentication*

Follow or unfollow a user.

**Response:**
```json
{
  "status": true,
  "message": "User followed successfully"
}
```

### POST /user/request-promotion
*Requires Authentication*

Request promotion from user to shop owner.

**Request Body (multipart/form-data):**
- `businessName`: string
- `businessDescription`: string
- `businessType`: string
- `yearsInBusiness`: string
- `expectedProducts`: string
- `additionalInfo`: string
- `proofDocuments`: files (required)

## Post Management Endpoints

### GET /post/
*Requires Authentication*

Get all posts in the platform feed.

**Response:**
```json
{
  "status": true,
  "posts": [
    {
      "_id": "post_id",
      "caption": "My outfit today!",
      "imageUrl": "image_url",
      "user": {
        "_id": "user_id",
        "username": "username",
        "avatar": "avatar_url"
      },
      "stars": 15,
      "comments": 3,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /post/trending
*Requires Authentication*

Get trending posts based on likes and engagement.

**Response:**
```json
{
  "status": true,
  "posts": [
    {
      "_id": "post_id",
      "caption": "Trending outfit!",
      "imageUrl": "image_url",
      "user": {
        "_id": "user_id",
        "username": "username",
        "avatar": "avatar_url"
      },
      "stars": 250,
      "comments": 45,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /post/create
*Requires Authentication*

Create a new outfit post.

**Request Body (multipart/form-data):**
- `caption`: string
- `image`: file (required)

### GET /post/:postId
*Requires Authentication*

Get specific post details.

### PUT /post/like/:postId
*Requires Authentication*

Like or unlike a post.

**Response:**
```json
{
  "status": true,
  "message": "Post liked successfully",
  "stars": 16
}
```

### GET /post/user/:userId
*Requires Authentication*

Get all posts by a specific user.

## Product Management Endpoints

### GET /product/
*Requires Authentication*

Get all available products.

**Query Parameters:**
- `category`: string (optional)
- `sort`: string (price_asc, price_desc, newest)
- `limit`: number (default: 20)
- `page`: number (default: 1)

**Response:**
```json
{
  "status": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Stylish Jacket",
      "description": "Perfect for winter",
      "price": 99.99,
      "imageUrl": "image_url",
      "category": "outerwear",
      "shopId": "shop_id",
      "inStock": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /product/trending
*Requires Authentication*

Get trending products based on purchase volume and user engagement.

**Response:**
```json
{
  "status": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Trending Jacket",
      "description": "Most popular item this week",
      "price": 129.99,
      "imageUrl": "image_url",
      "category": "outerwear",
      "shopId": "shop_id",
      "purchaseCount": 50,
      "rating": 4.8
    }
  ]
}
```

### GET /product/shop/:shopId
*Requires Authentication*

Get all products from a specific shop.

**Query Parameters:**
- `category`: string (optional)
- `sort`: string (price_asc, price_desc, newest)
- `limit`: number (default: 20)

**Response:**
```json
{
  "status": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Shop Product",
      "price": 99.99,
      "imageUrl": "image_url",
      "inStock": true,
      "category": "clothing"
    }
  ],
  "shop": {
    "name": "Shop Name",
    "avatar": "shop_avatar_url"
  }
}
```

### POST /product/
*Requires Authentication* *(Shop owners only)*

Create a new product listing.

**Request Body (multipart/form-data):**
- `name`: string
- `description`: string
- `price`: number
- `category`: string
- `sizes`: array of strings (optional)
- `colors`: array of strings (optional)
- `image`: files (required)

### GET /product/:productId
*Requires Authentication*

Get specific product details with reviews.

### PUT /product/:productId
*Requires Authentication* *(Shop owners only)*

Update product information.

### DELETE /product/:productId
*Requires Authentication* *(Shop owners only)*

Delete a product listing.

## Shopping Cart Endpoints

### GET /cart/
*Requires Authentication*

Get user's shopping cart.

**Response:**
```json
{
  "status": true,
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "products": [
      {
        "productId": {
          "_id": "product_id",
          "name": "Product Name",
          "price": 99.99,
          "imageUrl": "image_url"
        },
        "quantity": 2,
        "size": "M",
        "variant": "Blue"
      }
    ]
  }
}
```

### POST /cart/
*Requires Authentication*

Add item to cart.

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 1,
  "size": "M",
  "variant": "Blue"
}
```

### PATCH /cart/
*Requires Authentication*

Update cart item quantity.

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 3
}
```

### DELETE /cart/
*Requires Authentication*

Remove item from cart.

**Request Body:**
```json
{
  "productId": "product_id"
}
```

## Order Management Endpoints

### POST /order/
*Requires Authentication*

Create a new order.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### GET /order/
*Requires Authentication*

Get user's order history.

### GET /order/:orderId
*Requires Authentication*

Get specific order details.

### PATCH /order/:orderId/status
*Requires Authentication* *(Shop owners only)*

Update order status.

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "1234567890"
}
```

## Messaging Endpoints

### GET /message/conversations
*Requires Authentication*

Get user's conversations list.

### POST /message/conversations
*Requires Authentication*

Create or get conversation with another user.

**Request Body:**
```json
{
  "otherUserId": "user_id"
}
```

### GET /message/conversations/:conversationId/messages
*Requires Authentication*

Get messages from a conversation.

### POST /message/messages
*Requires Authentication*

Send a new message.

**Request Body:**
```json
{
  "conversationId": "conversation_id",
  "content": "Hello there!",
  "type": "text"
}
```

## Review System Endpoints

### POST /review/
*Requires Authentication*

Create a review for a product or shop.

**Request Body (multipart/form-data):**
- `targetId`: string (product or shop ID)
- `targetType`: string ("product" or "shop")
- `rating`: number (1-5)
- `comment`: string (optional)
- `images`: files (optional)

### GET /review/product/:productId
*Requires Authentication*

Get all reviews for a product.

### GET /review/shop/:shopId
*Requires Authentication*

Get all reviews for a shop.

## Search Endpoints

### GET /search/
*Requires Authentication*

General search across posts, products, and users.

**Query Parameters:**
- `q`: string (search query)
- `type`: string (posts, products, users, shops)

### GET /search/users
*Requires Authentication*

Search for users.

### GET /search/shops
*Requires Authentication*

Search for shops.

### GET /post/user/:userId/liked
*Requires Authentication*

Get posts liked by a specific user.

**Response:**
```json
{
  "status": true,
  "posts": [
    {
      "_id": "post_id",
      "caption": "Liked post",
      "imageUrl": "image_url",
      "user": {
        "_id": "original_user_id",
        "username": "original_user",
        "avatar": "avatar_url"
      },
      "stars": 100,
      "likedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Comment Endpoints

### POST /comment/create
*Requires Authentication*

Create a comment on a post.

**Request Body:**
```json
{
  "postId": "post_id",
  "content": "Great outfit!"
}
```

### POST /comment/reply/:commentId
*Requires Authentication*

Reply to a specific comment.

**Request Body:**
```json
{
  "content": "Thank you!"
}
```

### GET /comment/post/:postId
*Requires Authentication*

Get all comments for a specific post.

**Response:**
```json
{
  "status": true,
  "comments": [
    {
      "_id": "comment_id",
      "content": "Great outfit!",
      "user": {
        "_id": "user_id",
        "username": "username",
        "avatar": "avatar_url"
      },
      "replies": [
        {
          "_id": "reply_id",
          "content": "Thank you!",
          "user": {
            "_id": "user_id",
            "username": "username"
          },
          "createdAt": "2025-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Shop Management Endpoints

### GET /shop/
*Requires Authentication*

Get all shops on the platform.

**Response:**
```json
{
  "status": true,
  "shops": [
    {
      "_id": "shop_id",
      "name": "Fashion Boutique",
      "description": "Premium fashion items",
      "avatar": "avatar_url",
      "coverImage": "cover_url",
      "followers": 150,
      "productsCount": 25,
      "rating": 4.5,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /shop/trending
*Requires Authentication*

Get trending shops based on popularity metrics.

### GET /shop/analytics
*Requires Authentication* *(Shop owners only)*

Get shop analytics and performance data.

**Response:**
```json
{
  "status": true,
  "analytics": {
    "totalSales": 5000,
    "ordersCount": 50,
    "productsViews": 1500,
    "followersGrowth": 15,
    "topProducts": [
      {
        "productId": "product_id",
        "name": "Best Seller",
        "sales": 25
      }
    ]
  }
}
```

### GET /shop/:shopId
*Requires Authentication*

Get specific shop profile and products.

### POST /shop/
*Requires Authentication*

Create a new shop (promotion required).

### PUT /shop/follow/:shopId
*Requires Authentication*

Follow or unfollow a shop.

### PUT /shop/profile
*Requires Authentication* *(Shop owners only)*

Update shop profile with avatar and cover image.

**Request Body (multipart/form-data):**
- `name`: string (optional)
- `description`: string (optional)
- `avatar`: file (optional)
- `coverImage`: file (optional)

### PUT /shop/:shopId
*Requires Authentication* *(Shop owners only)*

Update shop information.

### DELETE /shop/:shopId
*Requires Authentication* *(Shop owners only)*

Delete shop account.

### DELETE /cart/clear
*Requires Authentication*

Clear all items from the shopping cart.

**Response:**
```json
{
  "status": true,
  "message": "Cart cleared successfully"
}
```

## Wishlist Endpoints

### GET /wishlist/
*Requires Authentication*

Get user's wishlist items.

**Response:**
```json
{
  "status": true,
  "wishlist": {
    "_id": "wishlist_id",
    "userId": "user_id",
    "products": [
      {
        "_id": "product_id",
        "name": "Wishlist Item",
        "price": 79.99,
        "imageUrl": "image_url",
        "shopId": {
          "name": "Shop Name",
          "avatar": "shop_avatar"
        }
      }
    ]
  }
}
```

### POST /wishlist/
*Requires Authentication*

Add product to wishlist.

**Request Body:**
```json
{
  "productId": "product_id"
}
```

### DELETE /wishlist/
*Requires Authentication*

Remove product from wishlist.

**Request Body:**
```json
{
  "productId": "product_id"
}
```

### POST /wishlist/toggle
*Requires Authentication*

Toggle product in/out of wishlist.

**Request Body:**
```json
{
  "productId": "product_id"
}
```

## Advanced User Search Endpoints

### GET /userSearch/users
*Requires Authentication*

Advanced user search with filters.

**Query Parameters:**
- `query`: string (search term)
- `type`: string (user type filter)
- `location`: string (location filter)

### GET /userSearch/shops
*Requires Authentication*

Advanced shop search with filters.

**Query Parameters:**
- `query`: string (search term)
- `category`: string (shop category)
- `rating`: number (minimum rating)

### GET /userSearch/all
*Requires Authentication*

Combined search for both users and shops.

## File Upload Endpoints

### POST /upload/group-photo/:conversationId
*Requires Authentication*

Upload group photo for a conversation.

**Request Body (multipart/form-data):**
- `photo`: file (required)

**Response:**
```json
{
  "status": true,
  "message": "Group photo uploaded successfully",
  "photoUrl": "uploaded_photo_url"
}
```

## Webhook Endpoints

### POST /webhook/
*Internal Use - Stripe Webhooks*

Handle Stripe payment webhooks for order completion.

**Note:** This endpoint is used internally by Stripe and requires proper webhook signature verification.

## Notification Endpoints

### GET /notification/
*Requires Authentication*

Get user's notifications.

### PATCH /notification/mark-as-read/:notificationId
*Requires Authentication*

Mark specific notification as read.

### PATCH /notification/mark-all-as-read
*Requires Authentication*

Mark all notifications as read.

## Administrative Endpoints

*All admin endpoints require admin authentication*

### GET /admin/stats
*Requires Admin Authentication*

Get platform statistics.

**Response:**
```json
{
  "status": true,
  "stats": {
    "users": {
      "total": 1000,
      "shops": 50,
      "admins": 3,
      "newThisMonth": 25
    },
    "content": {
      "posts": 5000,
      "products": 500,
      "comments": 2000
    },
    "orders": {
      "total": 200,
      "thisMonth": 15
    }
  }
}
```

### GET /admin/users/search
*Requires Admin Authentication*

Search and manage users.

**Query Parameters:**
- `query`: string (search term)
- `type`: string (user, shop, admin)
- `status`: string (active, suspended, banned)

### POST /admin/users/:userId/suspend
*Requires Admin Authentication*

Suspend a user account.

**Request Body:**
```json
{
  "duration": 7,
  "reason": "Violation of community guidelines"
}
```

### GET /admin/promotion-requests
*Requires Admin Authentication*

Get pending shop promotion requests.

### PUT /admin/promotion-requests/:requestId
*Requires Admin Authentication*

Approve or reject promotion request.

**Request Body:**
```json
{
  "action": "approve",
  "comments": "Application approved"
}
```

## Content Moderation Endpoints

### POST /report/
*Requires Authentication*

Report inappropriate content.

**Request Body:**
```json
{
  "itemType": "post",
  "itemId": "post_id",
  "reason": "spam",
  "description": "This post contains spam content"
}
```

### GET /report/
*Requires Admin Authentication*

Get all reports for moderation.

### POST /report/:id/moderate
*Requires Admin Authentication*

Take moderation action on a report.

**Request Body:**
```json
{
  "action": "remove_content",
  "reason": "Violates community guidelines"
}
```

## Stripe Integration Endpoints

### POST /stripe/create-account-link
*Requires Authentication* *(Shop owners only)*

Create Stripe account link for shop setup.

### POST /order/create-stripe-session
*Requires Authentication*

Create Stripe checkout session for order payment.

### GET /stripe/check-onboarding-status
*Requires Authentication* *(Shop owners only)*

Check the onboarding status of shop's Stripe account.

**Response:**
```json
{
  "status": true,
  "onboardingComplete": true,
  "accountId": "acct_stripe_account_id",
  "chargesEnabled": true,
  "payoutsEnabled": true
}
```

## Real-time Features

The API supports real-time communication through WebSocket connections for:

- **Instant Messaging**: Real-time message delivery
- **Live Notifications**: Immediate notification updates
- **Online Status**: User online/offline status
- **Typing Indicators**: Message typing status

### WebSocket Events

Connect to: `wss://diora.onrender.com`

**Client Events:**
- `register`: Register user for real-time updates
- `join_conversation`: Join specific conversation
- `typing_start`: Indicate typing start
- `typing_stop`: Indicate typing stop

**Server Events:**
- `message`: New message received
- `notification`: New notification
- `user_online`: User came online
- `user_offline`: User went offline
- `typing`: Someone is typing

## Rate Limiting

The API implements rate limiting:
- **General requests**: 1000 requests per 15 minutes per IP
- **Authentication**: Special handling for login/signup
- **File uploads**: Additional restrictions apply

## File Upload Guidelines

- **Images**: JPG, PNG, GIF formats
- **Documents**: PDF format for promotion requests
- **Size limits**: 10MB per file
- **Multiple files**: Up to 5 files per request (where supported)

## Additional Endpoint Details

### GET /order/success
*Requires Authentication*

Stripe payment success callback page.

**Query Parameters:**
- `session_id`: string (Stripe session ID)

**Response:**
```json
{
  "status": true,
  "message": "Payment successful",
  "order": {
    "_id": "order_id",
    "paymentStatus": "paid",
    "orderStatus": "confirmed"
  }
}
```

### GET /order/cancel
*Requires Authentication*

Stripe payment cancellation callback page.

**Response:**
```json
{
  "status": true,
  "message": "Payment cancelled",
  "redirectUrl": "/cart"
}
```

### GET /order/shop
*Requires Authentication* *(Shop owners only)*

Get orders for the authenticated shop owner.

**Query Parameters:**
- `status`: string (pending, confirmed, shipped, delivered)
- `limit`: number (default: 20)
- `page`: number (default: 1)

**Response:**
```json
{
  "status": true,
  "orders": [
    {
      "_id": "order_id",
      "customer": {
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "productId": "product_id",
          "quantity": 2,
          "price": 99.99
        }
      ],
      "total": 199.98,
      "status": "pending",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### PATCH /order/:orderId/cancel
*Requires Authentication*

Cancel a pending order.

**Request Body:**
```json
{
  "reason": "Changed mind"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Order cancelled successfully",
  "refundStatus": "pending"
}
```

### DELETE /notification/delete/:notificationId
*Requires Authentication*

Delete a specific notification.

**Response:**
```json
{
  "status": true,
  "message": "Notification deleted successfully"
}
```

### GET /review/reviewed/:userId/:targetType/:targetId
*Requires Authentication*

Check if user has already reviewed a product or shop.

**Response:**
```json
{
  "status": true,
  "hasReviewed": true,
  "reviewId": "review_id"
}
```

### PUT /review/:targetType/:id
*Requires Authentication*

Update an existing review.

**Request Body (multipart/form-data):**
- `rating`: number (1-5)
- `comment`: string (optional)
- `images`: files (optional)

### DELETE /review/:targetType/:id
*Requires Authentication*

Delete a review (only by review author).

**Response:**
```json
{
  "status": true,
  "message": "Review deleted successfully"
}
```

## Error Codes Reference

| Code | Description | Common Causes |
|------|-------------|---------------|
| `AUTH_001` | Invalid token | Expired or malformed JWT |
| `AUTH_002` | Access denied | Insufficient permissions |
| `USER_001` | User not found | Invalid user ID |
| `USER_002` | Account suspended | User account suspended |
| `PROD_001` | Product not found | Invalid product ID |
| `ORD_001` | Order not found | Invalid order ID |
| `CART_001` | Cart empty | No items in cart |
