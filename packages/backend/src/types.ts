import { Session as ShopifySession } from "@shopify/shopify-api";

import type { DefaultContext, DefaultState, ParameterizedContext } from "koa";

export interface ApiContext<ResponseBodyT = unknown> extends ParameterizedContext<DefaultState, DefaultContext, ResponseBodyT> {
  state: {
    userSession: ShopifySession;
    userShop: string;
  };
}

export interface WebhookContext<ResponseBodyT = unknown> extends ParameterizedContext<DefaultState, DefaultContext, ResponseBodyT> {
  state: {
    webhookTopic: string;
    webhookShop: string;
  };
}
