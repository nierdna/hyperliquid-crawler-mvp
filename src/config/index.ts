import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  hyperliquid: {
    apiUrl: process.env.HYPERLIQUID_API_URL || 'wss://api.hyperliquid.xyz/ws',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    rawQueue: process.env.RABBITMQ_RAW_QUEUE || 'hyperliquid-raw-events',
    filteredQueue: process.env.RABBITMQ_FILTERED_QUEUE || 'hyperliquid-filtered-events',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hyperliquid-events',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  services: {
    api: {
      port: parseInt(process.env.API_PORT || '3000', 10),
    },
    metrics: {
      port: parseInt(process.env.METRICS_PORT || '9090', 10),
    },
  },
};

export default config; 