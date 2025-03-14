import config from '../../config';
import logger from '../../utils/logger';
import { QueueService } from '../../queues/queue.service';
import { FilteredEvent, HyperliquidRawEvent } from '../../types';

export class FilterService {
  private rawQueueService: QueueService;
  private filteredQueueService: QueueService;
  private isRunning = false;

  constructor() {
    this.rawQueueService = new QueueService(config.rabbitmq.rawQueue);
    this.filteredQueueService = new QueueService(config.rabbitmq.filteredQueue);
  }

  async start(): Promise<void> {
    try {
      // Kết nối đến các queues
      await this.rawQueueService.connect();
      await this.filteredQueueService.connect();
      
      // Bắt đầu xử lý messages
      this.isRunning = true;
      await this.rawQueueService.consumeMessages(this.processMessage.bind(this));
      
      logger.info('Filter service started');
    } catch (error) {
      logger.error({ error }, 'Failed to start filter service');
      throw error;
    }
  }

  private async processMessage(message: HyperliquidRawEvent): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      logger.debug({ message }, 'Processing raw event');
      
      // Kiểm tra tính hợp lệ của message
      const isValid = this.validateMessage(message);
      
      // Tạo filtered event
      const filteredEvent: FilteredEvent = {
        ...message,
        filteredAt: Date.now(),
        isValid,
      };
      
      // Chỉ gửi các sự kiện hợp lệ đến filtered queue
      if (isValid) {
        await this.filteredQueueService.publishMessage(filteredEvent);
        logger.debug({ filteredEvent }, 'Published event to filtered queue');
      } else {
        logger.debug({ message }, 'Filtered out invalid event');
      }
    } catch (error) {
      logger.error({ error, message }, 'Error processing message');
    }
  }

  private validateMessage(message: HyperliquidRawEvent): boolean {
    // Kiểm tra các trường bắt buộc
    if (!message.type || !message.timestamp || !message.data) {
      return false;
    }

    // Kiểm tra loại sự kiện (chỉ quan tâm đến một số loại sự kiện)
    const validEventTypes = ['trade', 'orderbook', 'funding'];
    if (!validEventTypes.includes(message.type)) {
      return false;
    }

    // Kiểm tra dữ liệu hợp lệ dựa trên loại sự kiện
    switch (message.type) {
      case 'trade':
        return this.validateTradeEvent(message);
      case 'orderbook':
        return this.validateOrderbookEvent(message);
      case 'funding':
        return this.validateFundingEvent(message);
      default:
        return false;
    }
  }

  private validateTradeEvent(message: HyperliquidRawEvent): boolean {
    const data = message.data;
    // Kiểm tra các trường bắt buộc cho sự kiện trade
    return !!(data.price && data.size && data.side);
  }

  private validateOrderbookEvent(message: HyperliquidRawEvent): boolean {
    const data = message.data;
    // Kiểm tra các trường bắt buộc cho sự kiện orderbook
    return !!(data.bids || data.asks);
  }

  private validateFundingEvent(message: HyperliquidRawEvent): boolean {
    const data = message.data;
    // Kiểm tra các trường bắt buộc cho sự kiện funding
    return !!(data.rate && data.timestamp);
  }

  async stop(): Promise<void> {
    try {
      this.isRunning = false;
      
      // Đóng kết nối đến các queues
      await this.rawQueueService.close();
      await this.filteredQueueService.close();
      
      logger.info('Filter service stopped');
    } catch (error) {
      logger.error({ error }, 'Error stopping filter service');
    }
  }
} 