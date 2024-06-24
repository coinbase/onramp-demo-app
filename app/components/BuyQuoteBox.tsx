import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import { Divider } from "@nextui-org/divider";
import { Card, Link, Tooltip } from "@nextui-org/react";
import {Select, SelectItem} from "@nextui-org/select";
import { BuyConfigResponse, BuyOptionsRequest, BuyOptionsResponse, BuyQuoteRequest, BuyQuoteResponse} from "../utils/types";
import { generateBuyOptions, generateBuyQuote } from "../utils/queries";
import ReactJson from "react-json-view";
import { BuyConfigBox } from "./BuyConfigBox";
import { scrollToHeader } from "../utils/helpers";
import SecureTokenBox from "./SecureTokenBox";
import { Accordion } from '@nextui-org/react';


export default function BuyQuoteBox() {

    /* Buy Configuration Response State */
    const [buyConfig, setBuyConfig] = useState<BuyConfigResponse>();

    // buy quote loading state 
    // expand for the rest of the options or not -> disabled if prev section not complete (display tooltip)
    
    /* Buy Options API Variables - Request & Response payloads, Loading state, List of country/subdiv options */
    // request parameters and onChange wrapper function
    const [buyOptionsParams, setBuyOptionsParams] = useState<BuyOptionsRequest>({
        country: '',
        subdivision: '',
    })
    const onChangeBuyOptionsParams = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBuyOptionsParams(prevState => ({
        ...prevState,
        [name]: value
        }));
    }

    // Buy Options API Response
    const [buyOptionsResponse, setBuyOptionsResponse] = useState<BuyOptionsResponse>();
    const prevCountrySubdiv = useRef('');
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);

    /* Change list of buy option country options on re-render when config generated */
    const buy_options_countries = useMemo(() => {
        return buyConfig?.countries || [];
    }, [buyConfig]);
    const buy_options_subdivisions = useMemo(() => {
        return buy_options_countries.find((country) => country.id === buyOptionsParams.country)?.subdivisions.map(s => {return {name: s}}) || [];
    }, [buy_options_countries, buyOptionsParams.country]);



    const emptyBuyQuoteParams = {
            purchase_currency: '',
            payment_currency: '',
            payment_method: '',
            country: '',
            payment_amount: '',
            purchase_network: '',
        }

    const [isQuoteLoading, setIsQuoteLoading] = useState(false);

    // Buy Quote Request Parameters & wrapper function to change parameter state
    const [buyQuoteParams, setBuyQuoteParams] = useState<BuyQuoteRequest>(emptyBuyQuoteParams);
    const onChangeBuyQuotesParams = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setBuyQuoteParams(prevState => {
            return {
                ...prevState,
                [name]: value
            }
        });
    }
    // Buy Quote Response
    const [buyQuoteResponse, setBuyQuoteResponse] = useState<BuyQuoteResponse>();

    /* Wrapper around buy options API call under api/buy-options-api
        - Calls and awaits the API with the current buyOptionsParams state
        - Sets the buyOptionsResponse state to API response, reset buyQuoteParams
        - handles error and loading states
    */
    const buyOptionsWrapper = useCallback(async () => {
        if (!buyOptionsParams.country) { // ensure country is selected
            alert("Please select a country to generate buy options!");
            return;
        }
        if (buyOptionsParams.country + buyOptionsParams.subdivision === prevCountrySubdiv.current) { // prevent re-fetching same data
            return;
        }

        try {
            // set loading state, reset current response
            setIsOptionsLoading(true);
            setBuyOptionsResponse(undefined);
            const response = await generateBuyOptions(buyOptionsParams);

            // set response, reset buy quote parameters, 
            setBuyOptionsResponse(response?.json);
            setBuyQuoteParams({
                ...emptyBuyQuoteParams,
                country: buyOptionsParams.country,
            });

            // remove loading state and cache last country + subdivision query
            setIsOptionsLoading(false);
            prevCountrySubdiv.current = buyOptionsParams.country + buyOptionsParams.subdivision; // store current query params for future caching
        } catch (error) {
            // remove loading state and alert user of error
            setIsOptionsLoading(false);
            alert(error);
        }
    }, [buyOptionsParams]);


    /* Wrapper around buy quote API call under api/buy-quote-api
        - Calls and awaits the API with the current buyQuoteParams state
        - Sets the buyQuoteResponse state to API response
    */
    const buyQuoteWrapper = useCallback(async () => {
        if (!buyQuoteParams.purchase_currency || !buyQuoteParams.payment_currency || !buyQuoteParams.payment_method || !buyQuoteParams.payment_amount || !buyQuoteParams.country) {
            alert("Please fill out all required fields");
            return;
        }
        if (parseInt(buyQuoteParams.payment_amount) < parseInt(payment_amount_limits.min) || 
            parseInt(buyQuoteParams.payment_amount) > parseInt(payment_amount_limits.max)) {
            alert(`Payment amount for currency '${buyQuoteParams.payment_currency} - ${buyQuoteParams.payment_method}' must be between ${payment_amount_limits.min} and ${payment_amount_limits.max}`);
            return;
        }
        try {
            setIsQuoteLoading(true);
            setBuyQuoteResponse(undefined);
            const response = await generateBuyQuote(buyQuoteParams);
            setBuyQuoteResponse(response);
            setIsQuoteLoading(false);
        } catch (error) {
            setIsQuoteLoading(false);
            alert(error);
        }
    }, [buyQuoteParams]);

    /* Change list of payment methods on re-render when new PAYMENT currency is changed */
    const payment_methods_list = useMemo(() => {
        const methods = buyOptionsResponse?.payment_currencies.find(currency => currency.id === buyQuoteParams.payment_currency)?.limits.map(method => ({name: method.id}));
        return methods || [];
    }, [buyOptionsResponse, buyQuoteParams.payment_currency]);

    /* Change list of payment networks on re-render when new PURCHASE currency is changed */
    const purchase_networks_list = useMemo(() => {
        const networks = buyOptionsResponse?.purchase_currencies.find(currency => currency.symbol === buyQuoteParams.purchase_currency)?.networks.map(method => ({name: method.name}));
        return networks || [];
    }, [buyOptionsResponse, buyQuoteParams.purchase_currency]);

    /* Change payment amount limits on re-render when changing PAYMENT currency & PAYMENT METHOD */
    const payment_amount_limits = useMemo(() => {
        const limits = buyOptionsResponse?.payment_currencies
                .find(currency => currency.id === buyQuoteParams.payment_currency)
                ?.limits.find(limit => limit.id === buyQuoteParams.payment_method);
        return {
            min: limits?.min || '',
            max: limits?.max || '',
        };
    }, [buyOptionsResponse, buyQuoteParams.payment_currency, buyQuoteParams.payment_method])


    return (
        <div className="flex flex-col w-full space-y-5">

            {/* Generate Buy Configurations Card Box */}
            <BuyConfigBox buyConfig={buyConfig} setBuyConfig={setBuyConfig}/>

            {/* Buy Options Card Box */}
            <Card id="buyOptionsHeader" className="mt-5" >
                {/* Buy Options Header */}
                <div className={buyConfig ? "flex flex-col p-10 pb-5 gap-1" : "flex flex-col p-10 gap-1"}>
                    <h1 
                        onClick={() => scrollToHeader("buyOptionsHeader")} 
                        className="font-bold"> 
                        2. Generate Buy Options: 
                    </h1>
                    <h2> The <Link href="https://docs.cdp.coinbase.com/onramp/docs/api-configurations/" isExternal> Buy Options API </Link> returns the supported fiat currencies and available crypto assets that can be passed into the Buy Quote API. </h2>
                </div>

                {buyConfig &&
                    <div>
                        <div className="flex flex-col ml-10 gap-1 w-2/5">
                            <h2> 1. Input your <b>country</b> and optionally the <b>subdivision</b>, then click <b>&lsquo;Generate Buy Options&rsquo;</b>. </h2>
                            <h2> 2. The response will show the payment and purchase options in your selected country/subdivision. Your selected country will be passed into the Buy Quote API. </h2>
                        </div>
                    {/* Buy Options API Request Parameters & Button to generate Buy Options */}
                        <section className="flex flex-row gap-10 p-10">
                            <div className="flex flex-col space-y-4 w-full">
                                <h2 className="font-bold underline"> Enter Request Parameters </h2>
                                <Select
                                    className="flex w-full"
                                    name="country"
                                    label="Country"
                                    placeholder="Enter country of payment"
                                    value={buyOptionsParams.country}
                                    onChange={(value) => {onChangeBuyOptionsParams(value)}}
                                    items={buy_options_countries}
                                    isRequired
                                    isDisabled={buyConfig.countries.length === 0}
                                >
                                    {(country) => <SelectItem key={country.id}>{country.id}</SelectItem>}
                                </Select>
                                <Select
                                    className="flex w-full"
                                    name="subdivision"
                                    label="Subdivision"
                                    placeholder="Enter subdivision (optional)"
                                    value={buyOptionsParams.subdivision}
                                    onChange={(value) => {onChangeBuyOptionsParams(value)}}
                                    items={buy_options_subdivisions}
                                    isDisabled={buyOptionsParams.country === '' || buy_options_subdivisions.length === 0}
                                
                                >
                                    {(subdiv) => <SelectItem key={subdiv.name}>{subdiv.name}</SelectItem>}
                                </Select>
                                <Button onClick={buyOptionsWrapper} isDisabled={buyOptionsParams.country === ''}> Generate buy options </Button>
                            </div>
                            
                            <div className="flex flex-col space-y-4 w-full">
                                <h2 className="font-bold underline"> Buy Options Response </h2>
                                <Card className="flex-auto justify-top size-full p-5" title="Buy Option Response">
                                    {isOptionsLoading ? 'loading...' : buyOptionsResponse && <ReactJson collapsed={true} src={buyOptionsResponse}/>} 
                                </Card>
                            </div>
                        </section>
                    </div>
                }
            </Card>
            

            {/* Generate Buy Quote Card Box */}
            <Card id="buyQuoteHeader" className="mt-5 flex flex-col">
                {/* Buy Quote Header */}
                <div className={buyOptionsResponse ? "flex flex-col p-10 pb-5 gap-1" : "flex flex-col p-10 gap-1"}>
                    <h1 onClick={() => scrollToHeader("buyQuoteHeader")} className="font-bold"> 3. Generate Buy Quote: </h1>
                    <h2> 
                        The <Link href="https://docs.cdp.coinbase.com/onramp/docs/api-generating-quotes/" isExternal> Buy Quote API </Link> provides clients with a quote based on the asset the user would like to purchase, 
                        the network they plan to purchase it on, the dollar amount of the payment, the payment currency, 
                        the payment method, and country of the user. 
                    </h2>
                </div>


                {buyOptionsResponse &&
                    <div>
                        <div className="flex flex-col ml-10 gap-1 w-2/5">
                            <h2> 1. <b>&rsquo;Generate Buy Options&rsquo;</b> in the section above to specify the country parameter. </h2>   
                            <h2> 2. Select a <b>payment currency</b>, then select a <b>payment method</b> based on the available options. </h2>
                            <h2> 3. Select a <b>purchase currency</b>, then optionally select a <b>purchase network</b>. </h2>
                            <h2> 4. Enter the <b>fiat payment amount</b> you wish to spend on this transaction. Then, click <b> &lsquo;Generate Buy Quote&rsquo; </b>. </h2>
                            <h2> 5. The <b>quoteID</b> and Buy Quote request parameters will be passed into your one-time Coinbase Onramp URL in the section below.</h2>
                        </div>
                        <section className="flex flex-row gap-10 p-10">
                            {/* Country, Purchase Currency, Payment Currency, Payment Method, Network, Amount Options */}
                            <div className="flex flex-col space-y-4 w-full">

                                <h2 className="font-bold underline"> Enter Request Parameters </h2>
                                <Input
                                    type="text"
                                    label="Country"
                                    placeholder="Generate buy options above"
                                    disabled={true}
                                    isRequired
                                    value={buyQuoteParams.country}
                                />

                                <div className="flex flex-row justify-between gap-4">
                                <Tooltip offset={-10} content="Select country first" isDisabled={buyQuoteParams.country !== ''} placement="bottom">
                                    <Select
                                        className="flex w-full"
                                        name="payment_currency"
                                        label="Payment Currency"
                                        placeholder="Select a payment currency"
                                        onChange={(value) => {onChangeBuyQuotesParams(value)}}
                                        isRequired
                                        items={buyOptionsResponse?.payment_currencies || []}
                                        isDisabled={buyQuoteParams.country === ''}
                                        >
                                        {(curr) => <SelectItem key={curr.id}>{curr.id}</SelectItem>}
                                    </Select>
                                </Tooltip>
                                <Tooltip offset={-10} content="Select payment currency first" isDisabled={buyQuoteParams.payment_currency !== ''} placement="bottom">
                                    <Select
                                        className="flex w-full"
                                        name="payment_method"
                                        label="Payment Method"
                                        placeholder="Select a payment method"
                                        isRequired
                                        isDisabled={buyQuoteParams.payment_currency === ''}
                                        onChange={(value) => {onChangeBuyQuotesParams(value);}}
                                        items={payment_methods_list}
                                    >
                                        {(method) => <SelectItem key={method.name}>{method.name}</SelectItem>}
                                    </Select>
                                </Tooltip>
                                </div>

                                <div className="flex flex-row justify-between gap-4">
                                    <Tooltip offset={-10} content="Select country first" isDisabled={buyQuoteParams.country !== ''} placement="bottom">
                                        <Select
                                            className="flex w-full"
                                            name="purchase_currency"
                                            label="Purchase Currency"
                                            placeholder="Select a purchase currency"
                                            isRequired
                                            isDisabled={buyQuoteParams.country === ''}
                                            onChange={(value) => {onChangeBuyQuotesParams(value)}}
                                            items={buyOptionsResponse?.purchase_currencies || []}
                                            >
                                            {(curr) => <SelectItem key={curr.symbol}>{curr.symbol}</SelectItem>}
                                        </Select>
                                    </Tooltip>
                                    <Tooltip offset={-10} content="Select purchase currency first" isDisabled={buyQuoteParams.purchase_currency !== ''} placement="bottom">
                                        <Select
                                            className="flex w-full"
                                            name="purchase_network"
                                            label="Purchase Network"
                                            placeholder="Select purchase network (optional)"
                                            onChange={(value) => {onChangeBuyQuotesParams(value)}}
                                            items={purchase_networks_list}
                                            isDisabled={buyQuoteParams.purchase_currency === ''}
                                            >
                                            {((network) => <SelectItem key={network.name}>{network.name}</SelectItem>)}
                                        </Select>
                                    </Tooltip>
                                </div>

                                
                                <Input  
                                    className="flex"
                                    name="payment_amount"
                                    type="text"
                                    label="Payment Amount"
                                    placeholder={ payment_amount_limits.max && payment_amount_limits.min ? 
                                        `Min Amt: ${payment_amount_limits.min}, Max Amt: ${payment_amount_limits.max}`: 
                                        "Enter amount of currency to purchase"}
                                    onChange={(value) => {onChangeBuyQuotesParams(value)}}
                                    isRequired
                                    isDisabled={buyQuoteParams.payment_currency === '' || buyQuoteParams.payment_method === ''}
                                />

                                {/* Generate Buy Quote Button */}
                                <Button onClick={buyQuoteWrapper} className="w-min" isDisabled={
                                    buyQuoteParams.payment_currency === '' || 
                                    buyQuoteParams.payment_method === '' || 
                                    buyQuoteParams.purchase_currency === '' || 
                                    buyQuoteParams.payment_amount === ''
                                } >
                                    Generate buy quote
                                </Button>
                            </div>

                            {/* Buy Quote Response */}
                            <div className="flex flex-col space-y-4 w-full">
                                <h2 className="font-bold underline"> Buy Quote Response </h2>
                                <Card className="flex-auto justify-top size-full p-5" title="Buy Quote Response">
                                    {isQuoteLoading ? 'loading...' : buyQuoteResponse && <ReactJson collapsed={true} src={buyQuoteResponse} />} 
                                </Card>
                            </div>
                        </section>
                    </div>}
            </Card>
        
            {/* Generate Secure Onramp Token + URL Card Box */}
            <div className="mt-5">
                <SecureTokenBox showBuyQuoteURLText aggregatorInputs={
                    {
                        quoteID: buyQuoteResponse?.quote_id || '',
                        defaultAsset: buyQuoteParams.purchase_currency,
                        defaultPaymentMethod: buyQuoteParams.payment_method,
                        defaultNetwork: buyQuoteParams.purchase_network,
                        fiatCurrency: buyQuoteParams.payment_currency,
                        presentFiatAmount: buyQuoteParams.payment_amount,
                    }}
                    blockchains={purchase_networks_list.map((network) => network.name)}
                />
            </div>
        </div>
    )
}