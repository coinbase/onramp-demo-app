import { BuyOptionsRequest, BuyOptionsResponse, BuyQuoteRequest, BuyQuoteResponse } from "./types";



export async function generateBuyConfig () {
    try {
        const response = await fetch("/api/buy-config-api", {
            method: "GET",
        });
        if (!response.ok) {
            alert('Error fetching buy config');
            throw new Error('Failed to fetch');
        }
        const json = await response.json();
        return json;
    } catch (error) {
        alert('Error fetching buy config:' + `${error}`);
        throw error;
    }
};

export async function generateBuyOptions({country, subdivision}: BuyOptionsRequest) {
    try {
      const response = await fetch("/api/buy-options-api", {
        method: "POST",
        body: JSON.stringify({ country, subdivision}),
      });
      if (!response.ok) {
        alert("Failed to fetch buy options");
        throw new Error('Failed to fetch buy options');
      }
      const json: BuyOptionsResponse = await response.json();
  
      const payment_currencies = json.payment_currencies.map((currency) => ({ name: currency.id }));
      const purchase_currencies = json.purchase_currencies.map((currency) => ({ name: currency.symbol }));
  
      return { json, payment_currencies, purchase_currencies };
    } catch (error) {
      alert('Error fetching buy options:' + `${error}`);
      throw error;
    }
  };

  export async function generateBuyQuote(request: BuyQuoteRequest) {
    try {
      console.log("generateBuyQuote");
      const response = await fetch("/api/buy-quote-api", {
        method: "POST",
        body: JSON.stringify(request),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch buy quote'); // Throw an error if response is not ok
      }
  
      const json: BuyQuoteResponse = await response.json();
      return json; // Return the JSON data
    } catch (error) {
      console.error('Error generating buy quote:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }