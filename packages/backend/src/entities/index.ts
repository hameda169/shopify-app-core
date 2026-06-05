export { Shop } from "./Shop.js";
export { Session } from "./Session.js";
export { Subscription } from "./Subscription.js";
export { UserSettings } from "./UserSettings.js";

import { Session } from "./Session.js";
import { Shop } from "./Shop.js";
import { Subscription } from "./Subscription.js";
import { UserSettings } from "./UserSettings.js";

/** Entities every app registers in its DataSource, alongside its own app-specific entities. */
export const coreEntities = [Shop, Session, Subscription, UserSettings];
