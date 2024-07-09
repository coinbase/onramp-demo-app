import type { NextApiRequest, NextApiResponse } from "next";
import { createRequest, fetchOnrampRequest } from "./helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const request_method = "POST";
  const { url, jwt } = await createRequest({
    request_method,
    request_path: "/onramp/v1/token",
  });
  const reqBody = JSON.parse(req.body);
  const body = {
    destination_wallets: [
      {
        address: reqBody.ethAddress,
        blockchains: reqBody.blockchains || ["base", "ethereum"],
      },
    ],
  };

  await fetchOnrampRequest({
    request_method,
    url,
    jwt,
    body: JSON.stringify(body),
    res,
  });
}
