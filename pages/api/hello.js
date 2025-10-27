// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ShopifyRequestContext from "@/utils/ShopifyRequestContext";

const handler = async (req, res) => {
  res.status(200).json({ name: req.ctx.shop });
}

export default ShopifyRequestContext.withShopifySession()(handler);
