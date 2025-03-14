// Định nghĩa các types cho sự kiện Hyperliquid

export interface HyperliquidRawEvent {
  type: string;
  timestamp: number;
  data: any;
  source: string;
}

export interface FilteredEvent extends HyperliquidRawEvent {
  filteredAt: number;
  isValid: boolean;
}

export interface EnrichedEvent extends FilteredEvent {
  enrichedAt: number;
  additionalData?: any;
}

// Định nghĩa types cho message queue
export interface QueueMessage {
  content: string;
  messageId: string;
}

// Định nghĩa types cho metrics
export interface ServiceMetrics {
  serviceName: string;
  timestamp: number;
  metrics: {
    [key: string]: number;
  };
}

// Định nghĩa types cho alerts
export interface Alert {
  serviceName: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  data?: any;
} 