# BuddyZone Server

A robust, scalable REST API built with NestJS, PostgreSQL, and Redis. This backend powers the BuddyZone social media platform, providing secure authentication, post management, and social interaction features.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Architecture Decisions](#architecture-decisions)
- [Security Features](#security-features)
- [Performance Considerations](#performance-considerations)

## 🎯 Overview

BuddyZone Server is a production-ready backend API that handles:
- Secure user authentication and session management
- Post creation, retrieval, and management with visibility controls
- Rich interaction features (reactions, comments, replies)
- Image upload and management via Cloudinary
- Scalable architecture designed for millions of posts

The API follows RESTful principles, implements comprehensive security measures, and is optimized for high performance and scalability.

## 🛠 Technology Stack

### Core Framework
- **NestJS 11.0.1** - Progressive Node.js framework
- **TypeScript 5.7.3** - Type safety
- **Express** - HTTP server (via NestJS platform)

### Database & ORM
- **PostgreSQL** - Primary database
- **Prisma 6.19.0** - Type-safe ORM
- **Prisma Client** - Database client

### Caching & Session Management
- **Redis 5.10.0** - Session store and caching
- **connect-redis 9.0.0** - Redis session store
- **express-session 1.18.2** - Session middleware

### Authentication
- **Passport.js 0.7.0** - Authentication middleware
- **passport-local 1.0.0** - Local authentication strategy
- **argon2 0.44.0** - Password hashing

### File Upload
- **Cloudinary 2.8.0** - Cloud-based image management
- **Multer 2.0.2** - File upload handling

### Validation & Transformation
- **class-validator 0.14.2** - DTO validation
- **class-transformer 0.5.1** - Object transformation
- **Zod 4.1.12** - Environment validation

### Security
- **Helmet 8.1.0** - Security headers
- **cookie-parser 1.4.7** - Cookie parsing
- **compression 1.8.1** - Response compression

### Documentation
- **@nestjs/swagger 11.2.3** - API documentation

### Configuration
- **@nestjs/config 4.0.2** - Configuration management

## ✨ Features

### Authentication & Authorization
- ✅ User registration with password hashing (Argon2)
- ✅ Secure login with session-based authentication
- ✅ Session management with Redis
- ✅ Protected routes with authentication guards
- ✅ User serialization/deserialization
- ✅ Current user endpoint

### Post Management
- ✅ Create posts with text content
- ✅ Attach multiple images to posts
- ✅ Post visibility control (Public/Private/Friends)
- ✅ Retrieve posts with cursor-based pagination
- ✅ Filter posts by visibility
- ✅ Get single post by ID
- ✅ Posts sorted by newest first

### Interactions
- ✅ React to posts with multiple reaction types (Like, Love, Care, Haha, Wow, Sad, Angry)
- ✅ React to comments and replies
- ✅ Comment on posts
- ✅ Reply to comments (nested structure)
- ✅ View reaction lists with user information
- ✅ Toggle reactions (like/unlike)

### Media Management
- ✅ Upload images to Cloudinary
- ✅ Multiple file upload support
- ✅ Image deletion
- ✅ Upload signature generation for secure client-side uploads

### API Features
- ✅ RESTful API design
- ✅ Swagger/OpenAPI documentation
- ✅ Request validation
- ✅ Error handling and transformation
- ✅ Response compression
- ✅ CORS configuration
- ✅ Global exception filters
- ✅ Response interceptors

## 📁 Project Structure

```
buddyzone-server/
├── src/
│   ├── bootstrap/               # Application bootstrap
│   │   ├── app.bootstrap.ts     # App configuration
│   │   ├── security.bootstrap.ts # Security setup
│   │   ├── session.bootstrap.ts # Session configuration
│   │   └── swagger.bootstrap.ts # API documentation
│   ├── common/                  # Shared utilities
│   │   ├── decorators/         # Custom decorators
│   │   ├── dto/                # Shared DTOs
│   │   ├── filters/           # Exception filters
│   │   ├── interceptors/     # Response interceptors
│   │   └── validators/         # Validators (env, etc.)
│   ├── infrastructure/          # Infrastructure services
│   │   ├── cloudinary/         # Cloudinary service
│   │   ├── prisma/             # Prisma service
│   │   └── redis/              # Redis service
│   ├── modules/                 # Feature modules
│   │   ├── auth/               # Authentication module
│   │   │   ├── guards/         # Auth guards
│   │   │   ├── strategies/     # Passport strategies
│   │   │   ├── serializers/   # Session serializers
│   │   │   └── dto/            # Auth DTOs
│   │   ├── posts/              # Posts module
│   │   │   └── dto/            # Post DTOs
│   │   ├── upload/             # Upload module
│   │   │   ├── pipes/         # File validation pipes
│   │   │   └── dto/           # Upload DTOs
│   │   └── users/              # Users module
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── generated/
│   └── prisma/                 # Generated Prisma client
└── dist/                       # Compiled output
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm (package manager)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd buddyzone-server
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Set up the database:
```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev
```

5. Start Redis server:
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or use your local Redis installation
redis-server
```

6. Run the development server:
```bash
pnpm start:dev
```

The API will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start:prod
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Frontend (for CORS)
FRONTEND_ORIGIN=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/buddyzone

# Redis (choose one option)
# Option 1: Redis URL
REDIS_URL=redis://localhost:6379

# Option 2: Redis Host/Port (if not using URL)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false

# Session
SESSION_NAME=sid
SESSION_SECRET=your-super-secret-session-key-change-in-production
SESSION_TTL=86400000
SESSION_ROLLING=false

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=buddyzone
```

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` or `REDIS_HOST` + `REDIS_PORT` - Redis connection
- `SESSION_SECRET` - Secret key for session encryption
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `FRONTEND_ORIGIN` - Required in production for CORS

## 📚 API Documentation

Once the server is running, Swagger documentation is available at:
```
http://localhost:3000/api
```

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

#### Posts
- `POST /api/v1/posts` - Create a new post
- `GET /api/v1/posts` - Get posts (with pagination)
- `GET /api/v1/posts/:id` - Get post by ID
- `POST /api/v1/posts/:id/reaction` - React to a post
- `POST /api/v1/posts/:id/comment` - Comment on a post
- `POST /api/v1/posts/:postId/comments/:commentId/reaction` - React to a comment
- `GET /api/v1/posts/:id/reactions` - Get post reactions
- `GET /api/v1/posts/:postId/comments/:commentId/reactions` - Get comment reactions

#### Upload
- `POST /api/v1/upload` - Upload single file
- `POST /api/v1/upload/multiple` - Upload multiple files
- `POST /api/v1/upload/signature` - Get upload signature
- `DELETE /api/v1/upload` - Delete file

#### Users
- `GET /api/v1/users` - Get users (if needed)

## 🗄 Database Schema

### Models

#### User
- `id` (UUID) - Primary key
- `username` (String, unique) - Username
- `firstName` (String) - First name
- `lastName` (String) - Last name
- `email` (String, unique) - Email address
- `photo` (String, optional) - Profile photo URL
- `password` (String, hashed) - Hashed password
- `createdAt`, `updatedAt` - Timestamps

#### Post
- `id` (UUID) - Primary key
- `content` (Text) - Post content
- `visibility` (Enum: PUBLIC, PRIVATE, FRIENDS) - Post visibility
- `authorId` (UUID) - Foreign key to User
- `createdAt`, `updatedAt` - Timestamps
- Relations: `author`, `mediaUrls`, `comments`, `reactions`

#### PostMedia
- `id` (UUID) - Primary key
- `publicId` (String) - Cloudinary public ID
- `url` (String) - Media URL
- `postId` (UUID) - Foreign key to Post
- `createdAt`, `updatedAt` - Timestamps

#### Comment
- `id` (UUID) - Primary key
- `content` (Text) - Comment content
- `postId` (UUID) - Foreign key to Post
- `authorId` (UUID) - Foreign key to User
- `parentId` (UUID, optional) - For nested replies
- `createdAt`, `updatedAt` - Timestamps
- Relations: `author`, `post`, `parent`, `replies`, `reactions`

#### PostReaction
- Composite primary key: `authorId` + `postId`
- `reactionType` (Enum: LIKE, LOVE, CARE, HAHA, WOW, SAD, ANGRY)
- `createdAt` - Timestamp
- Relations: `author`, `post`

#### CommentReaction
- Composite primary key: `authorId` + `commentId`
- `reactionType` (Enum: LIKE, LOVE, CARE, HAHA, WOW, SAD, ANGRY)
- `createdAt` - Timestamp
- Relations: `author`, `comment`

### Indexes

- Users: `email`, `username`
- Posts: `authorId`
- Comments: `postId`, `authorId`, `parentId`
- PostMedia: `postId`

## 🏗 Architecture Decisions

### Why NestJS?

- Modular architecture for scalability
- Built-in dependency injection
- TypeScript-first approach
- Excellent ecosystem and documentation
- Enterprise-ready patterns

### Why Session-Based Authentication?

- More secure than JWT for web applications
- Server-side session control
- Easy logout and session invalidation
- Better protection against token theft
- Simpler refresh token management

### Why Redis for Sessions?

- Fast in-memory storage
- Scalable across multiple servers
- Built-in expiration
- High performance for session lookups
- Industry standard for session management

### Why Prisma?

- Type-safe database access
- Excellent migration system
- Auto-generated TypeScript types
- Great developer experience
- Support for complex queries

### Why Cloudinary?

- Reliable cloud storage
- Built-in image transformations
- CDN delivery
- Automatic optimization
- Secure upload signatures

### Why Cursor-Based Pagination?

- Better performance with large datasets
- Consistent results (no duplicates)
- Works well with infinite scroll
- More efficient than offset-based pagination

## 🔒 Security Features

### Authentication Security
- Password hashing with Argon2 (industry standard)
- Session-based authentication
- Secure session cookies (httpOnly, secure in production)
- Session regeneration on login
- CSRF protection via same-site cookies

### API Security
- Helmet.js for security headers
- CORS configuration
- Input validation with class-validator
- SQL injection prevention (Prisma parameterized queries)
- XSS protection
- Rate limiting ready (can be added)

### Session Security
- Redis for secure session storage
- Session expiration (configurable TTL)
- Rolling sessions (optional)
- Secure cookie flags in production

### File Upload Security
- File type validation
- File size limits
- Secure upload signatures
- Cloudinary for safe file storage

## ⚡ Performance Considerations

### Database Optimization
- Indexed columns for fast queries
- Efficient joins with Prisma includes
- Cursor-based pagination
- Composite primary keys for reactions

### Caching Strategy
- Redis for session storage
- Can be extended for query caching
- Response compression enabled

### Scalability
- Stateless API design (except sessions)
- Horizontal scaling ready
- Database connection pooling (via Prisma)
- Efficient query patterns

### Query Optimization
- Selective field inclusion
- Proper indexing strategy
- Efficient relationship loading
- Pagination to limit data transfer

## 🧪 Development

### Code Style
- TypeScript strict mode
- ESLint for code quality
- Consistent module structure
- DTO-based validation

### Testing
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

### Database Migrations
```bash
# Create migration
pnpm prisma migrate dev --name migration-name

# Apply migrations
pnpm prisma migrate deploy

# Reset database (development only)
pnpm prisma migrate reset
```

## 📝 Notes

- The API is designed to handle millions of posts efficiently
- Cursor-based pagination ensures consistent performance
- Session management is optimized for high concurrency
- All endpoints are protected except authentication routes
- Error responses follow a consistent format
- API documentation is auto-generated via Swagger

## 🔗 Related Projects

- [BuddyZone Client](../buddyzone-client) - Frontend application built with Next.js
