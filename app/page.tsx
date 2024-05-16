"use client";
import { Input } from "@nextui-org/input";
import { Code } from "@nextui-org/code";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { useState, useCallback, useMemo } from "react";
import Image from "next/image";

export default function Home() {
  const [secureToken, setSecureToken] = useState("");
  const [ethAddress, setEthAddress] = useState("");

  const generateSecureToken = useCallback(async () => {
    console.log("generateSecureToken");
    fetch("/api/secure-token", {
      method: "POST",
      body: JSON.stringify({ ethAddress }),
    }) 
      .then(async (response) => {
        const json = await response.json();
        if(response.ok) {
          setSecureToken(json.token);
        } else {
          console.log("Error generating token: "+json.error);
        }
      });
  }, [ethAddress]);

  const linkReady = useMemo(() => secureToken.length > 0, [secureToken]);

  const link = useMemo(() => {
    if (!linkReady) return "Create a secure token to generate a URL";

    return (
      "https://pay.coinbase.com/buy/select-asset?sessionToken=" + secureToken
    );
  }, [linkReady, secureToken]);

  const launch = useCallback(() => {
    open(link, "_blank", "popup,width=540,height=700")
  }, [link]);

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <Image
        src="/cdp.svg"
        alt="Next.js Logo"
        width={180}
        height={37}
        priority
        className="align-center"
      />
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className="text-4xl">Coinbase Onramp demo app</h1>
      </div>
      <div className="inline-block max-w-lg text-left justify-center">
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

      <div style={{ width: "600px" }} className="flex">
        <Input
          type="text"
          label="ETH Address"
          placeholder="Enter your address"
          value={ethAddress}
          onValueChange={(value) => {
            setEthAddress(value);
            setSecureToken("");
          }}
        />
      </div>

      <Button
        onClick={generateSecureToken}
        isDisabled={ethAddress.length === 0}
      >
        Generate secure token
      </Button>

      {secureToken.length > 0 && (
        <>
          <h4 className="text-medium">Onramp token:</h4>
          <Code>{secureToken}</Code>
        </>
      )}

      <Divider className="my-4" />

      <Textarea
        isReadOnly
        label="Onramp URL"
        variant="bordered"
        labelPlacement="outside"
        value={link}
        className="max-w-xs"
      />

      <Button isDisabled={!linkReady} color="primary" onClick={launch}>
        Launch CB Onramp
      </Button>
    </section>
  );
}
