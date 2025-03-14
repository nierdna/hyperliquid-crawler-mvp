import amqplib, { Channel, Connection } from 'amqplib';
import config from '../config';
import logger from '../utils/logger';

export class QueueService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqplib.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      
      // Đảm bảo queue tồn tại
      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });
      
      logger.info(`Connected to RabbitMQ queue: ${this.queueName}`);
    } catch (error) {
      logger.error({ error }, `Failed to connect to RabbitMQ queue: ${this.queueName}`);
      throw error;
    }
  }

  async publishMessage(message: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.sendToQueue(this.queueName, messageBuffer, {
        persistent: true,
      });
      return result;
    } catch (error) {
      logger.error({ error }, `Error publishing message to queue: ${this.queueName}`);
      return false;
    }
  }

  async consumeMessages(callback: (message: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    try {
      await this.channel.consume(
        this.queueName,
        async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              await callback(content);
              this.channel?.ack(msg);
            } catch (error) {
              logger.error({ error }, 'Error processing message');
              // Nack message and requeue
              this.channel?.nack(msg, false, true);
            }
          }
        },
        {
          noAck: false,
        }
      );
      logger.info(`Started consuming messages from queue: ${this.queueName}`);
    } catch (error) {
      logger.error({ error }, `Error consuming messages from queue: ${this.queueName}`);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info(`Closed connection to RabbitMQ queue: ${this.queueName}`);
    } catch (error) {
      logger.error({ error }, `Error closing RabbitMQ connection for queue: ${this.queueName}`);
    }
  }
} 