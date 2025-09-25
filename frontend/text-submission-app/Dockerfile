# =============================================================================
# FRONTEND DOCKERFILE (Angular Application)
# =============================================================================
# Multi-stage build for optimized production image

# =============================================================================
# STAGE 1: BUILD STAGE
# =============================================================================
# Use Node.js 18 Alpine for building the Angular application
FROM node:18-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
# npm ci is faster and more reliable for production builds
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the Angular application for production
# --prod flag enables optimizations: minification, tree-shaking, AOT compilation
RUN npm run build --prod

# =============================================================================
# STAGE 2: PRODUCTION STAGE
# =============================================================================
# Use lightweight Nginx Alpine for serving the built application
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist/text-submission-app /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Add health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start Nginx server
# daemon off ensures Nginx runs in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
