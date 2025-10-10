import Head from "next/head";
import type { GetServerSidePropsContext } from "next";
import { ShopifyContext } from "@/utils/ShopifyContext";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const shopifyCtx = ShopifyContext.init(context);

  return {
    props: {
      shop: shopifyCtx.getShop(),
      idToken: shopifyCtx.getIdToken(),
    },
  };
}

export default function Home() {
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
<s-page heading="Welcome to your Shopify App Template">
      <s-section>
        <s-box
          padding="base"
          background="subdued"
          border="base"
          borderRadius="base"
        >
          <s-text>
            Welcome to your Shopify App Template
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
