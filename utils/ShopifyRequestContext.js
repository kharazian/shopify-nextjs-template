// lib/shopifyRequestContext.js

import { GraphqlClient, RequestedTokenType } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import validateJWT from './validateJWT';
import shopify from './shopify';
import { prisma } from '@/prisma/client';

const isDev = process.env.NODE_ENV === 'development';

function normalizeQueryParam(value) { return Array.isArray(value) ? value[0] : value; }

export class ShopifyRequestContext {
  _shop;
  _token;
  _onlineSessionId;
  _offlineSessionId;

  static async fromSSR(context) {
    const ctx = new ShopifyRequestContext();
    ctx._token = normalizeQueryParam(context.query.id_token) || '';
    ctx.resolve();
    const store = await prisma.store.findFirst({ where: { shop: ctx._shop } });
    if (!store || store.isActive == false) {
      const shop = ctx._shop || '';
      await ctx.getSession(RequestedTokenType.OfflineAccessToken);
      await ctx.getSession(RequestedTokenType.OnlineAccessToken);
      await prisma.store.upsert({ where: { shop }, update: { shop, isActive: true }, create: { shop, isActive: true }, });
    }
    return ctx;
  }

  static withShopifySession() {
    return function wrapHandler(handler) {
      return async function wrapped(req, res) {
        try {
          const ctx = new ShopifyRequestContext();
          ctx._token = req.headers['authorization']?.replace('Bearer ', '') || '';
          ctx.resolve();
          ctx._onlineSessionId = await shopify.session.getCurrentId({ isOnline: true, rawRequest: req, rawResponse: res, });
          req.ctx = ctx;
          await handler(req, res);
        } catch (err) {
          console.error('Middleware error:', err);
          res.status(401).json({ error: 'Unauthorized' });
        }
      };
    };
  }

  resolve() {
    if (!this._token) throw new Error('Missing session token');
    const payload = validateJWT(this._token);
    this._shop = shopify.utils.sanitizeShop(payload.dest.replace('https://', '')) || '';
    if (!this._shop) throw new Error('Invalid shop');
    this._offlineSessionId = shopify.session.getOfflineId(this._shop);
  }

  async getSession(requestedTokenType) {
    let id = this._offlineSessionId || '';
    if (requestedTokenType === RequestedTokenType.OnlineAccessToken) { id = this._onlineSessionId || ''; }
    const sessionRecord = await prisma.session.findUnique({ where: { id } });
    if (sessionRecord && (sessionRecord.content || '').length > 0) {
      const dbSession = JSON.parse(sessionRecord.content || '');
      const isValid = !!dbSession?.accessToken && (!dbSession.expiresAt || new Date(dbSession.expiresAt).getTime() > Date.now());
      if (isValid) { return dbSession; }
    }
    const { session } = await shopify.auth.tokenExchange({ shop: this._shop, sessionToken: this._token, requestedTokenType, });
    if (session) {
      await prisma.session.upsert({
        where: { id: session.id },
        update: { content: JSON.stringify(session), shop: session.shop, },
        create: { id: session.id, content: JSON.stringify(session), shop: session.shop, },
      });
    }
    return session;
  }

  async graphql() {
    const session = await this.getSession(RequestedTokenType.OfflineAccessToken);
    const client = new shopify.clients.Graphql({ session });
    return client;
  }

  async storefront() {
    const session = await this.getSession(RequestedTokenType.OfflineAccessToken);
    const client = new shopify.clients.Storefront({ session });
    return client;
  }

  async graphqlProxy(rawBody) {
    const session = await this.getSession(RequestedTokenType.OnlineAccessToken);
    const response = await shopify.clients.graphqlProxy({ session, rawBody, });
    return response;
  }

  get shop() { return this._shop; }
}

export default ShopifyRequestContext;