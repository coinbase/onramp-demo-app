import { Textarea } from "@nextui-org/input";
import { Button, Card, Link, Select, SelectItem } from "@nextui-org/react";
import { useState, useCallback, ChangeEvent, useMemo } from "react";
import appInfo from "../../app_id/app_id.json";
import { generateWallet } from "../utils/queries";
import { NETWORK_LIST } from "../utils/networks";

export default function WalletBox() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState("");
  const [onramp_link, setOnrampLink] = useState("");
  const [offramp_link, setOfframpLink] = useState("");
  const redirectUrl = "http://localhost:3000/wallet/sell";

  const setNetworkOption = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setNetwork(event.target.value);
    },
    []
  );

  const generateWalletWrapper = useCallback(async () => {
    const wallet = await generateWallet({ network_id: network });
    try {
      if (wallet) {
        console.log(wallet.balance);
        setAddress(wallet.wallet_address);
        setNetwork(wallet.network_id);
        setBalance(wallet.balance);
      } else {
        setAddress("");
        setNetwork("");
        setBalance("");
      }
    } catch (error) {
      alert(error);
      console.error(error);
    }
  }, [network]);

  const generateOnrampLink = useCallback(async () => {
    let shorten_network = network.split("-")[0];
    setOnrampLink(
      `https://pay.coinbase.com/buy/select-asset?appId=${appInfo.project_id}` +
        `&addresses={"${address}":["${shorten_network}"]}`
    );
  }, [address, network]);

  const generateOfframpLink = useCallback(async () => {
    let shorten_network = network.split("-")[0];
    setOfframpLink(
      `https://pay.coinbase.com/v3/sell/input?appId=${appInfo.project_id}` +
        `&addresses={"${address}":["${shorten_network}"]}&redirectUrl=${redirectUrl}&partnerUserId=${appInfo.user_id}`
    );
  }, [address, network, appInfo.user_id]);

  const launch_onramp = useCallback(() => {
    open(onramp_link, "_blank", "popup,width=540,height=700");
  }, [onramp_link]);

  const launch_offramp = useCallback(() => {
    open(offramp_link, "_blank", "popup,width=540,height=700");
  }, [offramp_link]);

  const wallet_address = useMemo(() => {
    if (address.length == 0) return "Generate or Load a wallet";
    return `${address}`;
  }, [address]);

  const wallet_balance = useMemo(() => {
    if (balance.length == 0) return "Generate or Load a wallet";
    return balance;
  }, [balance]);

  return (
    <div className="flex flex-col w-full space-y-5">
      <Card id="Offramp">
        <div className="flex flex-col p-4 pb-5 gap-1">
          <h1 className="font-bold underline">
            {" "}
            <Link
              color="foreground"
              href="https://docs.cdp.coinbase.com/mpc-wallet/docs/welcome"
              isExternal
            >
              {" "}
              Generate/Load a wallet:{" "}
            </Link>{" "}
          </h1>
          <h2>
            Generate Or Reload a{" "}
            <b>
              <Link
                color="foreground"
                href="https://docs.cdp.coinbase.com/mpc-wallet/docs/welcome"
                isExternal
              >
                {" "}
                MPC Wallet{" "}
              </Link>{" "}
            </b>
            with a supporting blockhain network.
          </h2>
        </div>
        <div>
          <section className="flex flex-row justify-between gap-10 p-10 pt-5">
            <div className="flex flex-col space-y-5 w-full">
              <Select
                className="flex w-full"
                name="blockchain-option"
                label="Blockchain Network"
                placeholder="Select a network"
                onChange={setNetworkOption}
                items={NETWORK_LIST}
                isRequired
              >
                {(curr) => <SelectItem key={curr.id}>{curr.name}</SelectItem>}
              </Select>
              <Button
                className="w-full"
                onClick={generateWalletWrapper}
                isDisabled={network == ""}
              >
                Generate Wallet{" "}
              </Button>
            </div>

            <div className="flex flex-col space-y-5 w-full">
              <Textarea
                className="flex-auto"
                isReadOnly
                label="wallet address"
                variant="bordered"
                rows={1}
                value={wallet_address}
              />
              <Textarea
                className="flex-auto"
                isReadOnly
                label="wallet balance"
                variant="bordered"
                rows={1}
                value={wallet_balance}
              />
            </div>
          </section>
        </div>
      </Card>
      <Card id="Onramp">
        <div className="flex flex-col p-4 pb-5 gap-1">
          <h1 className="font-bold underline">
            {" "}
            <Link
              color="foreground"
              href="https://docs.cdp.coinbase.com/onramp/docs/api-initializing/"
              isExternal
            >
              {" "}
              Generate an Onramp Link{" "}
            </Link>{" "}
          </h1>
        </div>
        <div>
          <section className="flex flex-row justify-between gap-10 p-10 pt-5">
            <div className="flex flex-col space-y-5 w-full">
              <Button
                className="w-full"
                onClick={generateOnrampLink}
                isDisabled={address == ""}
              >
                Generate URL{" "}
              </Button>
              <Button
                className="w-full"
                onClick={launch_onramp}
                isDisabled={onramp_link == ""}
              >
                {" "}
                Launch Onramp{" "}
              </Button>
            </div>
            <div className="flex flex-col space-y-5 w-full">
              <Textarea
                className="flex-auto"
                isReadOnly
                label="onramp url"
                variant="bordered"
                value={onramp_link}
              />
            </div>
          </section>
        </div>
      </Card>
      <Card id="Offramp">
        <div className="flex flex-col p-4 pb-5 gap-1">
          <h1 className="font-bold underline">
            {" "}
            <Link
              color="foreground"
              href="https://docs.cdp.coinbase.com/onramp/docs/api-initializing/"
              isExternal
            >
              {" "}
              Generate an Offramp Link:{" "}
            </Link>{" "}
          </h1>
        </div>
        <div>
          <section className="flex flex-row justify-between gap-10 p-10 pt-5">
            <div className="flex flex-col space-y-5 w-full">
              <Button
                className="w-full"
                onClick={generateOfframpLink}
                isDisabled={address == ""}
              >
                Generate URL{" "}
              </Button>
              <Button
                className="w-full"
                onClick={launch_offramp}
                isDisabled={offramp_link == ""}
              >
                {" "}
                Launch Offramp{" "}
              </Button>
            </div>
            <div className="flex flex-col space-y-5 w-full">
              <Textarea
                className="flex-auto"
                isReadOnly
                label="offramp url"
                variant="bordered"
                value={offramp_link}
              />
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}
