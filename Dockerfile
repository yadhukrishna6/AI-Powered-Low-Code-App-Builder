# Stage 1: Build the Angular application
FROM node:20-alpine as build-step

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built files from the build stage
COPY --from=build-step /app/dist/ai-powered-low-code-app-builder /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
