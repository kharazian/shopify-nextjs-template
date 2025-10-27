import ShopifyRequestContext from "@/utils/ShopifyRequestContext";
import { useEffect, useState } from "react";

export async function getServerSideProps(context) {
  const shopifyCtx = await ShopifyRequestContext.fromSSR(context);

  return {
    props: {
      shop: shopifyCtx.shop,
    },
  };
}

export default function Home({ shop }) {
  const [shopName, setShopName] = useState("empty");

  useEffect(() => {
    fetch("/api/hello").then(async res => {
      const data = await res.json();
      console.log(data);
      if (data?.name) {
        setShopName(data.name);
      }
    });
  }, []);


  return (
    <>
      <s-page heading="QR codes">
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-grid justifyItems="center" maxBlockSize="450px" maxInlineSize="450px">
              <s-heading>Test Appliation</s-heading>
              <s-paragraph>
                This is the test application ({shopName}).
              </s-paragraph>
            </s-grid>
          </s-grid>
        </s-section>
      </s-page>
    </>
  );
}
