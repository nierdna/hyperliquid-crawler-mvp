import axios from 'axios';
import config from '../../config';
import logger from '../../utils/logger';
import { QueueService } from '../../queues/queue.service';
import { EnrichedEvent, FilteredEvent } from '../../types';
import EventModel from '../../models/event.model';

export class EnricherService {
  private filteredQueueService: QueueService;
  private isRunning = false;
  private apiClient = axios.create({
    baseURL: 'https://api.hyperliquid.xyz',
    timeout: 5000,
  });

  constructor() {
    this.filteredQueueService = new QueueService(config.rabbitmq.filteredQueue);
  }

  async start(): Promise<void> {
    try {
      // Kết nối đến queue
      await this.filteredQueueService.connect();
      
      // Bắt đầu xử lý messages
      this.isRunning = true;
      await this.filteredQueueService.consumeMessages(this.processMessage.bind(this));
      
      logger.info('Enricher service started');
    } catch (error) {
      logger.error({ error }, 'Failed to start enricher service');
      throw error;
    }
  }

  private async processMessage(message: FilteredEvent): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      logger.debug({ message }, 'Processing filtered event');
      
      // Làm giàu dữ liệu
      const enrichedEvent = await this.enrichEvent(message);
      
      // Lưu vào database
      await this.saveToDatabase(enrichedEvent);
      
      logger.debug({ enrichedEvent }, 'Saved enriched event to database');
    } catch (error) {
      logger.error({ error, message }, 'Error processing message');
    }
  }

  private async enrichEvent(event: FilteredEvent): Promise<EnrichedEvent> {
    // Tạo enriched event cơ bản
    const enrichedEvent: EnrichedEvent = {
      ...event,
      enrichedAt: Date.now(),
    };

    try {
      // Thêm dữ liệu bổ sung dựa trên loại sự kiện
      switch (event.type) {
        case 'trade':
          enrichedEvent.additionalData = await this.enrichTradeEvent(event);
          break;
        case 'orderbook':
          enrichedEvent.additionalData = await this.enrichOrderbookEvent(event);
          break;
        case 'funding':
          enrichedEvent.additionalData = await this.enrichFundingEvent(event);
          break;
      }
    } catch (error) {
      logger.error({ error, event }, 'Error enriching event');
    }

    return enrichedEvent;
  }

  private async enrichTradeEvent(event: FilteredEvent): Promise<any> {
    try {
      // Lấy thông tin bổ sung về asset từ API
      const assetInfo = await this.fetchAssetInfo(event.data.asset);
      
      // Tính toán giá trị USD của giao dịch
      const usdValue = event.data.price * event.data.size;
      
      return {
        assetInfo,
        usdValue,
        marketConditions: await this.fetchMarketConditions(event.data.asset),
      };
    } catch (error) {
      logger.error({ error, event }, 'Error enriching trade event');
      return {};
    }
  }

  private async enrichOrderbookEvent(event: FilteredEvent): Promise<any> {
    try {
      // Tính toán các chỉ số orderbook
      const bids = event.data.bids || [];
      const asks = event.data.asks || [];
      
      const bidVolume = bids.reduce((sum: number, [_, size]: [number, number]) => sum + size, 0);
      const askVolume = asks.reduce((sum: number, [_, size]: [number, number]) => sum + size, 0);
      
      const spread = asks.length > 0 && bids.length > 0 
        ? asks[0][0] - bids[0][0] 
        : 0;
      
      return {
        bidVolume,
        askVolume,
        spread,
        bidAskRatio: bidVolume / (askVolume || 1),
      };
    } catch (error) {
      logger.error({ error, event }, 'Error enriching orderbook event');
      return {};
    }
  }

  private async enrichFundingEvent(event: FilteredEvent): Promise<any> {
    try {
      // Lấy thông tin lịch sử funding
      const fundingHistory = await this.fetchFundingHistory(event.data.asset);
      
      // Tính toán các chỉ số funding
      const averageFundingRate = fundingHistory.reduce(
        (sum: number, rate: number) => sum + rate, 0
      ) / (fundingHistory.length || 1);
      
      return {
        fundingHistory,
        averageFundingRate,
        annualizedRate: event.data.rate * 24 * 365,
      };
    } catch (error) {
      logger.error({ error, event }, 'Error enriching funding event');
      return {};
    }
  }

  private async fetchAssetInfo(asset: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/info/asset/${asset}`);
      return response.data;
    } catch (error) {
      logger.error({ error, asset }, 'Error fetching asset info');
      return {};
    }
  }

  private async fetchMarketConditions(asset: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/info/market/${asset}`);
      return response.data;
    } catch (error) {
      logger.error({ error, asset }, 'Error fetching market conditions');
      return {};
    }
  }

  private async fetchFundingHistory(asset: string): Promise<number[]> {
    try {
      const response = await this.apiClient.get(`/info/funding/${asset}`);
      return response.data.rates || [];
    } catch (error) {
      logger.error({ error, asset }, 'Error fetching funding history');
      return [];
    }
  }

  private async saveToDatabase(event: EnrichedEvent): Promise<void> {
    try {
      await EventModel.create(event);
    } catch (error) {
      logger.error({ error, event }, 'Error saving event to database');
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      this.isRunning = false;
      
      // Đóng kết nối đến queue
      await this.filteredQueueService.close();
      
      logger.info('Enricher service stopped');
    } catch (error) {
      logger.error({ error }, 'Error stopping enricher service');
    }
  }
} 