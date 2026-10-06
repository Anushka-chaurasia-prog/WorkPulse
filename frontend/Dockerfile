# ===================================================================
# Multi-stage Dockerfile for React Frontend
# Stage 1: Build static bundle with Node.js & Vite
# Stage 2: Serve production assets via lightweight Nginx Alpine server
# ===================================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

# Cache dependency layer
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Accept browser-accessible API base URL build argument
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy frontend source and build static artifacts
COPY . .
RUN npm run build

# --- Stage 2: Runtime ---
FROM nginx:alpine AS runtime

# Copy custom Nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy bundled production assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose web server port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
