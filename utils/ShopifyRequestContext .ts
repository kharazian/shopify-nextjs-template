import { GraphqlClient, RequestedTokenType } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import validateJWT from './validateJWT';
import shopify from './shopify';
import { prisma } from '@/prisma/client';
const isDev = process.env.NODE_ENV === 'development';

export class ShopifyRequestContext {
  private _shop: string;
  private _token: string;
  private _onlineSessionId?: string;
  private _offlineSessionId?: string;

  constructor() {
    this._shop = '';
    this._token = '';
  }

  static async fromSSR(context: GetServerSidePropsContext): Promise<ShopifyRequestContext> {
    const ctx = new ShopifyRequestContext();
    ctx._token = normalizeQueryParam(context.query.id_token) || '';
    ctx.resolve();
    const store = await prisma.store.findFirst({ where: { shop: ctx._shop } });
    if (!store || store.isActive == false) {
      const shop = ctx._shop || '';
      ctx.getSession(RequestedTokenType.OfflineAccessToken);
      ctx.getSession(RequestedTokenType.OnlineAccessToken);
      await prisma.store.upsert({
        where: { shop },
        update: { shop, isActive: true },
        create: { shop, isActive: true },
      });
    }
    return ctx;
  }

  static withShopifySession() {
    return function wrapHandler(
      handler: (req: ShopifyApiRequest, res: NextApiResponse) => Promise<void>
    ) {
      return async function wrapped(req: NextApiRequest, res: NextApiResponse) {
        try {
          const ctx = new ShopifyRequestContext();
          ctx._token = req.headers['authorization']?.replace('Bearer ', '') || '';
          ctx.resolve();
          ctx._onlineSessionId = await shopify.session.getCurrentId({
            isOnline: true,
            rawRequest: req,
            rawResponse: res,
          });

          (req as ShopifyApiRequest).ctx = ctx;
          await handler(req as ShopifyApiRequest, res);
        } catch (err) {
          console.error('Middleware error:', err);
          res.status(401).json({ error: 'Unauthorized' });
        }
      };
    };
  }

  private resolve() {
    if (!this._token) throw new Error('Missing session token');
    const payload = validateJWT(this._token);
    this._shop = shopify.utils.sanitizeShop(payload.dest.replace('https://', '')) || '';
    if (!this._shop) throw new Error('Invalid shop');
    this._offlineSessionId = shopify.session.getOfflineId(this._shop);
  }

  public get shop(): string {
    return this._shop || '';
  }

  private async getSession(requestedTokenType: RequestedTokenType) {
    let id = this._offlineSessionId || '';
    if (requestedTokenType === RequestedTokenType.OnlineAccessToken) {
      id = this._onlineSessionId || '';
    }
    const sessionRecord = await prisma.shopifySession.findUnique({ where: { id } });
    if (sessionRecord && (sessionRecord.content || '').length > 0) {
      const dbSession = JSON.parse(sessionRecord.content || '');

      const isValid =
        !!dbSession?.accessToken &&
        (!dbSession.expiresAt || 
          dbSession.expiresAt.getTime() > Date.now());
      if (isValid) {
        return dbSession;
      }
    }
    const { session } = await shopify.auth.tokenExchange({
      shop: this._shop,
      sessionToken: this._token,
      requestedTokenType,
    });
    if (session) {
      await prisma.shopifySession.upsert({
        where: { id: session.id },
        update: {
          content: JSON.stringify(session),
          shop: session.shop,
        },
        create: {
          id: session.id,
          content: JSON.stringify(session),
          shop: session.shop,
        },
      });
    }
    return session;
  }

  public async graphql(): Promise<GraphqlClient> {
    const session = await this.getSession(RequestedTokenType.OfflineAccessToken);
    const client = new shopify.clients.Graphql({ session });
    return client;
  }

  public async storefront() {
    const session = await this.getSession(RequestedTokenType.OfflineAccessToken);
    const client = new shopify.clients.Storefront({ session });
    return client;
  }

  public async graphqlProxy(rawBody: string | Record<string, any>) {
    const session = await this.getSession(RequestedTokenType.OnlineAccessToken);
    const response = await shopify.clients.graphqlProxy({
      session,
      rawBody,
    });
    return response;
  }
}
export type ShopifyApiRequest = NextApiRequest & {
  ctx: ShopifyRequestContext;
};

function normalizeQueryParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
