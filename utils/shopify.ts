import { shopifyApi, LogSeverity, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES!.split(','),
  hostName: process.env.APP_URL!.replace(/^https?:\/\//, ''),
  apiVersion: ApiVersion.October25,
  isEmbeddedApp: true,
  logger: {
    level: process.env.NODE_ENV === 'development' ? LogSeverity.Info : LogSeverity.Error,
  },
});

export default shopify;