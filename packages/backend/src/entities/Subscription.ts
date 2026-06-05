import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Shop } from "./Shop.js";

@Entity({ name: "subscription" })
@Index(["shopId", "createdAt"])
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  shopId!: string;

  @ManyToOne(() => Shop, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shopId" })
  shop!: Shop;

  @Column({ type: "varchar", nullable: true })
  shopifySubscriptionGid!: string | null;

  @Column({ type: "varchar" })
  planName!: "Basic" | "Pro" | "Business";

  @Column({ type: "varchar", default: "pending" })
  status!: "active" | "pending" | "cancelled" | "frozen" | "trialing";

  @Column({ type: "timestamptz", nullable: true })
  currentPeriodStart!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  currentPeriodEnd!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  trialEndsAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
