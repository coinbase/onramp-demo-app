import {
  AggregatorInputParams,
  BuyOptionsRequest,
  BuyOptionsResponse,
  BuyQuoteRequest,
  BuyQuoteResponse,
  SellOptionsRequest,
  SellOptionsResponse,
  SellQuoteRequest,
  SellQuoteResponse,
  GenerateWalletResponse,
  GenerateWalletRequest,
  SellTransactionStatusRequest,
  SellTransactionStatusResponse,
  CreateTransferRequest,
  CreateTransferResponse,
} from "./types";

export async function generateSecureToken({
  ethAddress,
  blockchains,
}: {
  ethAddress: string;
  aggregatorInputs?: AggregatorInputParams;
  showBuyQuoteURLText?: boolean;
  blockchains?: string[];
}): Promise<string> {
  try {
    console.log("generateSecureToken");
    const response = await fetch("/api/secure-token", {
      method: "POST",
      body: JSON.stringify({ ethAddress, blockchains: blockchains }),
    });
    if (!response.ok) {
      console.log(await response.text());
      throw new Error(
        "Failed to fetch secure token: ensure valid inputs, crypto wallet matches network, and secure connection"
      );
    }
    const json = await response.json();
    return json.token;
  } catch (error) {
    throw error;
  }
}

export async function generateBuyConfig() {
  try {
    console.log("generateBuyConfig");
    const response = await fetch("/api/buy-config-api", {
      method: "GET",
    });
    if (!response.ok) {
      console.log(await response.text());
      throw new Error("Failed to fetch buy config");
    }
    const json = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function generateBuyOptions({
  country,
  subdivision,
}: BuyOptionsRequest) {
  try {
    console.log("generateBuyOptions");
    const response = await fetch("/api/buy-options-api", {
      method: "POST",
      body: JSON.stringify({ country, subdivision }),
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new Error("Failed to fetch buy options");
    }

    const json: BuyOptionsResponse = await response.json();
    const payment_currencies = json.payment_currencies.map((currency) => ({
      name: currency.id,
    }));
    const purchase_currencies = json.purchase_currencies.map((currency) => ({
      name: currency.symbol,
    }));
    return { json, payment_currencies, purchase_currencies };
  } catch (error) {
    throw error;
  }
}

export async function generateBuyQuote(request: BuyQuoteRequest) {
  try {
    console.log("generateBuyQuote");
    const response = await fetch("/api/buy-quote-api", {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new Error("Failed to fetch buy quote");
    }

    const json: BuyQuoteResponse = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function generateSellConfig() {
  try {
    console.log("generateSellConfig");
    const response = await fetch("/api/sell-config-api", {
      method: "GET",
    });
    if (!response.ok) {
      console.log(await response.text());
      throw new Error("Failed to fetch sell config");
    }
    const json = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function generateSellOptions({
  country,
  subdivision,
}: SellOptionsRequest) {
  try {
    console.log("generateSellOptions");
    const response = await fetch("/api/sell-options-api", {
      method: "POST",
      body: JSON.stringify({ country, subdivision }),
    });

    if (!response.ok) {
      console.log(await response.status);
      throw new Error("Failed to fetch sell options");
    }

    const json: SellOptionsResponse = await response.json();
    const cashcout_currencies = json.cashout_currencies.map((currency) => ({
      name: currency.id,
    }));
    const sell_currencies = json.sell_currencies.map((currency) => ({
      name: currency.symbol,
    }));
    return { json, sell_currencies, cashcout_currencies };
  } catch (error) {
    throw error;
  }
}

export async function generateSellQuote(request: SellQuoteRequest) {
  try {
    console.log("generateSellQuote");
    const response = await fetch("/api/sell-quote-api", {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new Error("Failed to fetch sell quote");
    }

    const json: SellQuoteResponse = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function generateWallet(request: GenerateWalletRequest) {
  try {
    console.log(`generateWallet`);
    const response = await fetch("/api/create-wallet-api", {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new Error("Failed to create wallet");
    }

    const json: GenerateWalletResponse = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
}

export async function getSellTransactionStatus(
  request: SellTransactionStatusRequest
) {
  try {
    console.log("getSellTransactionStatus");
    const response = await fetch("/api/sell-transaction-status-api", {
      method: "POST",
      body: JSON.stringify(request),
    });
    console.log(response);
    if (!response.ok) {
      console.log(await response.text());
      throw new Error("Failed to fetch sell transaction");
    }

    const transactionResponse: SellTransactionStatusResponse = await response.json();
    for (var transaction of transactionResponse.transactions) {
      if ((transaction.status = 3)) return transaction;
    }
    return undefined;
  } catch (error) {
    throw error;
  }
}

export async function createTransfer(request: CreateTransferRequest) {
  try {
    console.log(`createTransfer`);
    const response = await fetch("/api/create-transfer-api", {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new Error("Failed to create transfer");
    }
    const json: CreateTransferResponse = await response.json();
    console.log(`response ${json.id}`);

    return json;
  } catch (error) {
    throw error;
  }
}
