# Hyperliquid Event Crawl System - MVP

Event collection and processing system from Hyperliquid API.

## System Architecture

The system is divided into main layers:

1. **Data Ingestion Layer**: Collect raw data from Hyperliquid API
   - Crawler Service: Connect to API and collect events
   - Message Queue 1: Temporary storage for raw events

2. **Data Processing Layer**: Process and enrich data
   - Data Filter Service: Filter and clean raw data
   - Message Queue 2: Temporary storage for filtered events
   - Data Enricher Service: Enrich data with additional information

3. **Data Storage Layer**: Store processed data
   - Event Database: PostgreSQL database for storing events

4. **Monitoring & Management**: System monitoring
   - Metrics Collector: Collect performance metrics
   - Alert Manager: Manage alerts

## Installation

1. Clone repository:
```
git clone https://github.com/yourusername/hyperliquid-crawler-mvp.git
cd hyperliquid-crawler-mvp
```

2. Install dependencies:
```
npm install
```

3. Create .env file from .env.example:
```
cp .env.example .env
```

4. Configure environment variables in .env file

## Running the application

### Development mode:
```
npm run dev
```

### Build and run:
```
npm run build
npm start
```

### Running with Docker Compose:
```
docker-compose up -d
```

## Database Migrations

To run migrations:
```
npm run typeorm migration:run
```

To create a new migration:
```
npm run typeorm migration:create src/migrations/YourMigrationName
```

## System Requirements

- Node.js 16+
- PostgreSQL 12+
- RabbitMQ

## License

MIT 