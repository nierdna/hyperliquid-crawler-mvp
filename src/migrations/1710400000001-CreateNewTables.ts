import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableForeignKeyOptions,
} from "typeorm";

export class CreateNewTables1710400000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "address",
            type: "varchar",
            isPrimary: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Create sub_accounts table
    await queryRunner.createTable(
      new Table({
        name: "sub_accounts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "master_address",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "sub_account_address",
            type: "varchar",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Create trades table
    await queryRunner.createTable(
      new Table({
        name: "trades",
        columns: [
          {
            name: "tid",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "coin",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "side",
            type: "varchar",
            isNullable: false,
            comment: "A for Ask, B for Bid",
          },
          {
            name: "px",
            type: "decimal",
            isNullable: false,
            comment: "Price",
          },
          {
            name: "sz",
            type: "decimal",
            isNullable: false,
            comment: "Size",
          },
          {
            name: "time",
            type: "bigint",
            isNullable: false,
            comment: "Timestamp in milliseconds",
          },
          {
            name: "hash",
            type: "varchar",
            isNullable: false,
            comment: "Transaction hash",
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Create trade_participants table
    await queryRunner.createTable(
      new Table({
        name: "trade_participants",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "trade_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "user_address",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Create orders table
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "oid",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "user_address",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "coin",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "px",
            type: "decimal",
            isNullable: false,
            comment: "Price",
          },
          {
            name: "sz",
            type: "decimal",
            isNullable: false,
            comment: "Size",
          },
          {
            name: "side",
            type: "varchar",
            isNullable: false,
            comment: "A for Ask, B for Bid",
          },
          {
            name: "time",
            type: "bigint",
            isNullable: false,
            comment: "Timestamp in milliseconds",
          },
          {
            name: "start_position",
            type: "decimal",
            isNullable: true,
            comment: "Starting position",
          },
          {
            name: "dir",
            type: "varchar",
            isNullable: true,
            comment: "Direction e.g. Close Long",
          },
          {
            name: "closed_pnl",
            type: "decimal",
            isNullable: true,
            comment: "Closed profit and loss",
          },
          {
            name: "hash",
            type: "varchar",
            isNullable: false,
            comment: "Transaction hash",
          },
          {
            name: "crossed",
            type: "boolean",
            isNullable: true,
            comment: "Whether the order is crossed",
          },
          {
            name: "fee",
            type: "decimal",
            isNullable: true,
            comment: "Fee amount",
          },
          {
            name: "fee_token",
            type: "varchar",
            isNullable: true,
            comment: "Token used for fee",
          },
          {
            name: "trade_id",
            type: "bigint",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      "sub_accounts",
      new TableForeignKey({
        columnNames: ["master_address"],
        referencedColumnNames: ["address"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "trade_participants",
      new TableForeignKey({
        columnNames: ["trade_id"],
        referencedColumnNames: ["tid"],
        referencedTableName: "trades",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "trade_participants",
      new TableForeignKey({
        columnNames: ["user_address"],
        referencedColumnNames: ["address"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "orders",
      new TableForeignKey({
        columnNames: ["user_address"],
        referencedColumnNames: ["address"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "orders",
      new TableForeignKey({
        columnNames: ["trade_id"],
        referencedColumnNames: ["tid"],
        referencedTableName: "trades",
        onDelete: "SET NULL",
      })
    );

    // Enable uuid-ossp extension for UUID generation if not already enabled
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const subAccountsTable = await queryRunner.getTable("sub_accounts");
    const tradeParticipantsTable = await queryRunner.getTable(
      "trade_participants"
    );
    const ordersTable = await queryRunner.getTable("orders");

    if (subAccountsTable) {
      const subAccountsForeignKey = subAccountsTable.foreignKeys.find(
        (fk: TableForeignKeyOptions) =>
          fk.columnNames.indexOf("master_address") !== -1
      );
      if (subAccountsForeignKey) {
        await queryRunner.dropForeignKey("sub_accounts", subAccountsForeignKey);
      }
    }

    if (tradeParticipantsTable) {
      const tradeIdForeignKey = tradeParticipantsTable.foreignKeys.find(
        (fk: TableForeignKeyOptions) =>
          fk.columnNames.indexOf("trade_id") !== -1
      );
      if (tradeIdForeignKey) {
        await queryRunner.dropForeignKey(
          "trade_participants",
          tradeIdForeignKey
        );
      }

      const userAddressForeignKey = tradeParticipantsTable.foreignKeys.find(
        (fk: TableForeignKeyOptions) =>
          fk.columnNames.indexOf("user_address") !== -1
      );
      if (userAddressForeignKey) {
        await queryRunner.dropForeignKey(
          "trade_participants",
          userAddressForeignKey
        );
      }
    }

    if (ordersTable) {
      const userAddressForeignKey = ordersTable.foreignKeys.find(
        (fk: TableForeignKeyOptions) =>
          fk.columnNames.indexOf("user_address") !== -1
      );
      if (userAddressForeignKey) {
        await queryRunner.dropForeignKey("orders", userAddressForeignKey);
      }

      const tradeIdForeignKey = ordersTable.foreignKeys.find(
        (fk: TableForeignKeyOptions) =>
          fk.columnNames.indexOf("trade_id") !== -1
      );
      if (tradeIdForeignKey) {
        await queryRunner.dropForeignKey("orders", tradeIdForeignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable("orders");
    await queryRunner.dropTable("trade_participants");
    await queryRunner.dropTable("trades");
    await queryRunner.dropTable("sub_accounts");
    await queryRunner.dropTable("users");
  }
}
