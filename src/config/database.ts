import { DataSource } from "typeorm";
import config from "./index";
import logger from "../utils/logger";
import { Event } from "../models/event.model";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  synchronize: true, // Set to false in production
  logging: config.logging.level === "debug",
  entities: [Event],
});

export async function connectToDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info("Connected to PostgreSQL successfully");
  } catch (error) {
    logger.error({ error }, "Failed to connect to PostgreSQL");
    process.exit(1);
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Disconnected from PostgreSQL");
    }
  } catch (error) {
    logger.error({ error }, "Error disconnecting from PostgreSQL");
  }
}
