import Router from "@koa/router";

import { getShopify } from "../lib/shopify.js";
import { parseAndNormalizeSettings } from "../utils/themeSettings.js";

import type { ApiContext } from "../types.js";

/**
 * Routes shared by every app's authenticated /api router: /shop-info and
 * /check-app-embed. Mount after apiAuth:
 *
 *   apiRouter.use(apiAuth);
 *   apiRouter.use(createCoreApiRoutes().routes());
 *
 * /check-app-embed reads SHOPIFY_APP_EMBED_BLOCK_NAME and
 * SHOPIFY_APP_EMBED_EXTENSION_ID from env.
 */
export function createCoreApiRoutes(): Router {
  const router = new Router();

  router.get("/shop-info", async (ctx: ApiContext) => {
    const client = new (getShopify().clients.Graphql)({ session: ctx.state.userSession });
    const result = await client.request(`query { shop { name id email } }`);
    ctx.body = { result };
  });

  router.get("/check-app-embed", async (ctx: ApiContext) => {
    const client = new (getShopify().clients.Graphql)({ session: ctx.state.userSession });

    const BLOCK_NAME = process.env.SHOPIFY_APP_EMBED_BLOCK_NAME;
    const EXTENSION_ID = process.env.SHOPIFY_APP_EMBED_EXTENSION_ID;
    const SETTINGS_FILE = "config/settings_data.json";

    const { data } = await client.request<{
      themes: {
        edges: {
          node: { id: string; name: string; role: string; files: { nodes: { filename: string; body: { content: string } }[] } };
        }[];
      };
    }>(`
      query GetMainTheme {
        themes(first: 1, roles: [MAIN]) {
          edges {
            node { id name role files(filenames: ["${SETTINGS_FILE}"]) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } }
          }
        }
      }
    `);

    const theme = data?.themes.edges[0].node;
    const content = theme?.files.nodes[0].body.content;
    if (content == null) {
      ctx.status = 404;
      ctx.body = { error: "Theme settings not found" };
      return;
    }

    const settingsData = parseAndNormalizeSettings(content);
    const blocks = Object.values(settingsData.current.blocks ?? {});
    const appEmbedBlock = blocks.find((b) => b.type.includes(`/blocks/${BLOCK_NAME}/${EXTENSION_ID}`));
    const isEnabled = appEmbedBlock != null ? !appEmbedBlock.disabled : false;
    ctx.body = {
      isEnabled,
      editorUrl: `https://${ctx.state.userShop}/admin/themes/current/editor?context=apps&activateAppId=${EXTENSION_ID}/${BLOCK_NAME}`,
    };
  });

  return router;
}
