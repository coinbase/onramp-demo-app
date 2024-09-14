import type { NextApiRequest, NextApiResponse } from "next";
import { createRequest, fetchOnrampRequest } from "./helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const request_method = "GET";
  const { url, jwt } = await createRequest({
    request_method,
    request_path: "/onramp/v1/sell/config",
  });

  await fetchOnrampRequest({
    request_method,
    url,
    jwt,
    res,
  });
}
