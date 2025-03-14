import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateEventTable1710400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "events",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "timestamp",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "data",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "source",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "filteredAt",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "isValid",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "enrichedAt",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "additionalData",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      "events",
      new TableIndex({
        name: "IDX_events_type",
        columnNames: ["type"],
      })
    );

    await queryRunner.createIndex(
      "events",
      new TableIndex({
        name: "IDX_events_timestamp",
        columnNames: ["timestamp"],
      })
    );

    await queryRunner.createIndex(
      "events",
      new TableIndex({
        name: "IDX_events_type_timestamp",
        columnNames: ["type", "timestamp"],
      })
    );

    await queryRunner.createIndex(
      "events",
      new TableIndex({
        name: "IDX_events_source_timestamp",
        columnNames: ["source", "timestamp"],
      })
    );

    // Enable uuid-ossp extension for UUID generation
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex("events", "IDX_events_type");
    await queryRunner.dropIndex("events", "IDX_events_timestamp");
    await queryRunner.dropIndex("events", "IDX_events_type_timestamp");
    await queryRunner.dropIndex("events", "IDX_events_source_timestamp");

    // Drop table
    await queryRunner.dropTable("events");
  }
}
