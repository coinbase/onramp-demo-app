import type { NextApiRequest, NextApiResponse } from "next";
import { createRequest, fetchOnrampRequest } from "./helpers";

type BuyQuoteRequest = {
  purchase_currency: string;
  payment_amount: string;
  payment_currency: string;
  payment_method: string;
  country: string;
  purchase_network?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const request_method = "POST";
  const { url, jwt } = await createRequest({
    request_method,
    request_path: "/onramp/v1/buy/quote",
  });

  const reqBody = JSON.parse(req.body);
  const body: BuyQuoteRequest = {
    purchase_currency: reqBody.purchase_currency,
    payment_amount: reqBody.payment_amount,
    payment_currency: reqBody.payment_currency,
    payment_method: reqBody.payment_method,
    country: reqBody.country,
    purchase_network: reqBody.purchase_network,
  };

  await fetchOnrampRequest({
    request_method,
    url,
    jwt,
    body: JSON.stringify(body),
    res,
  });
}
