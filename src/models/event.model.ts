import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { EnrichedEvent } from "../types";

@Entity("events")
@Index(["type", "timestamp"])
@Index(["source", "timestamp"])
export class Event implements EnrichedEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  type: string;

  @Column("bigint")
  @Index()
  timestamp: number;

  @Column("jsonb")
  data: any;

  @Column()
  source: string;

  @Column("bigint")
  filteredAt: number;

  @Column()
  isValid: boolean;

  @Column("bigint")
  enrichedAt: number;

  @Column("jsonb", { nullable: true })
  additionalData?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default Event;
