"use client";
import Image from "next/image";

import { Tabs, Tab, Card, Link } from "@nextui-org/react";
import TransferCryptoBox from "../../components/TransferCrypto";

export default function Home() {
  return (
    <div className="space-y-10 size-full">
      <Card className="flex flex-row justify-between p-5 w-full">
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
        <TransferCryptoBox />
      </div>
    </div>
  );
}
