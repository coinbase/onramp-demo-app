import type { NextApiRequest, NextApiResponse } from "next";
import { createRequest } from "./helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const request_method = "POST";
  const {url, jwt} = await createRequest({request_method, request_path: "/onramp/v1/token"});
  const reqBody = JSON.parse(req.body);
  const body = {
    destination_wallets: [
      {
        address: reqBody.ethAddress,
        blockchains: reqBody.blockchains || ["base", "ethereum"],
      },
    ],
  };

  await fetch(url, {
    method: request_method,
    body: JSON.stringify(body),
    headers: { Authorization: "Bearer " + jwt },
  })
    .then((response) => {return response.json()})
    .then((json) => {
      if(json.message) {
        console.error("Error:", json.message);
        res.status(500).json({error: json.message});    
      } else {
        res.status(200).json({ token: json.token });
      }
    })
    .catch((error) => {
      console.log("Caught error: ", error);
      res.status(500);
    });
}
