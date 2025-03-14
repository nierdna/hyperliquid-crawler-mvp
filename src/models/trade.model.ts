import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { TradeParticipant } from "./trade-participant.model";
import { Order } from "./order.model";

@Entity("trades")
export class Trade {
  @PrimaryColumn("bigint")
  tid: number;

  @Column()
  coin: string;

  @Column({
    comment: "A for Ask, B for Bid",
  })
  side: string;

  @Column("decimal", {
    comment: "Price",
  })
  px: number;

  @Column("decimal", {
    comment: "Size",
  })
  sz: number;

  @Column("bigint", {
    comment: "Timestamp in milliseconds",
  })
  time: number;

  @Column({
    comment: "Transaction hash",
  })
  hash: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @OneToMany(
    () => TradeParticipant,
    (tradeParticipant: TradeParticipant) => tradeParticipant.trade
  )
  participants: TradeParticipant[];

  @OneToOne(() => Order, (order: Order) => order.trade)
  order: Order;
}

export default Trade;
