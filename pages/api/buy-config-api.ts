import type { NextApiRequest, NextApiResponse } from "next";
import { createRequest } from "./helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const request_method = "GET";
  const {url, jwt} = await createRequest({request_method, request_path: "/onramp/v1/buy/config"});

  await fetch(url, {
    method: "GET",
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
