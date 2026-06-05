import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Shop } from "./Shop.js";

import type { PlanName, SubscriptionStatus } from "@hameda169/shopify-core-shared";

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
  planName!: PlanName;

  @Column({ type: "varchar", default: "pending" })
  status!: SubscriptionStatus;

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
