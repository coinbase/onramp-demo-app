import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, Link, Tooltip } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";
import {
  SellConfigResponse,
  SellOptionsRequest,
  SellOptionsResponse,
  SellQuoteRequest,
  SellQuoteResponse,
} from "../utils/types";
import { generateSellOptions, generateSellQuote } from "../utils/queries";
import ReactJson from "react-json-view";
import { SellConfigBox } from "./SellConfigBox";
import SecureTokenBox from "./SecureTokenBox";

const emptySellQuoteParams: SellQuoteRequest = {
  sell_amount: "",
  sell_currency: "",
  sell_network: "",
  cashout_currency: "",
  payment_method: "",
  country: "",
};

export default function SellQuoteBox() {
  /* refs to scroll to headers */
  const sellOptionsHeaderRef = useRef<HTMLDivElement | null>(null);
  const sellQuoteHeaderRef = useRef<HTMLDivElement | null>(null);

  /* Sell Configuration Response State */
  const [sellConfig, setSellConfig] = useState<SellConfigResponse>();

  /* Sell Options API Variables - Request & Response payloads, Loading state, List of country/subdiv options */
  // request parameters and onChange wrapper function
  const [sellOptionsParams, setSellOptionsParams] = useState<SellOptionsRequest>({
    country: "",
    subdivision: "",
  });
  const onChangeSellOptionsParams = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSellOptionsParams((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Sell Options API Response
  const [sellOptionsResponse, setSellOptionsResponse] =
    useState<SellOptionsResponse>();
  const prevCountrySubdiv = useRef("");
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  /* Change list of sell option country options on re-render when config generated */
  const sell_options_countries = useMemo(() => {
    return sellConfig?.countries || [];
  }, [sellConfig]);
  const sell_options_subdivisions = useMemo(() => {
    return (
      sell_options_countries
        .find((country) => country.id === sellOptionsParams.country)
        ?.subdivisions.map((s) => {
          return { name: s };
        }) || []
    );
  }, [sell_options_countries, sellOptionsParams.country]);

  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  // Sell Quote Request Parameters & wrapper function to change parameter state
  const [sellQuoteParams, setSellQuoteParams] =
    useState<SellQuoteRequest>(emptySellQuoteParams);
  const onChangeSellQuotesParams = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSellQuoteParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };
  // Sell Quote Response
  const [sellQuoteResponse, setSellQuoteResponse] = useState<SellQuoteResponse>();

  /* Change list of payment methods on re-render when new CASHOUT currency is changed */
  const payment_methods_list = useMemo(() => {
    const methods = sellOptionsResponse?.cashout_currencies
      .find((currency) => currency.id === sellQuoteParams.cashout_currency)
      ?.limits.map((method) => ({ name: method.id }));
    return methods || [];
  }, [sellOptionsResponse, sellQuoteParams.cashout_currency]);


  /* Change list of payment networks on re-render when new SELL currency is changed */
  const sell_networks_list = useMemo(() => {
    const networks = sellOptionsResponse?.sell_currencies
      .find((currency) => currency.symbol === sellQuoteParams.sell_currency)
      ?.networks.map((method) => ({ name: method.name }));
    return networks || [];
  }, [sellOptionsResponse, sellQuoteParams.sell_currency]);

  /* Change cashout amount limits on re-render when changing SELL currency & PAYMENT METHOD */
  const payment_amount_limits = useMemo(() => {
    const limits = sellOptionsResponse?.cashout_currencies
      .find((currency) => currency.id === sellQuoteParams.cashout_currency)
      ?.limits.find((limit) => limit.id === sellQuoteParams.payment_method);
    return {
      min: limits?.min || "",
      max: limits?.max || "",
    };
  }, [
    sellOptionsResponse,
    sellQuoteParams.cashout_currency,
    sellQuoteParams.payment_method,
  ]);



  /* Wrapper around sell options API call under api/sell-options-api
        - Calls and awaits the API with the current sellOptionsParams state
        - Sets the sellOptionsResponse state to API response, reset sellQuoteParams
        - handles error and loading states
    */
  const sellOptionsWrapper = useCallback(async () => {
    if (!sellOptionsParams.country) {
      // ensure country is selected
      alert("Please select a country to generate sell options!");
      return;
    }
    if (
      sellOptionsParams.country + sellOptionsParams.subdivision ===
      prevCountrySubdiv.current
    ) {
      // prevent re-fetching same data
      return;
    }

    try {
      // set loading state, reset current response
      setIsOptionsLoading(true);
      setSellOptionsResponse(undefined);
      const response = await generateSellOptions(sellOptionsParams);

      // set response, reset sell quote parameters,
      setSellOptionsResponse(response?.json);
      setSellQuoteParams({
        ...emptySellQuoteParams,
        country: sellOptionsParams.country,
      });

      // remove loading state and cache last country + subdivision query
      setIsOptionsLoading(false);
      prevCountrySubdiv.current =
        sellOptionsParams.country + sellOptionsParams.subdivision; // store current query params for future caching
    } catch (error) {
      // remove loading state and alert user of error
      setIsOptionsLoading(false);
      alert(error);
    }
  }, [sellOptionsParams]);

  /* Wrapper around sell quote API call under api/sell-quote-api
            - Calls and awaits the API with the current sellQuoteParams state
            - Sets the sellQuoteResponse state to API response
        */
  const sellQuoteWrapper = useCallback(async () => {
    if (
      !sellQuoteParams.sell_currency ||
      !sellQuoteParams.cashout_currency ||
      !sellQuoteParams.payment_method ||
      !sellQuoteParams.sell_amount ||
      !sellQuoteParams.country
    ) {
      alert("Please fill out all required fields");
      return;
    }

    const paymentAmount = parseInt(sellQuoteParams.sell_amount);
    try {
      setIsQuoteLoading(true);
      setSellQuoteResponse(undefined);
      const response = await generateSellQuote(sellQuoteParams);
      setSellQuoteResponse(response);
      setIsQuoteLoading(false);
    } catch (error) {
      setIsQuoteLoading(false);
      alert(error);
    }
  }, [sellQuoteParams, payment_amount_limits.max, payment_amount_limits.min]);

  return (
    <div className="flex flex-col w-full space-y-5">
      {/* Generate Sell Configurations Card Box */}
      <SellConfigBox sellConfig={sellConfig} setSellConfig={setSellConfig} />

      {/* Sell Options Card Box */}
      <Card ref={sellOptionsHeaderRef} className="mt-5">
        {/* Sell Options Header */}
        <div className={`flex flex-col p-10 gap-1 ${sellConfig ? "pb-5" : ""}`}>
          <h1
            onClick={() =>
              sellOptionsHeaderRef.current?.scrollIntoView({
                behavior: "smooth",
              })
            }
            className="font-bold"
          >
            2. Generate Sell Options:
          </h1>
          <h2>
            {" "}
            The{" "}
            <Link
              href="https://docs.cdp.coinbase.com/onramp/docs/api-configurations/"
              isExternal
            >
              {" "}
              Sell Options API{" "}
            </Link>{" "}
            returns the supported fiat currencies and available crypto assets
            that can be passed into the Sell Quote API.{" "}
          </h2>
        </div>

        {sellConfig && (
          <div>
            <div className="flex flex-col ml-10 gap-1 w-2/5">
              <h2>
                {" "}
                1. Input your <b>country</b> and optionally the{" "}
                <b>subdivision</b>, then click{" "}
                <b>&lsquo;Generate Sell Options&rsquo;</b>.{" "}
              </h2>
              <h2>
                {" "}
                2. The response will show the payment and purchase options in
                your selected country/subdivision. Your selected country will be
                passed into the Sell Quote API.{" "}
              </h2>
            </div>
            {/* Sell Options API Request Parameters & Button to generate Sell Options */}
            <section className="flex flex-row gap-10 p-10">
              <div className="flex flex-col space-y-4 w-full">
                <h2 className="font-bold underline">
                  {" "}
                  Enter Request Parameters{" "}
                </h2>
                <Select
                  className="flex w-full"
                  name="country"
                  label="Country"
                  placeholder="Enter country of payment"
                  value={sellOptionsParams.country}
                  onChange={(value) => {
                    onChangeSellOptionsParams(value);
                  }}
                  items={sell_options_countries}
                  isRequired
                  isDisabled={sellConfig.countries.length === 0}
                >
                  {(country) => (
                    <SelectItem key={country.id}>{country.id}</SelectItem>
                  )}
                </Select>
                <Select
                  className="flex w-full"
                  name="subdivision"
                  label="Subdivision"
                  placeholder="Enter subdivision (optional)"
                  value={sellOptionsParams.subdivision}
                  onChange={(value) => {
                    onChangeSellOptionsParams(value);
                  }}
                  items={sell_options_subdivisions}
                  isDisabled={
                    sellOptionsParams.country === "" ||
                    sell_options_subdivisions.length === 0
                  }
                >
                  {(subdiv) => (
                    <SelectItem key={subdiv.name}>{subdiv.name}</SelectItem>
                  )}
                </Select>
                <Button
                  onClick={sellOptionsWrapper}
                  isDisabled={sellOptionsParams.country === ""}
                >
                  {" "}
                  Generate sell options{" "}
                </Button>
              </div>

              <div className="flex flex-col space-y-4 w-full">
                <h2 className="font-bold underline"> Sell Options Response </h2>
                <Card
                  className="flex-auto justify-top size-full p-5"
                  title="Sell Option Response"
                >
                  {isOptionsLoading
                    ? "loading..."
                    : sellOptionsResponse && (
                        <ReactJson collapsed={true} src={sellOptionsResponse} />
                      )}
                </Card>
              </div>
            </section>
          </div>
        )}
      </Card>

      {/* Generate Sell Quote Card Box */}
      <Card ref={sellQuoteHeaderRef} className="mt-5 flex flex-col">
        {/* Sell Quote Header */}
        <div
          className={`flex flex-col p-10 gap-1 ${
            sellOptionsResponse ? "pb-5" : ""
          }`}
        >
          <h1
            onClick={() =>
              sellQuoteHeaderRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="font-bold"
          >
            {" "}
            3. Generate Sell Quote:{" "}
          </h1>
          <h2>
            The{" "}
            <Link
              href="https://docs.cdp.coinbase.com/onramp/docs/api-generating-quotes/"
              isExternal
            >
              {" "}
              Sell Quote API{" "}
            </Link>{" "}
            provides clients with a quote based on the asset the user would like
            to purchase, the network they plan to purchase it on, the dollar
            amount of the payment, the cashout currency, the payment method, and
            country of the user.
          </h2>
        </div>

        {sellOptionsResponse && (
          <div>
            <div className="flex flex-col ml-10 gap-1 w-2/5">
              <h2>
                {" "}
                1. <b>&rsquo;Generate Sell Options&rsquo;</b> in the section
                above to specify the country parameter.{" "}
              </h2>
              <h2>
                {" "}
                2. Select a <b>cashout currency</b>, then select a{" "}
                <b>payment method</b> based on the available options.{" "}
              </h2>
              <h2>
                {" "}
                3. Select a <b>sell currency</b>, then optionally select a{" "}
                <b>sell network</b>.{" "}
              </h2>
              <h2>
                {" "}
                4. Enter the <b>fiat payment amount</b> you wish to spend on
                this transaction. Then, click{" "}
                <b> &lsquo;Generate Sell Quote&rsquo; </b>.{" "}
              </h2>
              <h2>
                {" "}
                5. The <b>quoteID</b> and Sell Quote request parameters will be
                passed into your one-time Coinbase Onramp URL in the section
                below.
              </h2>
            </div>
            <section className="flex flex-row gap-10 p-10">
              {/* Country, Sell Currency, Cashout Currency, Payment Method, Network, Amount Options */}
              <div className="flex flex-col space-y-4 w-full">
                <h2 className="font-bold underline">
                  {" "}
                  Enter Request Parameters{" "}
                </h2>
                <Input
                  type="text"
                  label="Country"
                  placeholder="Generate sell options above"
                  disabled={true}
                  isRequired
                  value={sellQuoteParams.country}
                />

                <div className="flex flex-row justify-between gap-4">
                  <Tooltip
                    offset={-10}
                    content="Select country first"
                    isDisabled={sellQuoteParams.country !== ""}
                    placement="bottom"
                  >
                    <Select
                      className="flex w-full"
                      name="cashout_currency"
                      label="Cashout Currency"
                      placeholder="Select a cashout currency"
                      onChange={(value) => {
                        onChangeSellQuotesParams(value);
                      }}
                      isRequired
                      items={sellOptionsResponse?.cashout_currencies || []}
                      isDisabled={sellQuoteParams.country === ""}
                    >
                      {(curr) => (
                        <SelectItem key={curr.id}>{curr.id}</SelectItem>
                      )}
                    </Select>
                  </Tooltip>
                  <Tooltip
                    offset={-10}
                    content="Select cashout_currency first"
                    isDisabled={sellQuoteParams.cashout_currency !== ""}
                    placement="bottom"
                  >
                    <Select
                      className="flex w-full"
                      name="payment_method"
                      label="Payment Method"
                      placeholder="Select a payment method"
                      isRequired
                      isDisabled={sellQuoteParams.cashout_currency === ""}
                      onChange={(value) => {
                        onChangeSellQuotesParams(value);
                      }}
                      items={payment_methods_list}
                    >
                      {(method) => (
                        <SelectItem key={method.name}>{method.name}</SelectItem>
                      )}
                    </Select>
                  </Tooltip>
                </div>

                <div className="flex flex-row justify-between gap-4">
                  <Tooltip
                    offset={-10}
                    content="Select country first"
                    isDisabled={sellQuoteParams.country !== ""}
                    placement="bottom"
                  >
                    <Select
                      className="flex w-full"
                      name="sell_currency"
                      label="Sell Currency"
                      placeholder="Select a sell currency"
                      isRequired
                      isDisabled={sellQuoteParams.country === ""}
                      onChange={(value) => {
                        onChangeSellQuotesParams(value);
                      }}
                      items={sellOptionsResponse?.sell_currencies || []}
                    >
                      {(curr) => (
                        <SelectItem key={curr.symbol}>{curr.symbol}</SelectItem>
                      )}
                    </Select>
                  </Tooltip>
                  <Tooltip
                    offset={-10}
                    content="Select sell currency first"
                    isDisabled={sellQuoteParams.sell_currency !== ""}
                    placement="bottom"
                  >
                    <Select
                      className="flex w-full"
                      name="sell_network"
                      label="Sell Network"
                      placeholder="Select sell network (optional)"
                      onChange={(value) => {
                        onChangeSellQuotesParams(value);
                      }}
                      items={sell_networks_list}
                      isDisabled={sellQuoteParams.sell_currency === ""}
                    >
                      {(network) => (
                        <SelectItem key={network.name}>
                          {network.name}
                        </SelectItem>
                      )}
                    </Select>
                  </Tooltip>
                </div>

                <Input
                  className="flex"
                  name="sell_amount"
                  type="text"
                  label="Sell Amount"
                  placeholder= "Enter amount of currency to purchase"
                  onChange={(value) => {
                    onChangeSellQuotesParams(value);
                  }}
                  isRequired
                  isDisabled={
                    sellQuoteParams.cashout_currency === "" ||
                    sellQuoteParams.payment_method === ""
                  }
                />

                {/* Generate Sell Quote Button */}
                <Button
                  onClick={sellQuoteWrapper}
                  className="w-min"
                  isDisabled={
                    sellQuoteParams.cashout_currency === "" ||
                    sellQuoteParams.payment_method === "" ||
                    sellQuoteParams.sell_currency === "" ||
                    sellQuoteParams.sell_amount === ""
                  }
                >
                  Generate sell quote
                </Button>
              </div>

              {/* Sell Quote Response */}
              <div className="flex flex-col space-y-4 w-full">
                <h2 className="font-bold underline"> Sell Quote Response </h2>
                <Card
                  className="flex-auto justify-top size-full p-5"
                  title="Sell Quote Response"
                >
                  {isQuoteLoading
                    ? "loading..."
                    : sellQuoteResponse && (
                        <ReactJson collapsed={true} src={sellQuoteResponse} />
                      )}
                </Card>
              </div>
            </section>
          </div>
        )}
      </Card>
    </div>
  );
}
