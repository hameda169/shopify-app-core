import { getDataSource } from "../db/registry.js";
import { Session, Shop } from "../entities/index.js";

export async function saveShop(shopData: Partial<Shop> & { shopifyDomain: string }): Promise<Shop> {
  const repo = getDataSource().getRepository(Shop);
  let shop = await repo.findOne({ where: { shopifyDomain: shopData.shopifyDomain } });
  if (shop == null) {
    shop = repo.create({ ...shopData, isInstalled: true, installedAt: new Date(), lastActiveAt: new Date() });
  } else {
    Object.assign(shop, shopData);
    shop.isInstalled = true;
    shop.uninstalledAt = null;
    shop.lastActiveAt = new Date();
  }
  return await repo.save(shop);
}

export async function getShopByDomain(shopifyDomain: string): Promise<Shop | null> {
  const repo = getDataSource().getRepository(Shop);
  return await repo.findOne({ where: { shopifyDomain } });
}

export async function saveSession(sessionData: { id: string; shopId: string; sessionData: unknown; isOnline?: boolean }): Promise<Session> {
  const repo = getDataSource().getRepository(Session);
  let session = await repo.findOne({ where: { id: sessionData.id } });
  if (session == null) {
    session = repo.create({ ...sessionData, isOnline: sessionData.isOnline ?? false });
  } else {
    Object.assign(session, sessionData);
  }
  return await repo.save(session);
}

export async function getSessionById(id: string, online?: boolean): Promise<Session | null> {
  const repo = getDataSource().getRepository(Session);
  return await repo.findOne({ where: { id, isOnline: online }, relations: ["shop"] });
}

export async function getSessionByShop(shopifyDomain: string, online?: boolean): Promise<Session | null> {
  const repo = getDataSource().getRepository(Session);
  return await repo.findOne({ where: { isOnline: online, shop: { shopifyDomain } }, relations: ["shop"] });
}

export async function deleteSession(sessionId: string): Promise<void> {
  const repo = getDataSource().getRepository(Session);
  await repo.delete({ id: sessionId });
}

export async function markShopAsUninstalled(shopifyDomain: string): Promise<void> {
  const shopRepo = getDataSource().getRepository(Shop);
  const shop = await shopRepo.findOne({ where: { shopifyDomain } });
  if (shop == null) return;
  shop.isInstalled = false;
  shop.uninstalledAt = new Date();
  await shopRepo.save(shop);

  const sessionRepo = getDataSource().getRepository(Session);
  await sessionRepo.delete({ shopId: shop.id });
}
