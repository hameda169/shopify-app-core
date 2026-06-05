import { DataSource, type DataSourceOptions, type EntitySchema } from "typeorm";

import { setDataSource } from "./registry.js";
import { coreEntities } from "../entities/index.js";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type EntityClassOrSchema = Function | string | EntitySchema;

export interface CreateCoreDataSourceOptions {
  /** App-specific entities, registered alongside the core entities (Shop, Session, Subscription, UserSettings). */
  entities?: EntityClassOrSchema[];
  /** Migration globs/classes. Migrations always live in the app, never in the core. */
  migrations?: DataSourceOptions["migrations"];
  /** Escape hatch: override any other TypeORM option. */
  overrides?: Partial<DataSourceOptions>;
}

/**
 * Build the standard Postgres DataSource from env (DB_HOST, DB_PORT, DB_USER,
 * DB_PASSWORD, DB_NAME), register core + app entities, and register the
 * instance with the core service layer.
 *
 * The app remains responsible for loading env (e.g. `import "dotenv/config"`)
 * before calling this.
 */
export function createCoreDataSource(options: CreateCoreDataSourceOptions = {}): DataSource {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? "devuser",
    password: process.env.DB_PASSWORD ?? "devpass",
    database: process.env.DB_NAME ?? "devdb",
    synchronize: false,
    logging: ["error", "warn"],
    entities: [...coreEntities, ...(options.entities ?? [])],
    migrations: options.migrations ?? ["src/database/migrations/*.ts"],
    ...(options.overrides as object | undefined),
  } as DataSourceOptions);
  setDataSource(dataSource);
  return dataSource;
}
