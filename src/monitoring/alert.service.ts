import config from '../config';
import logger from '../utils/logger';
import { Alert } from '../types';

export class AlertService {
  private alerts: Alert[] = [];
  private maxAlerts = 100; // Giới hạn số lượng cảnh báo lưu trữ

  constructor() {}

  // Thêm cảnh báo mới
  addAlert(alert: Alert): void {
    // Thêm cảnh báo vào đầu mảng
    this.alerts.unshift(alert);
    
    // Giới hạn số lượng cảnh báo
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }
    
    // Ghi log cảnh báo
    this.logAlert(alert);
  }

  // Lấy tất cả cảnh báo
  getAlerts(): Alert[] {
    return this.alerts;
  }

  // Lấy cảnh báo theo mức độ
  getAlertsByLevel(level: Alert['level']): Alert[] {
    return this.alerts.filter((alert) => alert.level === level);
  }

  // Lấy cảnh báo theo service
  getAlertsByService(serviceName: string): Alert[] {
    return this.alerts.filter((alert) => alert.serviceName === serviceName);
  }

  // Xóa tất cả cảnh báo
  clearAlerts(): void {
    this.alerts = [];
    logger.info('All alerts cleared');
  }

  // Ghi log cảnh báo
  private logAlert(alert: Alert): void {
    const { level, serviceName, message, data } = alert;
    
    switch (level) {
      case 'info':
        logger.info({ alert }, `[${serviceName}] ${message}`);
        break;
      case 'warning':
        logger.warn({ alert }, `[${serviceName}] ${message}`);
        break;
      case 'error':
        logger.error({ alert }, `[${serviceName}] ${message}`);
        break;
      case 'critical':
        logger.fatal({ alert }, `[${serviceName}] ${message}`);
        break;
    }
  }

  // Tạo cảnh báo mới
  createAlert(
    serviceName: string,
    level: Alert['level'],
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