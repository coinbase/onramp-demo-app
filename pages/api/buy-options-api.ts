import type { NextApiRequest, NextApiResponse } from "next";
import { createRequest, fetchOnrampRequest } from "./helpers";
import { BuyOptionsRequest } from "@/app/utils/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqBody = JSON.parse(req.body);
  const body: BuyOptionsRequest = {
    country: reqBody.country,
    subdivision: reqBody.subdivision,
  };

  const request_method = "GET";

  let { url, jwt } = await createRequest({
    request_method,
    request_path: "/onramp/v1/buy/options",
  });
  url = url + `?&country=${body.country}&subdivision=${body.subdivision}`;

  await fetchOnrampRequest({
    request_method,
    url,
    jwt,
    res,
  });
}
