import express from 'express';
import config from '../config';
import logger from '../utils/logger';
import { ServiceMetrics } from '../types';

export class MetricsService {
  private app = express();
  private server: any = null;
  private metrics: Record<string, ServiceMetrics> = {};

  constructor() {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Endpoint to get metrics
    this.app.get("/metrics", (req, res) => {
      res.json(this.metrics);
    });

    // Endpoint to get metrics for a specific service
    this.app.get("/metrics/:service", (req, res) => {
      const serviceName = req.params.service;
      if (this.metrics[serviceName]) {
        res.json(this.metrics[serviceName]);
      } else {
        res.status(404).json({ error: `Service ${serviceName} not found` });
      }
    });

    // Endpoint to update metrics
    this.app.post("/metrics/:service", express.json(), (req, res) => {
      const serviceName = req.params.service;
      const serviceMetrics: ServiceMetrics = {
        serviceName,
        timestamp: Date.now(),
        metrics: req.body,
      };

      this.metrics[serviceName] = serviceMetrics;
      logger.debug({ serviceMetrics }, `Updated metrics for ${serviceName}`);
      res.json({ success: true });
    });

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(config.services.metrics.port, () => {
        logger.info(
          `Metrics service started on port ${config.services.metrics.port}`
        );
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err: Error) => {
          if (err) {
            logger.error({ error: err }, "Error stopping metrics service");
            reject(err);
          } else {
            logger.info("Metrics service stopped");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Method for other services to update metrics
  updateMetrics(serviceName: string, metrics: Record<string, number>): void {
    this.metrics[serviceName] = {
      serviceName,
      timestamp: Date.now(),
      metrics,
    };
    logger.debug({ serviceName, metrics }, "Updated metrics");
  }
} 