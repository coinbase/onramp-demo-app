import type { NextApiRequest, NextApiResponse } from "next";
import { SignOptions, sign } from "jsonwebtoken";
import crypto from "crypto";

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
  const key = await import('../../api_keys/cdp_api_key.json');
  const key_name = key.name;
  const key_secret = key.privateKey;
  const request_method = "POST";
  const host = "api.developer.coinbase.com";
  const request_path = "/onramp/v1/buy/quote";
  const url = `https://${host}${request_path}`;

  const uri = request_method + " " + host + request_path;

  const payload = {
    iss: "coinbase-cloud",
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 120, 
    sub: key_name,
    uri,
  };

  const signOptions: SignOptions = {
    algorithm: "ES256",
    header: {
      kid: key_name,
      nonce: crypto.randomBytes(16).toString("hex"), // non-standard, coinbase-specific header that is necessary
    },
  }

  const jwt = sign(
    payload,
    key_secret,
    signOptions,
  );

  const reqBody = JSON.parse(req.body);
  const body: BuyQuoteRequest = {
    purchase_currency: reqBody.purchase_currency,
    payment_amount: reqBody.payment_amount,
    payment_currency: reqBody.payment_currency,
    payment_method: reqBody.payment_method,
    country: reqBody.country,
    payment_network: reqBody.payment_network,
  }

  fetch(url, {
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
