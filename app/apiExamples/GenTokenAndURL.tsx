import { Input } from "@nextui-org/input";
import { Code } from "@nextui-org/code";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { useState, useCallback, useMemo, ChangeEvent } from "react";

import {Card, Link, Select, SelectItem} from "@nextui-org/react";
import { AggregatorInputParams} from "../utils/types";

const blockchainOptions = [
  {key: 'ethereum', label: 'ethereum'},
  {key: 'polygon', label: 'polygon'},
]

export default function GenTokenAndURL ({ aggregatorInputs, showBuyQuoteURLText, blockchains }: { aggregatorInputs?: AggregatorInputParams, showBuyQuoteURLText?: boolean, blockchains?: string[]}) {
  const [secureToken, setSecureToken] = useState("");
  const [ethAddress, setEthAddress] = useState("");

  const [blockchainOption, setBlockchainOption] = useState("ethereum");
  const handleNetworkChange = (e) => {
    setBlockchainOption(e.target.value);
  }

  const generateSecureToken = useCallback(async () => {
    console.log("generateSecureToken");
    fetch("/api/secure-token", {
      method: "POST",
      body: JSON.stringify({ ethAddress, blockchains: blockchains || [blockchainOption]}),
    }) 
      .then(async (response) => {
        const json = await response.json();
        if(response.ok) {
          setSecureToken(json.token);
        } else {
          alert("Error generating token: "+json.error);
          console.log("Error generating token: "+json.error);
        }
      });
  }, [ethAddress, blockchains]);

  const linkReady = useMemo(() => secureToken.length > 0, [secureToken]);

  const link = useMemo(() => {
    if (!linkReady) return "Generate a secure token first to create your one time URL";
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
  <h2> The generated link initializes the Coinbase Onramp URL with the appropriate parameters to execute that buy in just one click for the user. </h2>:
  <h2>Generate a secure one time URL to launch an Onramp session.</h2>

  const buyQuoteURLDirections = (
    <div className="flex flex-col ml-10 gap-1 w-2/5">
      <h2 > 1. Generate a Buy Quote in the section above to get the input parameters to create a secure Onramp URL. </h2>
      <h2> 2. Enter a <b>destination wallet address</b> and then click <b>&lsquo;Generate secure token&rsquo;</b>. </h2>
      <h2> 3. Click <b> Launch Onramp </b> to see the one-click buy experience for your users. </h2>
    </div>
      
  )

  return ( 
    <Card>
      <div className="flex flex-col p-10 pb-5 gap-1">
        <h1 className="font-bold underline"> <Link color="foreground" href="https://docs.cdp.coinbase.com/onramp/docs/api-initializing/" isExternal> Generate Secure Onramp Token & URL: </Link> </h1>
        {helperText}
      </div>
      {showBuyQuoteURLText && buyQuoteURLDirections}

    <section className="flex flex-row justify-between gap-10 p-10 pt-5">
      <div className="flex flex-col space-y-5 w-full">
        <Input
          className="flex w-full"
          type="text"
          label="Destination Wallet Address"
          placeholder="Enter your address"
          value={ethAddress}
          onValueChange={(value) => {
            setEthAddress(value);
            setSecureToken("");
          }}
          isRequired
        />

        {!showBuyQuoteURLText &&
          <Select
            className="flex w-full"
            name="blockchain_option"
            label="Blockchain Network"
            placeholder="Select a network"
            isRequired
            defaultSelectedKeys={[blockchainOption]}
            onChange={handleNetworkChange}
            >
            {blockchainOptions.map((blockchain) => <SelectItem key={blockchain.key}> {blockchain.label} </SelectItem>)}
          </Select>}

        <Button
          onClick={generateSecureToken}
          isDisabled={(ethAddress.length === 0 && !blockchainOption && !blockchains)
          }
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


      <div className="flex flex-col space-y-5 w-full">
        <Textarea
          className="flex-auto"
          isReadOnly
          label="Onramp URL"
          variant="bordered"
          value={link}
        />
        <Button isDisabled={!linkReady} color="primary" onClick={launch}>
          Launch Onramp
        </Button>
      </div>

    </section>
    </Card>
)}