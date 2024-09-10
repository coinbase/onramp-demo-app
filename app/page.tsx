"use client";
import Image from "next/image";

import { Tabs, Tab, Card, Link } from "@nextui-org/react";
import SecureTokenBox from "./components/SecureTokenBox";
import BuyQuoteBox from "./components/BuyQuoteBox";
import SellQuoteBox from "./components/SellQuoteBox";
import WalletBox from "./components/WalletBox";

export default function Home() {
  return (
    <div className="space-y-10 size-full">
      <Card className="flex flex-row justify-between p-5 w-full">
        <div className="flex flex-col space-y-5">
          <div className="inline-block max-w-lg text-center">
            <h1 className="text-4xl font-bold">Coinbase Onramp Demo App</h1>
          </div>
          <div className="inline-block max-w-lg text-left">
            <p className="text-lg font-bold">Instructions:</p>
            <p className="text-lg">
              1. Go to{" "}
              <Link
                href="https://portal.cdp.coinbase.com/products/onramp"
                isExternal
              >
                {" "}
                Onramp{" "}
              </Link>{" "}
              in your Coinbase Developer Platform and configure your integration{" "}
            </p>
            <p className="text-lg">
              2. Navigate to the{" "}
              <Link
                href="https://portal.cdp.coinbase.com/access/api"
                isExternal
              >
                {" "}
                API Keys{" "}
              </Link>{" "}
              tab and download a private key. <b>NOTE</b> - at minimum, this key
              only requires <b>VIEW ONLY PERMISSION</b>{" "}
            </p>
            <p className="text-lg">
              3. Copy the private key file to <b>api_keys/cdp_api_key.json</b>{" "}
              inside your onramp-demo-app repo.
            </p>
            <p className="text-lg">
              4. When creating your aggregator URL, first generate a buy config,
              then buy options, and finally generate a buy quote. Only then, can
              you input your wallet address and receive your One-Click-Buy link.
            </p>
          </div>
        </div>

        <div>
          <Image
            src="/cdp.svg"
            alt="Next.js Logo"
            width={200}
            height={37}
            priority
            className="flex flex-col"
          />
        </div>
      </Card>

      <div className="flex w-full flex-col gap-5">
        <Tabs aria-label="Options">
          <Tab key="genToken" title="Generate Onramp URL">
            <SecureTokenBox />
          </Tab>
          <Tab key="buyQuote" title="Generate Onramp Aggregator URL">
            <BuyQuoteBox />
          </Tab>
          <Tab key="sellQuote" title="Generate Offramp Aggregator URL">
            <SellQuoteBox />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
