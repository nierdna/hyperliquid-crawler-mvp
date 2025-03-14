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
      // Connect to queues
      await this.rawQueueService.connect();
      await this.filteredQueueService.connect();

      // Start processing messages
      this.isRunning = true;
      await this.rawQueueService.consumeMessages(
        this.processMessage.bind(this)
      );

      logger.info("Filter service started");
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
      logger.debug({ message }, "Processing raw event");

      // Check message validity
      const isValid = this.validateMessage(message);

      // Create filtered event
      const filteredEvent: FilteredEvent = {
        ...message,
        filteredAt: Date.now(),
        isValid,
      };

      // Only send valid events to filtered queue
      if (isValid) {
        await this.filteredQueueService.publishMessage(filteredEvent);
        logger.debug({ filteredEvent }, "Published event to filtered queue");
      } else {
        logger.debug({ message }, "Filtered out invalid event");
      }
    } catch (error) {
      logger.error({ error, message }, 'Error processing message');
    }
  }

  private validateMessage(message: HyperliquidRawEvent): boolean {
    // Check required fields
    if (!message.type || !message.timestamp || !message.data) {
      return false;
    }

    // Check event type (only interested in certain event types)
    const validEventTypes = ["trade", "orderbook", "funding"];
    if (!validEventTypes.includes(message.type)) {
      return false;
    }

    // Check valid data based on event type
    switch (message.type) {
      case "trade":
        return this.validateTradeEvent(message);
      case "orderbook":
        return this.validateOrderbookEvent(message);
      case "funding":
        return this.validateFundingEvent(message);
      default:
        return false;
    }
  }

  private validateTradeEvent(message: HyperliquidRawEvent): boolean {
    const data = message.data;
    // Check required fields for trade event
    return !!(data.price && data.size && data.side);
  }

  private validateOrderbookEvent(message: HyperliquidRawEvent): boolean {
    const data = message.data;
    // Check required fields for orderbook event
    return !!(data.bids || data.asks);
  }

  private validateFundingEvent(message: HyperliquidRawEvent): boolean {
    const data = message.data;
    // Check required fields for funding event
    return !!(data.rate && data.timestamp);
  }

  async stop(): Promise<void> {
    try {
      this.isRunning = false;

      // Close connections to queues
      await this.rawQueueService.close();
      await this.filteredQueueService.close();

      logger.info("Filter service stopped");
    } catch (error) {
      logger.error({ error }, 'Error stopping filter service');
    }
  }
} 