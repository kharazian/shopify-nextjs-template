// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { ShopifyRequestContext, ShopifyApiRequest } from '@/utils/ShopifyRequestContext ';

type Data = {
  name: string;
};

const handler = async (req: ShopifyApiRequest, res: NextApiResponse<Data>) => {
  const query = `
        {
          shop {
            name
          }
        }
      `;
  const graphqlClient = await req.ctx.graphql();
  const response = await graphqlClient.request(query);

  const storeClient = await req.ctx.storefront();
  const { data, errors, extensions } = await storeClient.request(query);
  res.status(200).json({ name: req.ctx.shop });
};

export default ShopifyRequestContext.withShopifySession()(handler);
