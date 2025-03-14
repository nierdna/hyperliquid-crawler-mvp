import config from '../config';
import logger from '../utils/logger';
import { Alert } from '../types';

export class AlertService {
  private alerts: Alert[] = [];
  private maxAlerts = 100; // Maximum number of alerts to store

  constructor() {}

  // Add new alert
  addAlert(alert: Alert): void {
    // Add alert to the beginning of the array
    this.alerts.unshift(alert);

    // Limit the number of alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    // Log the alert
    this.logAlert(alert);
  }

  // Get all alerts
  getAlerts(): Alert[] {
    return this.alerts;
  }

  // Get alerts by level
  getAlertsByLevel(level: Alert["level"]): Alert[] {
    return this.alerts.filter((alert) => alert.level === level);
  }

  // Get alerts by service
  getAlertsByService(serviceName: string): Alert[] {
    return this.alerts.filter((alert) => alert.serviceName === serviceName);
  }

  // Clear all alerts
  clearAlerts(): void {
    this.alerts = [];
    logger.info("All alerts cleared");
  }

  // Log alert
  private logAlert(alert: Alert): void {
    const { level, serviceName, message, data } = alert;

    switch (level) {
      case "info":
        logger.info({ alert }, `[${serviceName}] ${message}`);
        break;
      case "warning":
        logger.warn({ alert }, `[${serviceName}] ${message}`);
        break;
      case "error":
        logger.error({ alert }, `[${serviceName}] ${message}`);
        break;
      case "critical":
        logger.fatal({ alert }, `[${serviceName}] ${message}`);
        break;
    }
  }

  // Create new alert
  createAlert(
    serviceName: string,
    level: Alert["level"],
    message: string,
    data?: any
  ): Alert {
    const alert: Alert = {
      serviceName,
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.addAlert(alert);
    return alert;
  }
} 