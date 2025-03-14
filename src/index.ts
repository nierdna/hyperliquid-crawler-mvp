import { connectToDatabase, disconnectFromDatabase } from './config/database';
import logger from './utils/logger';
import { CrawlerService } from './services/crawler/crawler.service';
import { FilterService } from './services/filter/filter.service';
import { EnricherService } from './services/enricher/enricher.service';
import { MetricsService } from './monitoring/metrics.service';
import { AlertService } from './monitoring/alert.service';

// Initialize services
const crawlerService = new CrawlerService();
const filterService = new FilterService();
const enricherService = new EnricherService();
const metricsService = new MetricsService();
const alertService = new AlertService();

// System startup function
async function startSystem() {
  try {
    logger.info("Starting Hyperliquid Event Crawl System...");

    // Connect to database
    await connectToDatabase();

    // Start services
    await metricsService.start();
    await crawlerService.start();
    await filterService.start();
    await enricherService.start();

    // Create alert to notify system has started
    alertService.createAlert(
      "system",
      "info",
      "Hyperliquid Event Crawl System started successfully",
      { timestamp: Date.now() }
    );

    logger.info("All services started successfully");

    // Handle system shutdown when receiving signals
    setupShutdownHandlers();
  } catch (error) {
    logger.error({ error }, "Failed to start system");

    // Create error alert
    alertService.createAlert("system", "critical", "Failed to start system", {
      error,
    });

    // Shutdown system if startup fails
    await stopSystem();
    process.exit(1);
  }
}

// System shutdown function
async function stopSystem() {
  logger.info('Stopping Hyperliquid Event Crawl System...');

  try {
    // Stop services in reverse order
    await enricherService.stop();
    await filterService.stop();
    await crawlerService.stop();
    await metricsService.stop();

    // Disconnect from database
    await disconnectFromDatabase();

    logger.info("All services stopped successfully");
  } catch (error) {
    logger.error({ error }, 'Error stopping system');
  }
}

// Setup system shutdown handlers
function setupShutdownHandlers() {
  // Handle SIGINT signal (Ctrl+C)
  process.on("SIGINT", async () => {
    logger.info("Received SIGINT signal");
    await stopSystem();
    process.exit(0);
  });

  // Handle SIGTERM signal
  process.on("SIGTERM", async () => {
    logger.info("Received SIGTERM signal");
    await stopSystem();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", async (error) => {
    logger.error({ error }, "Uncaught exception");

    // Create error alert
    alertService.createAlert("system", "critical", "Uncaught exception", {
      error,
    });

    await stopSystem();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", async (reason) => {
    logger.error({ reason }, "Unhandled rejection");

    // Create error alert
    alertService.createAlert("system", "critical", "Unhandled rejection", {
      reason,
    });
  });
}

// Start the system
startSystem(); 