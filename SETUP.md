# FarmTrust Setup Guide

This guide will help you set up the FarmTrust application with proper environment configuration and database initialization.

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas account)
- Git installed

## Step 1: Environment Configuration

### 1.1 Create Environment File

Create a `.env.local` file in the root directory with the following content:

```bash
# Database Configuration
MONGO_URI=mongodb://localhost:27017/farmtrust

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_in_production
SECRET_ACCESS_TOKEN=your_admin_access_token_secret_here_change_in_production

# Environment
NODE_ENV=development

# Social Authentication (Optional - for future OAuth integration)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Payment Integration (for future mobile money integration)
ORANGE_MONEY_API_KEY=your_orange_money_api_key
AFRIMONEY_API_KEY=your_afrimoney_api_key

# File Upload (for future Cloudinary integration)
CLOUDINARY_URL=your_cloudinary_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.2 Environment Variables Explanation

#### Required Variables:
- **MONGO_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for JWT token signing
- **SECRET_ACCESS_TOKEN**: Secret key for admin access tokens

#### Optional Variables (for future features):
- **Social Auth**: Facebook and Google OAuth credentials
- **Payment APIs**: Mobile money integration keys
- **File Upload**: Cloudinary configuration for image uploads

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Database Setup

### 3.1 Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**MongoDB Atlas:**
- Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
- Get your connection string and update `MONGO_URI` in `.env.local`

### 3.2 Initialize Database

Run the database initialization script:

```bash
npm run init-db
```

This script will:
- ✅ Test database connectivity
- ✅ Create performance indexes for all collections
- ✅ Create default product categories
- ✅ Create initial admin user

### 3.3 Verify Database Setup

After running the initialization script, you should see:

```
🚀 Starting FarmTrust database initialization...

Testing database connection...
✅ Database connection successful
📊 Found X collections in database

Creating database indexes...
✅ Database indexes created successfully

Creating default product categories...
✅ Created category: Vegetables
✅ Created category: Fruits
...

Creating initial admin user...
✅ Initial admin user created successfully
📧 Email: admin@farmtrust.sl
🔑 Password: admin123
⚠️  Please change the password after first login!

🎉 Database initialization completed successfully!
```

## Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 5: Initial Login

### Admin Access
- **URL**: `http://localhost:3000/admin`
- **Email**: `admin@farmtrust.sl`
- **Password**: `admin123`

### User Registration
- **URL**: `http://localhost:3000/auth/register`
- Create regular user accounts for testing

## Database Schema Overview

The application uses the following MongoDB collections:

### Core Collections
- **users**: User accounts (admin, vendor, buyer)
- **products**: Product catalog with vendor association
- **orders**: Order management and tracking
- **carts**: Shopping cart functionality
- **reviews**: Product reviews and ratings

### Management Collections
- **categories**: Product categories
- **disputes**: Dispute resolution system
- **farmerrequests**: Vendor verification requests
- **tokenblacklists**: JWT token invalidation

### Support Collections
- **addresses**: User address management
- **payment_methods**: Payment method storage
- **notifications**: User notification system
- **conversations**: In-app messaging
- **messages**: Individual messages
- **analytics**: Analytics data tracking

## Performance Indexes

The initialization script creates the following indexes for optimal performance:

### User Indexes
- Email (unique)
- Role
- Status
- Created date

### Product Indexes
- Vendor ID
- Category ID
- Status
- Created date
- Text search (name, description)

### Order Indexes
- Buyer ID
- Vendor ID
- Status
- Created date

### Additional Indexes
- Review ratings and associations
- Cart user associations
- Dispute and farmer request status tracking
- Token blacklist with TTL

## Security Considerations

### Production Deployment

1. **Change Default Passwords**
   - Immediately change the admin password after first login
   - Use strong, unique passwords

2. **Environment Variables**
   - Use strong, unique JWT secrets
   - Store sensitive keys securely
   - Never commit `.env.local` to version control

3. **Database Security**
   - Enable MongoDB authentication
   - Use connection string with username/password
   - Configure network access restrictions

4. **API Security**
   - Implement rate limiting
   - Add input validation
   - Use HTTPS in production

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MongoDB is running
   - Check `MONGO_URI` in `.env.local`
   - Ensure network connectivity

2. **JWT Errors**
   - Verify `JWT_SECRET` is set
   - Check token expiration settings
   - Clear browser cookies if needed

3. **Admin Login Issues**
   - Run `npm run init-db` to create admin user
   - Check console for error messages
   - Verify email/password combination

4. **Port Already in Use**
   - Change port in `package.json` scripts
   - Kill existing processes on port 3000

### Getting Help

- Check the console for detailed error messages
- Review the `MVP_TASKS.md` for implementation status
- Ensure all environment variables are properly set

## Next Steps

After successful setup:

1. **Test Core Features**
   - User registration and login
   - Product creation (vendor)
   - Order placement (buyer)
   - Admin dashboard access

2. **Configure Additional Features**
   - Set up payment integration
   - Configure file upload service
   - Enable social authentication

3. **Production Deployment**
   - Set up production database
   - Configure domain and SSL
   - Set up monitoring and logging

---

**Note**: This setup guide covers the essential configuration for development. For production deployment, additional security and performance optimizations will be required. 