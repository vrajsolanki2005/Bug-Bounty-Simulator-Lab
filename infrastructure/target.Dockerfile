# Build Frontend
FROM node:20-alpine AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build Backend & Serve
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./

# Copy built frontend assets to the server's public directory
# (assuming the express server can serve static files from public or dist)
COPY --from=builder /app/client/dist ./public

# Expose HTTP port
EXPOSE 80

# Map the port to 80 and start the node server
ENV PORT=80
CMD ["node", "src/app.js"]
