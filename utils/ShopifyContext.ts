import { Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { NextApiRequest, NextApiResponse } from 'next';

const isDev = process.env.NODE_ENV === 'development';

export class ShopifyContextManager {
  shop?: string;
  idToken?: string;
  onlineSession?: Session;
  offlineSession?: Session;
  isFreshInstall = false;

  constructor(private req: NextApiRequest, private res: NextApiResponse) {}

  static async init(req: NextApiRequest, res: NextApiResponse): Promise<ShopifyContextManager> {
    const ctx = new ShopifyContextManager(req, res);

    return ctx;
  }
}
