import { DataSourceOptions } from "typeorm";
import config from "./src/config";
import Event from "./src/models/event.model";

const ormConfig: DataSourceOptions = {
  type: "postgres",
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  synchronize: true, // Set to false in production
  logging: config.logging.level === "debug",
  entities: [Event],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
};

export default ormConfig;
