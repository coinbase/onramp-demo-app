export type AggregatorInputParams = {
  quoteID: string;
  defaultAsset: string;
  defaultNetwork?: string;
  defaultPaymentMethod: string;

  fiatCurrency: string;
  presentFiatAmount: string;
};

export type GenerateSecureTokenRequest = {
  aggregatorInputs?: AggregatorInputParams;
  showBuyQuoteURLText?: boolean;
  blockchains?: string[];
};

export type BuyConfigResponse = {
  countries: {
    id: string;
    subdivisions: string[];
    payment_methods: string[];
    disable_3ds_cards: boolean;
  }[];
};

export type BuyOptionsRequest = {
  country: string;
  subdivision?: string;
  networks?: string[];
};

export type BuyOptionsResponse = {
  payment_currencies: {
    id: string;
    limits: [
      {
        id: string;
        min: string;
        max: string;
      },
      {
        id: string;
        min: string;
        max: string;
      }
    ];
  }[];

  purchase_currencies: {
    id: string;
    name: string;
    symbol: string;
    networks: [
      {
        name: string;
        display_name: string;
        chain_id: string;
        contract_address: string;
      },
      {
        name: string;
        display_name: string;
        chain_id: string;
        contract_address: string;
      }
    ];
  }[];
};

export type BuyQuoteRequest = {
  purchase_currency: string;
  payment_amount: string;
  payment_currency: string;
  payment_method: string;
  country: string;
  purchase_network?: string;
};

export type BuyQuoteResponse = {
  coinbase_fee: { value: string; currency: string };
  network_fee: { value: string; currency: string };
  payment_subtotal: { value: string; currency: string };
  payment_total: { value: string; currency: string };
  purchase_amount: { value: string; currency: string };
  quote_id: string;
};

export type SellConfigResponse = {
  countries: {
    id: string;
    subdivisions: string[];
    payment_methods: string[];
  }[];
};

export type SellOptionsRequest = {
  country: string;
  subdivision?: string;
  networks?: string[];
};

export type SellOptionsResponse = {
  cashout_currencies: {
    id: string;
    limits: [
      {
        id: string;
        min: string;
        max: string;
      },
      {
        id: string;
        min: string;
        max: string;
      }
    ];
  }[];

  sell_currencies: {
    id: string;
    name: string;
    symbol: string;
    networks: [
      {
        name: string;
        display_name: string;
        chain_id: string;
        contract_address: string;
      },
      {
        name: string;
        display_name: string;
        chain_id: string;
        contract_address: string;
      }
    ];
  }[];
};

export type SellQuoteRequest = {
  sell_currency: string;
  sell_amount: string;
  cashout_currency: string;
  payment_method: string;
  country: string;
  sell_network?: string;
  subdivision?: string;
};

export type SellQuoteResponse = {
  coinbase_fee: { value: string; currency: string };
  cashout_subtotal: { value: string; currency: string };
  cashout_total: { value: string; currency: string };
  sell_amount: { value: string; currency: string };
  quote_id: string;
};

export type GenerateWalletRequest = {
  network_id: string;
};
export type GenerateWalletResponse = {
  wallet_address: string;
  network_id: string;
  balance: string;
};

export type OfframpTransactions = {
  transaction_id: string;
  status: number;
  asset: string;
  network: string;
  sell_amount: { value: string; currency: string };
  total: { value: string; currency: string };
  to_address: string;
};

export type SellTransactionStatusRequest = {
  partner_user_id: string;
};

export type SellTransactionStatusResponse = {
  transactions: OfframpTransactions[];
  next_page_key: string;
  total_count: number;
};

export type CreateTransferRequest = {
  network: string;
  amount: number;
  assetId: string;
  destination: string;
};

export type CreateTransferResponse = {
  id: string;
  status: string;
  txh: string;
};
