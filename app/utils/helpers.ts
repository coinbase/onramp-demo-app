import { BuyQuoteResponse } from "./types";

export function formatQuoteResponse(QuoteResponse: BuyQuoteResponse) {
    let formatResponse = {
        "Payment Total": `${QuoteResponse.payment_total.value} ${QuoteResponse.payment_total.currency}`,
        "Payment Subtotal": `${QuoteResponse.payment_subtotal.value} ${QuoteResponse.payment_subtotal.currency}`,
        "Purchase Amount": `${QuoteResponse.purchase_amount.value} ${QuoteResponse.purchase_amount.currency}`,
        "Coinbase Fee": `${QuoteResponse.coinbase_fee.value} ${QuoteResponse.coinbase_fee.currency}`,
        "Network Fee": `${QuoteResponse.network_fee.value} ${QuoteResponse.network_fee.currency}`,
        "Quote ID": QuoteResponse.quote_id
    };

    let jsonStr = ""

    Object.entries(formatResponse).forEach(([key, value]) => {
        jsonStr += `${key}: ${value}\n`;
    });

    return jsonStr;
}

export const scrollToHeader = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };