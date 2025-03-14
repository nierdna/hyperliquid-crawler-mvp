FROM node:18-alpine

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose ports
EXPOSE 3000
EXPOSE 9090

# Start application
CMD ["npm", "start"] 