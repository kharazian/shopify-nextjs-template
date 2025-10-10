import type { GetServerSidePropsContext } from "next";

export class ShopifyContext {
  private shop: string;
  private idToken: string;

  private constructor(context: GetServerSidePropsContext) {
    this.shop = extractString(context.query.shop);
    this.idToken = extractString(context.query.id_token);
  }

  static init(context: GetServerSidePropsContext): ShopifyContext {
    return new ShopifyContext(context);
  }

  getShop(): string {
    return this.shop;
  }

  getIdToken(): string {
    return this.idToken;
  }
}

const extractString = (param: string | string[] | undefined): string => {
  if (typeof param === "string") return param;
  if (Array.isArray(param)) return param[0] || "";
  return "";
};
