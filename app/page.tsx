"use client";
import Image from "next/image";

import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";
import GenTokenAndURL from "./apiExamples/GenTokenAndURL";
import GenBuyQuote from "./apiExamples/GenBuyQuote";

export default function Home() {
  return (
    <div className="space-y-10 size-full">
      <Card className="flex flex-row justify-between p-5 w-full">

        <div className="flex flex-col space-y-5">
          <div className="inline-block max-w-lg text-center">
            <h1 className="text-4xl font-bold">Coinbase Onramp Demo App</h1>
          </div>
          <div className="inline-block max-w-lg text-left">
            <p className="text-lg">Instructions:</p>
            <p className="text-lg">
              1. Go to the CDP portal and create a project.{" "}
            </p>
            <p className="text-lg">
              2. Click on the Onramp tab and configure your integration.{" "}
            </p>
            <p className="text-lg">
              3. Navigate to the API keys page and download a private key. Copy
              the private key file to api_keys/cdp_api_key.json. 
            </p>
          </div>
        </div>
          <Image
            src="/cdp.svg"
            alt="Next.js Logo"
            width={500}
            height={37}
            priority
            className="flex flex-col mr-10"
          />
      </Card>

      <div className="flex w-full flex-col gap-5">
      <Tabs aria-label="Options">
        <Tab key="genToken" title="Generate Onramp Token + URL">
            <GenTokenAndURL />
        </Tab>
        <Tab key="buyQuote" title="Generate Buy Quote">
          <GenBuyQuote />
        </Tab>
      </Tabs>
      </div>  
    </div>
  );
}
