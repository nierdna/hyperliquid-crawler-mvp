import { connectToDatabase, disconnectFromDatabase } from './config/database';
import logger from './utils/logger';
import { CrawlerService } from './services/crawler/crawler.service';
import { FilterService } from './services/filter/filter.service';
import { EnricherService } from './services/enricher/enricher.service';
import { MetricsService } from './monitoring/metrics.service';
import { AlertService } from './monitoring/alert.service';

// Khởi tạo các services
const crawlerService = new CrawlerService();
const filterService = new FilterService();
const enricherService = new EnricherService();
const metricsService = new MetricsService();
const alertService = new AlertService();

// Hàm khởi động hệ thống
async function startSystem() {
  try {
    logger.info('Starting Hyperliquid Event Crawl System...');

    // Kết nối đến database
    await connectToDatabase();

    // Khởi động các services
    await metricsService.start();
    await crawlerService.start();
    await filterService.start();
    await enricherService.start();

    // Tạo cảnh báo thông báo hệ thống đã khởi động
    alertService.createAlert(
      'system',
      'info',
      'Hyperliquid Event Crawl System started successfully',
      { timestamp: Date.now() }
    );

    logger.info('All services started successfully');

    // Xử lý tắt hệ thống khi nhận tín hiệu
    setupShutdownHandlers();
  } catch (error) {
    logger.error({ error }, 'Failed to start system');
    
    // Tạo cảnh báo lỗi
    alertService.createAlert(
      'system',
      'critical',
      'Failed to start system',
      { error }
    );
    
    // Tắt hệ thống nếu khởi động thất bại
    await stopSystem();
    process.exit(1);
  }
}

// Hàm tắt hệ thống
async function stopSystem() {
  logger.info('Stopping Hyperliquid Event Crawl System...');

  try {
    // Tắt các services theo thứ tự ngược lại
    await enricherService.stop();
    await filterService.stop();
    await crawlerService.stop();
    await metricsService.stop();

    // Ngắt kết nối database
    await disconnectFromDatabase();

    logger.info('All services stopped successfully');
  } catch (error) {
    logger.error({ error }, 'Error stopping system');
  }
}

// Thiết lập xử lý tắt hệ thống
function setupShutdownHandlers() {
  // Xử lý tín hiệu SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT signal');
    await stopSystem();
    process.exit(0);
  });

  // Xử lý tín hiệu SIGTERM
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM signal');
    await stopSystem();
    process.exit(0);
  });

  // Xử lý lỗi không bắt được
  process.on('uncaughtException', async (error) => {
    logger.error({ error }, 'Uncaught exception');
    
    // Tạo cảnh báo lỗi
    alertService.createAlert(
      'system',
      'critical',
      'Uncaught exception',
      { error }
    );
    
    await stopSystem();
    process.exit(1);
  });

  // Xử lý promise bị reject không bắt được
  process.on('unhandledRejection', async (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
    
    // Tạo cảnh báo lỗi
    alertService.createAlert(
      'system',
      'critical',
      'Unhandled rejection',
      { reason }
    );
  });
}

// Khởi động hệ thống
startSystem(); 