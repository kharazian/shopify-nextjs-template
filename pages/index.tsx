import Head from "next/head";
import type { GetServerSidePropsContext } from "next";
import { ShopifyRequestContext } from "@/utils/ShopifyRequestContext ";
import { useEffect, useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const shopifyCtx = await ShopifyRequestContext.fromSSR(context);

  return {
    props: {
      shop: shopifyCtx.shop,
    },
  };
}

export default function Home() {
  const [shopName , setShopName] = useState("empty");

  async function getShopName() {
    const res = await fetch("api/hello")    
    const data = await res.json();
    console.log(data);
    if(data?.name) {
      setShopName(data.name);
    }
  }

  useEffect(() => {
    getShopName();
  }, []);

  return (
    <>
      <Head>
        <title>Shopify App Template</title>
        <meta
          name="description"
          content="A scalable Shopify app template using React 19, Polaris Web Components, and Prisma."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
<s-page heading="Shopify App Template">
      <s-section>
        <s-box
          padding="base"
          background="subdued"
          border="base"
          borderRadius="base"
        >
          <s-text>
            Shopify App Template -- {shopName}
          </s-text>
          <s-paragraph>
            Built with React 19, Polaris Web Components, Prisma, and MongoDB.
          </s-paragraph>
        </s-box>
      </s-section>
    </s-page>
    </>
  );
}
