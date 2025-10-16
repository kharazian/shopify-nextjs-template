import { Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

const isDev = process.env.NODE_ENV === 'development';

export class ShopifyRequestContext {
  private _shop?: string;
  private _token?: string;
  private _onlineSession?: Session;
  private _offlineSession?: Session;

  constructor() {}

  static async fromSSR(context: GetServerSidePropsContext): Promise<ShopifyRequestContext> {
    const ctx = new ShopifyRequestContext();
    ctx._token = normalizeQueryParam(context.query.id_token);
    ctx._shop = normalizeQueryParam(context.query.shop);
    await ctx.resolve();
    return ctx;
  }

  static withShopifySession() {
    return function wrapHandler(
      handler: (req: NextApiRequest & { user_shop?: string }, res: NextApiResponse) => Promise<void>
    ) {
      return async function wrapped(req: NextApiRequest, res: NextApiResponse) {
        try {
          const ctx = new ShopifyRequestContext();
          ctx._token = req.headers['authorization']?.replace('Bearer ', '');
          await ctx.resolve();

          await handler(req, res);
        } catch (err) {
          console.error('Middleware error:', err);
          res.status(401).json({ error: 'Unauthorized' });
        }
      };
    };
  }

  private async resolve() {
    if (!this._token) throw new Error('Missing session token');
  }

  getShop() {
    return this._shop || '';
  }
}
export type ShopifyApiRequest = NextApiRequest & {
  shop?: string;
  session?: Session;
 };

function normalizeQueryParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
