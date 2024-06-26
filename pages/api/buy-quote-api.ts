import type { NextApiRequest, NextApiResponse } from "next";
import { createRequest } from "./helpers";

type BuyQuoteRequest = {
  purchase_currency: string;
  payment_amount: string;
  payment_currency: string;
  payment_method: string;
  country: string;
  payment_network?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const request_method = "POST";
  const {url, jwt} = await createRequest({request_method, request_path: "/onramp/v1/buy/quote"})

  const reqBody = JSON.parse(req.body);
  const body: BuyQuoteRequest = {
    purchase_currency: reqBody.purchase_currency,
    payment_amount: reqBody.payment_amount,
    payment_currency: reqBody.payment_currency,
    payment_method: reqBody.payment_method,
    country: reqBody.country,
    payment_network: reqBody.payment_network,
  }

  await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { Authorization: "Bearer " + jwt },
  })
    .then((response) => {return response.json()})
    .then((json) => {
      if(json.message) {
        console.error("Error:", json.message);
        res.status(500).json({error: json.message});    
      } else {
        res.status(200).json(json);
      }
    })
    .catch((error) => {
      console.log("Caught error: ", error);
      res.status(500);
    });
}
