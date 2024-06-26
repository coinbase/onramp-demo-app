import { Input } from "@nextui-org/input";
import { Code } from "@nextui-org/code";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { useState, useCallback, useMemo, ChangeEvent } from "react";

import {Card, Link, Select, SelectItem} from "@nextui-org/react";
import { GenerateSecureTokenRequest } from "../utils/types";
import { generateSecureToken } from "../utils/queries";
import { BLOCKCHAIN_LIST } from "../utils/blockchains";

export default function SecureTokenBox({ aggregatorInputs, showBuyQuoteURLText, blockchains }: GenerateSecureTokenRequest) {
  const [secureToken, setSecureToken] = useState("");
  const [ethAddress, setEthAddress] = useState("");

  const [blockchainOption, setBlockchainOption] = useState("");

  const setBlockchain = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setBlockchainOption(event.target.value);
  }, []);

  const secureTokenWrapper = useCallback(async () => {
    const response = await generateSecureToken({ethAddress, blockchains: showBuyQuoteURLText ? blockchains : [blockchainOption.toLowerCase()]})
    console.log("generateSecureToken");
    try {
      if (response) {setSecureToken(response);} else {setSecureToken('')}
    } catch (error) {
      console.log(error)
      alert(error);
      console.error(error);
    }}, [ethAddress,  showBuyQuoteURLText, blockchains, blockchainOption]);

  const linkReady = useMemo(() => secureToken.length > 0, [secureToken]);

  const link = useMemo(() => {
    if (!linkReady) return "Generate a secure token first to create your one time URL";
    return (
      `https://pay.coinbase.com/buy/select-asset?sessionToken=${secureToken}` + 
      (aggregatorInputs?.quoteID ? `&quoteId=${aggregatorInputs.quoteID}` : "") +
      (aggregatorInputs?.defaultAsset ? `&defaultAsset=${aggregatorInputs.defaultAsset}` : "") +
      (aggregatorInputs?.defaultPaymentMethod ? `&defaultPaymentMethod=${aggregatorInputs.defaultPaymentMethod}` : "") +
      (aggregatorInputs?.defaultNetwork ? `&defaultNetwork=${aggregatorInputs.defaultNetwork}` : "") +
      (aggregatorInputs?.fiatCurrency ? `&fiatCurrency=${aggregatorInputs.fiatCurrency}` : "") +
      (aggregatorInputs?.presentFiatAmount ? `&presetFiatAmount=${aggregatorInputs.presentFiatAmount}` : "")
    );
  }, [linkReady, secureToken, aggregatorInputs]);

  const launch = useCallback(() => {
    open(link, "_blank", "popup,width=540,height=700")
  }, [link]);

  const helperText = showBuyQuoteURLText ?
  <h2> The generated link initializes the Coinbase Onramp URL with the appropriate parameters to execute that buy in just one click for the user. </h2> :
  <h2>Generate a secure one time URL to launch an Onramp session. Provide a <b>destination wallet address</b> and a supporting <b>blockhain network</b>.</h2>

  const buyQuoteURLDirections = (
    <div className="flex flex-col ml-10 gap-1 w-2/5">
      <h2 > 1. Generate a Buy Quote in the section above to get the input parameters to create a secure Onramp URL. </h2>
      <h2> 2. Enter a <b>destination wallet address</b> and a supporting <b>blockchain network</b> then click <b>&lsquo;Generate secure token&rsquo;</b>. </h2>
      <h2> 3. Click <b> Launch Onramp </b> to see the one-click buy experience for your users. </h2>
    </div>
  )

  return ( 
    <Card>
      <div className="flex flex-col p-10 pb-5 gap-1">
        <h1 className="font-bold underline"> <Link color="foreground" href="https://docs.cdp.coinbase.com/onramp/docs/api-initializing/" isExternal> Generate Secure Onramp Token & URL: </Link> </h1>
        {helperText}
      </div>
      

    
    {(!showBuyQuoteURLText || showBuyQuoteURLText && aggregatorInputs?.quoteID) &&  
      <div>
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
                name="blockchain-option"
                label="Blockchain Network"
                placeholder="Select a network"
                onChange={setBlockchain}
                items={BLOCKCHAIN_LIST}
                isRequired
              >
              {(curr) => <SelectItem key={curr.id}>{curr.name}</SelectItem>}
              </Select> }

            <Button
              onClick={secureTokenWrapper}
              isDisabled={
                (showBuyQuoteURLText && ethAddress.length === 0) ||
                (!showBuyQuoteURLText && (ethAddress.length === 0 || !blockchainOption))
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
      </div>}
    </Card>
)}