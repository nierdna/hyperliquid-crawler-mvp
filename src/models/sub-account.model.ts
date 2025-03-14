import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.model";

@Entity("sub_accounts")
export class SubAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  masterAddress: string;

  @Column({ unique: true })
  subAccountAddress: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @ManyToOne(() => User, (user: User) => user.subAccounts)
  @JoinColumn({ name: "masterAddress", referencedColumnName: "address" })
  masterUser: User;
}

export default SubAccount;
