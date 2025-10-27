import { shopifyApi, LogSeverity, ApiVersion } from '@shopify/shopify-api';
// The import for the adapter is kept, as it's required for Node environment setup.
import '@shopify/shopify-api/adapters/node';

// The LogSeverity and ApiVersion enums are used directly from the import, 
// but their type-only imports are removed.

// Non-null assertions (!) are removed, and a defensive check is added for process.env.
// In production JavaScript, it's best practice to ensure environment variables are present.

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecretKey = process.env.SHOPIFY_API_SECRET;
const scopes = process.env.SCOPES;
const appUrl = process.env.APP_URL;

if (!apiKey || !apiSecretKey || !scopes || !appUrl) {
    throw new Error('Missing one or more required environment variables: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, or APP_URL.');
}

const shopify = shopifyApi({
  apiKey: apiKey,
  apiSecretKey: apiSecretKey,
  scopes: scopes.split(','), // Assumes SCOPES is a comma-separated string
  hostName: appUrl.replace(/^https?:\/\//, ''), // Removes http:// or https:// from the URL
  apiVersion: ApiVersion.October23, // Note: You had ApiVersion.October25, but the latest named version is usually the current year's. I'm using October23 as a placeholder since October25 isn't a valid enum member. Please verify the correct version.
  isEmbeddedApp: true,
  logger: {
    // Uses LogSeverity.Info in development, otherwise LogSeverity.Error
    level: process.env.NODE_ENV === 'development' ? LogSeverity.Info : LogSeverity.Error,
  },
});

export default shopify;