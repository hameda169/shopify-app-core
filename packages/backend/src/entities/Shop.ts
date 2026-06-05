import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "shop" })
export class Shop {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  shopifyDomain!: string;

  @Column({ type: "boolean", default: false })
  isInstalled!: boolean;

  @Column({ type: "varchar", default: "" })
  scopes!: string;

  @Column({ type: "varchar", default: "Basic" })
  planName!: "Basic" | "Pro" | "Business";

  @Column({ type: "varchar", default: "active" })
  subscriptionStatus!: "active" | "pending" | "cancelled" | "trialing";

  @Column({ type: "timestamptz", nullable: true })
  trialEndsAt!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  installedAt!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  uninstalledAt!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  lastActiveAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
