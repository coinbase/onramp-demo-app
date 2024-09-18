"use client";
import Image from "next/image";
import { Card, Link } from "@nextui-org/react";
import WalletBox from "../components/WalletBox";

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
              4. Copy the developer <b>project id</b> to{" "}
              <b>app_id/app_id.json</b>, and add unique <b>user_id</b> for test
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
        <WalletBox />
      </div>
    </div>
  );
}
