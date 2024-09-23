import type { NextApiRequest, NextApiResponse } from "next";
import { fetchWallet } from "./helpers";
import { TimeoutError } from "@coinbase/coinbase-sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqBody = JSON.parse(req.body);
  let { wallet } = await fetchWallet(reqBody.network);
  if (wallet != undefined) {
    console.log(
      `transfer ${reqBody.amount} ${reqBody.assetId.toLowerCase()} on ${
        reqBody.network
      } to ${reqBody.destination}`
    );
    let transfer = await wallet.createTransfer({
      amount: reqBody.amount,
      assetId: reqBody.assetId.toLowerCase(),
      destination: reqBody.destination,
      gasless: true,
    });

    // Wait for transfer to land on-chain.
    try {
      transfer = await transfer.wait();
    } catch (err) {
      if (err instanceof TimeoutError) {
        console.log("Waiting for transfer timed out");
      } else {
        console.error("Error while waiting for transfer to complete: ", err);
      }
    }

    // Check if transfer successfully completed on-chain
    if (transfer.getStatus() === "complete") {
      console.log("Transfer completed on-chain: ", transfer.toString());
    } else {
      console.error("Transfer failed on-chain: ", transfer.toString());
    }
    return res.json({
      id: transfer.getId(),
      status: transfer.getStatus(),
      txh: transfer.getTransactionLink(),
    });
  }
}
