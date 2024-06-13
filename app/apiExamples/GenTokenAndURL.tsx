import { Input } from "@nextui-org/input";
import { Code } from "@nextui-org/code";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { useState, useCallback, useMemo } from "react";
import Image from "next/image";

import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";
import { AggregatorInputParams} from "../utils/types";

export default function GenTokenAndURL ({ aggregatorInputs, showBuyQuoteURLText }: { aggregatorInputs?: AggregatorInputParams, showBuyQuoteURLText?: boolean}) {
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
      "https://pay.coinbase.com/buy/select-asset?sessionToken=" + secureToken + 
      (aggregatorInputs?.quoteID ? "&quoteId=" + aggregatorInputs.quoteID : "") +
      (aggregatorInputs?.defaultAsset ? "&defaultAsset=" + aggregatorInputs.defaultAsset : "") +
      (aggregatorInputs?.defaultPaymentMethod ? "&defaultPaymentMethod=" + aggregatorInputs.defaultPaymentMethod : "") +
      (aggregatorInputs?.defaultNetwork ? "&defaultNetwork=" + aggregatorInputs.defaultNetwork : "") +
      (aggregatorInputs?.fiatCurrency ? "&fiatCurrency=" + aggregatorInputs.fiatCurrency : "") +
      (aggregatorInputs?.presentFiatAmount ? "&presetFiatAmount=" + aggregatorInputs.presentFiatAmount : "")
    );
  }, [linkReady, secureToken, aggregatorInputs]);

  const launch = useCallback(() => {
    open(link, "_blank", "popup,width=540,height=700")
  }, [link]);

  const helperText = showBuyQuoteURLText ?
  <h2> This link will be prepopulated with the quoteID and input parameters to the Buy Quote API, using query string parameters <br/> One-Click-Buy - the link takes you straight to the transaction, no selections needed! </h2>:
  <h2>Generate a secure one time URL to launch an Onramp session!</h2>

  return ( 
    <Card>
      <div className="flex flex-col p-10 -mb-20 gap-1">
        <h1 className="font-bold underline"> GENERATE SECURE ONRAMP TOKEN + URL: </h1>
        {helperText}
      </div>
    <section className="flex flex-row items-center gap-5 p-10">
      
      <div className="flex-col space-y-5">
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
          isRequired
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
      </div>

      <Divider orientation="vertical"/>


      <div className="flex-col space-y-5 w-full">
      <Textarea
        isReadOnly
        label="Onramp URL"
        variant="bordered"
        labelPlacement="outside"
        value={link}
      />

      <Button isDisabled={!linkReady} color="primary" onClick={launch}>
        Launch CB Onramp
      </Button>
      </div>
    </section>
    </Card>
)}