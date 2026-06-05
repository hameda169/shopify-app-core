import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Shop } from "./Shop.js";

const DEFAULT_USER_SETTINGS = {
  emailAddress: "",
  emailUpdates: true,
  weeklyReports: false,
};

@Entity({ name: "user_setting" })
export class UserSettings {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", unique: true })
  shopId!: string;

  @OneToOne(() => Shop, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shopId" })
  shop!: Shop;

  @Column({ type: "varchar", default: DEFAULT_USER_SETTINGS.emailAddress })
  emailAddress = DEFAULT_USER_SETTINGS.emailAddress;

  @Column({ type: "boolean", default: DEFAULT_USER_SETTINGS.emailUpdates })
  emailUpdates = DEFAULT_USER_SETTINGS.emailUpdates;

  @Column({ type: "boolean", default: DEFAULT_USER_SETTINGS.weeklyReports })
  weeklyReports = DEFAULT_USER_SETTINGS.weeklyReports;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
