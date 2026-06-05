import type { DataSource } from "typeorm";

let _dataSource: DataSource | null = null;

/**
 * Register the app's DataSource with the core. Must be called once at startup
 * (createCoreDataSource does this automatically) before any core service runs.
 */
export function setDataSource(dataSource: DataSource): void {
  _dataSource = dataSource;
}

export function getDataSource(): DataSource {
  if (_dataSource == null) {
    throw new Error("@my-core/backend: no DataSource registered. Call createCoreDataSource(...) or setDataSource(...) at startup.");
  }
  return _dataSource;
}
