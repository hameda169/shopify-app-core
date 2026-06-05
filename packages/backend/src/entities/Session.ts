import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

import { Shop } from "./Shop.js";

@Entity({ name: "session" })
export class Session {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column({ type: "uuid" })
  shopId!: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: "shopId" })
  shop!: Shop;

  @Column({ type: "jsonb" })
  sessionData!: unknown;

  @Column({ type: "boolean", default: false })
  isOnline!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
