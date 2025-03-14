import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Trade } from "./trade.model";
import { User } from "./user.model";

@Entity("trade_participants")
export class TradeParticipant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("bigint")
  tradeId: number;

  @Column()
  userAddress: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @ManyToOne(() => Trade, (trade: Trade) => trade.participants)
  @JoinColumn({ name: "tradeId", referencedColumnName: "tid" })
  trade: Trade;

  @ManyToOne(() => User, (user: User) => user.tradeParticipants)
  @JoinColumn({ name: "userAddress", referencedColumnName: "address" })
  user: User;
}

export default TradeParticipant;
