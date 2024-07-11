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
