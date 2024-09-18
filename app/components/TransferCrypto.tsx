import { Textarea } from "@nextui-org/input";
import { Button, Card, Link } from "@nextui-org/react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { user_id } from "../../app_id/app_id.json";
import { getSellTransactionStatus, createTransfer } from "../utils/queries";

export default function TransferCryptoBox() {
  const [amount, setAmount] = useState(0);
  const [asset, setAsset] = useState("");
  const [network, setNetwork] = useState("");
  const [destination, setDestination] = useState("");
  const [transfer_link, setTransferLink] = useState("");
  const [transfer_result, setTransferResult] = useState("");

  useEffect(() => {
    const getOfframpTransaction = async () => {
      const transaction = await getSellTransactionStatus({
        partner_user_id: user_id,
      });
      try {
        if (transaction) {
          console.log(transaction);
          console.log(transaction.asset);
          setAmount(+transaction.sell_amount.value);
          setAsset(transaction.asset);
          // format the network name (e.g. "network/base-mainnet" -> "base-mainnet")
          setNetwork(transaction.network.split("/")[1]);
          setDestination(transaction.to_address);
        } else {
          setAmount(0);
          setAsset("");
          setNetwork("");
          setDestination("");
        }
      } catch (error) {
        alert(error);
        console.error(error);
      }
    };
    getOfframpTransaction();
  });

  const createTransferWrapper = useCallback(async () => {
    let response = await createTransfer({
      network: network,
      amount: amount,
      assetId: asset,
      destination: destination,
    });
    if (response.id != "") {
      setTransferLink(response.txh);
      let result = `Transfer Id: ${response.id}, status: ${response.status}`;
      setTransferResult(result);
    } else {
      setTransferResult("");
      setTransferLink("");
    }
  }, [network]);

  const offramp_transaction_details = useMemo(() => {
    if (asset == "") return "No active offramp transaction";
    return `Send  ${amount} ${asset} on ${network}\n` + `To ${destination}`;
  }, [asset]);

  return (
    <div className="flex flex-col w-full space-y-5">
      <Card id="Offramp transfer">
        <div>
          <section className="flex flex-row justify-between gap-10 p-10 pt-5">
            <div className="flex flex-col space-y-5 w-full">
              <Textarea
                className="flex-auto"
                isReadOnly
                label="offramp url"
                variant="bordered"
                value={offramp_transaction_details}
              />
              <Button
                className="w-full"
                isDisabled={network == "" || asset == "" || amount == 0}
                onClick={createTransferWrapper}
              >
                {" "}
                Transfer{" "}
              </Button>
              <Link color="success" href={transfer_link} isExternal>
                {" "}
                <b>{transfer_result}</b>{" "}
              </Link>
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}
