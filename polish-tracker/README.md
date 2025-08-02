# Polish Tracker

A comprehensive nail polish collection management application built with React, Node.js, PostgreSQL, and Docker.

## Features

### Core Collection Management
- **Advanced Cataloging**: Multi-parameter data entry including brand, name, color classification, finish types, purchase information, and pricing
- **Visual Asset Management**: Photo capture/upload functionality with automatic image optimization and thumbnail generation
- **Smart Duplicate Detection**: Algorithm-based comparison system preventing redundant entries
- **Usage Tracking**: Monitor application frequency, last-used dates, and rotation patterns

### Organization & Discovery
- **Multi-Criteria Filtering**: Advanced search functionality supporting simultaneous filtering by brand, color family, finish type, price range, and more
- **Visual Color Browsing**: Thumbnail grid interface with color-based organization
- **Custom Collections**: User-defined grouping system supporting seasonal collections and occasion-based sets
- **Intelligent Tagging**: Flexible metadata structure with personal notes and custom categorization

### Analytics & Intelligence
- **Usage Pattern Analysis**: Tracking system with personalized recommendations for neglected items
- **Collection Statistics**: Comprehensive reporting including inventory count, collection value, and spending insights
- **Purchase History**: Complete transaction logging with cost-per-use calculations
- **Color Gap Analysis**: Identification of missing shades within color families

## Tech Stack

### Backend
- **Node.js** with Express.js and TypeScript
- **PostgreSQL** with JSON support for flexible metadata
- **OAuth Authentication** (Google/GitHub) with dev mode toggle
- **Image Processing** with Sharp for optimization and thumbnails
- **Docker** containerization for easy deployment

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Service Workers** for offline capability

### Infrastructure
- **Docker Compose** for multi-service orchestration
- **PostgreSQL** database with optimized indexes
- **Local file storage** with organized directory structure
- **Volume mounts** for data persistence

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd polish-tracker
   ```

2. **Environment Setup**
   
   Copy the environment template and configure:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://polish_user:polish_password@postgres:5432/polish_tracker
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   
   # OAuth (optional - leave empty to use dev mode only)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Development
   DEV_MODE=true
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Development Setup

For local development without Docker:

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Database Setup**
   ```bash
   # Start PostgreSQL with Docker
   docker run -d \
     --name polish-tracker-db \
     -e POSTGRES_DB=polish_tracker \
     -e POSTGRES_USER=polish_user \
     -e POSTGRES_PASSWORD=polish_password \
     -p 5432:5432 \
     postgres:15-alpine
   
   # Run database migrations
   psql -h localhost -U polish_user -d polish_tracker -f docker/init.sql
   ```

## Usage

### Authentication

The application supports multiple authentication methods:

1. **Dev Mode** (enabled by default)
   - Click "Dev Login" for instant access
   - Perfect for testing and development

2. **OAuth Authentication**
   - Google OAuth
   - GitHub OAuth
   - Configure client IDs in environment variables

### Adding Polish to Collection

1. Navigate to the Collection page
2. Click "Add Polish" button
3. Fill in polish details:
   - Name (required)
   - Brand selection
   - Color (hex picker or manual entry)
   - Finish type (cream, shimmer, glitter, etc.)
   - Purchase information
   - Photos (bottle, swatch, nail art)
   - Personal notes and ratings

### Organization Features

- **Custom Collections**: Create themed collections (e.g., "Summer 2024", "Work Appropriate")
- **Tagging System**: Add custom tags for easy filtering
- **Favorites**: Mark frequently used polishes
- **Usage Tracking**: Record when you use each polish

### Analytics Dashboard

View comprehensive insights:
- Collection value and growth over time
- Brand distribution and spending patterns
- Usage statistics and recommendations
- Color gap analysis for strategic purchasing

## API Documentation

### Authentication Endpoints

```
POST /api/auth/dev-login          # Dev mode login
GET  /api/auth/google             # Google OAuth
GET  /api/auth/github             # GitHub OAuth
GET  /api/auth/me                 # Get current user
POST /api/auth/logout             # Logout
```

### Polish Management

```
GET    /api/polishes              # Get user's collection (with filtering)
POST   /api/polishes              # Add new polish
GET    /api/polishes/:id          # Get specific polish
PUT    /api/polishes/:id          # Update polish
DELETE /api/polishes/:id          # Delete polish
POST   /api/polishes/:id/usage    # Record usage
```

### Collections

```
GET    /api/collections           # Get custom collections
POST   /api/collections           # Create collection
PUT    /api/collections/:id       # Update collection
DELETE /api/collections/:id       # Delete collection
POST   /api/collections/:id/polishes    # Add polish to collection
DELETE /api/collections/:id/polishes/:polishId  # Remove polish
```

### Analytics

```
GET /api/analytics                # Comprehensive analytics
GET /api/analytics/summary        # Quick summary stats
```

### File Upload

```
POST /api/upload/polish-image     # Upload bottle/swatch image
POST /api/upload/nail-art         # Upload nail art image
POST /api/upload/multiple         # Upload multiple images
GET  /api/upload/user-images      # Get user's images
DELETE /api/upload/image          # Delete image
```

## Deployment

### Production Deployment

1. **Update environment variables**
   ```env
   NODE_ENV=production
   DEV_MODE=false
   JWT_SECRET=your-production-secret
   DATABASE_URL=your-production-db-url
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Homelab Deployment

Perfect for self-hosting on a home server:

1. **Configure reverse proxy** (nginx, Traefik, etc.)
2. **Set up SSL certificates**
3. **Configure backup strategy** for database and uploads
4. **Monitor with Docker health checks**

## Development

### Project Structure

```
polish-tracker/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript definitions
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # TypeScript definitions
│   ├── Dockerfile
│   └── package.json
├── docker/                 # Docker configuration
│   └── init.sql           # Database schema
├── docs/                   # Documentation
└── docker-compose.yml      # Multi-service orchestration
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL container is running
   - Check database credentials in environment variables
   - Verify network connectivity between containers

2. **OAuth Not Working**
   - Verify client IDs and secrets are correctly configured
   - Check redirect URLs in OAuth provider settings
   - Ensure HTTPS in production for OAuth callbacks

3. **Images Not Loading**
   - Check file permissions on uploads directory
   - Verify volume mounts in Docker Compose
   - Ensure Sharp image processing dependencies are installed

4. **Frontend Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript errors
   - Verify environment variables are set

### Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include logs and environment details