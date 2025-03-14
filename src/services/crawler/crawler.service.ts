import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config';
import logger from '../../utils/logger';
import { QueueService } from '../../queues/queue.service';
import { HyperliquidRawEvent } from '../../types';

export class CrawlerService {
  private ws: WebSocket | null = null;
  private queueService: QueueService;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000; // 5 seconds
  private isConnected = false;

  constructor() {
    this.queueService = new QueueService(config.rabbitmq.rawQueue);
  }

  async start(): Promise<void> {
    try {
      // Kết nối đến RabbitMQ
      await this.queueService.connect();
      
      // Kết nối đến Hyperliquid WebSocket API
      this.connectToWebSocket();
      
      logger.info('Crawler service started');
    } catch (error) {
      logger.error({ error }, 'Failed to start crawler service');
      throw error;
    }
  }

  private connectToWebSocket(): void {
    try {
      this.ws = new WebSocket(config.hyperliquid.apiUrl);

      this.ws.on('open', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        logger.info('Connected to Hyperliquid WebSocket API');
        
        // Subscribe to relevant events
        this.subscribeToEvents();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data);
      });

      this.ws.on('error', (error) => {
        logger.error({ error }, 'WebSocket error');
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        logger.warn('WebSocket connection closed');
        this.attemptReconnect();
      });
    } catch (error) {
      logger.error({ error }, 'Failed to connect to WebSocket');
      this.attemptReconnect();
    }
  }

  private subscribeToEvents(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.error('Cannot subscribe to events: WebSocket not connected');
      return;
    }

    // Subscribe to trade events
    const subscribeMessage = {
      method: 'subscribe',
      subscription: {
        type: 'trades',
      },
      id: uuidv4(),
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    logger.info('Subscribed to Hyperliquid trade events');
  }

  private async handleMessage(data: WebSocket.Data): Promise<void> {
    try {
      const message = JSON.parse(data.toString());
      
      // Kiểm tra nếu là message sự kiện (không phải message xác nhận đăng ký)
      if (message.type && message.data) {
        const event: HyperliquidRawEvent = {
          type: message.type,
          timestamp: Date.now(),
          data: message.data,
          source: 'hyperliquid-ws',
        };

        // Gửi sự kiện vào queue
        await this.queueService.publishMessage(event);
        logger.debug({ event }, 'Published event to raw queue');
      }
    } catch (error) {
      logger.error({ error, data }, 'Error handling WebSocket message');
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    logger.info(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connectToWebSocket();
      }
    }, delay);
  }

  async stop(): Promise<void> {
    try {
      if (this.ws) {
        this.ws.terminate();
        this.ws = null;
      }
      
      await this.queueService.close();
      logger.info('Crawler service stopped');
    } catch (error) {
      logger.error({ error }, 'Error stopping crawler service');
    }
  }
} 