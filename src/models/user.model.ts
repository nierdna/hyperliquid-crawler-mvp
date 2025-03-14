import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { SubAccount } from "./sub-account.model";
import { Order } from "./order.model";
import { TradeParticipant } from "./trade-participant.model";

@Entity("users")
export class User {
  @PrimaryColumn()
  address: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @OneToMany(
    () => SubAccount,
    (subAccount: SubAccount) => subAccount.masterUser
  )
  subAccounts: SubAccount[];

  @OneToMany(() => Order, (order: Order) => order.user)
  orders: Order[];

  @OneToMany(
    () => TradeParticipant,
    (tradeParticipant: TradeParticipant) => tradeParticipant.user
  )
  tradeParticipants: TradeParticipant[];
}

export default User;
