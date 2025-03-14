// Definition of types for Hyperliquid events

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

// Definition of types for message queue
export interface QueueMessage {
  content: string;
  messageId: string;
}

// Definition of types for metrics
export interface ServiceMetrics {
  serviceName: string;
  timestamp: number;
  metrics: {
    [key: string]: number;
  };
}

// Definition of types for alerts
export interface Alert {
  serviceName: string;
  timestamp: number;
  level: "info" | "warning" | "error" | "critical";
  message: string;
  data?: any;
}
