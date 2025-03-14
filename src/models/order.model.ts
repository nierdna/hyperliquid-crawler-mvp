import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "./user.model";
import { Trade } from "./trade.model";

@Entity("orders")
export class Order {
  @PrimaryColumn("bigint")
  oid: number;

  @Column()
  userAddress: string;

  @Column()
  coin: string;

  @Column("decimal", {
    comment: "Price",
  })
  px: number;

  @Column("decimal", {
    comment: "Size",
  })
  sz: number;

  @Column({
    comment: "A for Ask, B for Bid",
  })
  side: string;

  @Column("bigint", {
    comment: "Timestamp in milliseconds",
  })
  time: number;

  @Column("decimal", {
    nullable: true,
    comment: "Starting position",
  })
  startPosition: number;

  @Column({
    nullable: true,
    comment: "Direction e.g. Close Long",
  })
  dir: string;

  @Column("decimal", {
    nullable: true,
    comment: "Closed profit and loss",
  })
  closedPnl: number;

  @Column({
    comment: "Transaction hash",
  })
  hash: string;

  @Column({
    nullable: true,
    comment: "Whether the order is crossed",
  })
  crossed: boolean;

  @Column("decimal", {
    nullable: true,
    comment: "Fee amount",
  })
  fee: number;

  @Column({
    nullable: true,
    comment: "Token used for fee",
  })
  feeToken: string;

  @Column("bigint", {
    nullable: true,
  })
  tradeId: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @ManyToOne(() => User, (user: User) => user.orders)
  @JoinColumn({ name: "userAddress", referencedColumnName: "address" })
  user: User;

  @OneToOne(() => Trade)
  @JoinColumn({ name: "tradeId", referencedColumnName: "tid" })
  trade: Trade;
}

export default Order;
