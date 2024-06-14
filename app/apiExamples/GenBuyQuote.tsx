import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import GenTokenAndURL from "./GenTokenAndURL";
import { Divider } from "@nextui-org/divider";
import { Card, Link } from "@nextui-org/react";
import {Select, SelectItem} from "@nextui-org/select";
import { BuyOptionsRequest, BuyOptionsResponse, BuyQuoteRequest, BuyQuoteResponse } from "../utils/types";
import { generateBuyOptions, generateBuyQuote } from "../utils/queries";
import ReactJson from "react-json-view";
import { BuyConfigBox } from "./BuyConfigBox";
import { scrollToHeader } from "../utils/helpers";
import { networkInterfaces } from "os";

const PaymentMethodOptions = ['CRYPTO_ACCOUNT', 'FIAT_ACCOUNT', 'CARD', 'ACH_BANK_ACCOUNT', 'APPLE_PAY'];

type Item = {
    name: string;
}

export default function GenBuyQuote () {
    
    // Buy Options API Request Parameters & wrapper function to change parameter state
    const [buyOptionsParams, setBuyOptionsParams] = useState<BuyOptionsRequest>({
        country: '',
        subdivision: '',
    })
    const onChangeBuyOptionsParams = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBuyOptionsParams(prevState => ({
        ...prevState,
        [name]: value
        }));
    }

    // Buy Options API Response
    const [buyOptionsResponse, setBuyOptionsResponse] = useState<BuyOptionsResponse>();
    const prevCountrySubdiv = useRef('');

    const emptyBuyQuoteParams = {
            purchase_currency: '',
            payment_currency: '',
            payment_method: '',
            country: '',
            payment_amount: '',
            payment_network: '',
        }

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
        - Sets the buyOptionsResponse state to API response, reset buyQuoteParams, payment/purchase currencies
    */

    const buyOptionsWrapper = useCallback(async () => {
        if (buyOptionsParams.country + buyOptionsParams.subdivision === prevCountrySubdiv.current) { // prevent re-fetching same data
            return;
        }
        const response = await generateBuyOptions(buyOptionsParams);
        try {
            setBuyOptionsResponse(response.json);
            setBuyQuoteParams({
                ...emptyBuyQuoteParams,
                country: buyOptionsParams.country,
            });

            prevCountrySubdiv.current = buyOptionsParams.country + buyOptionsParams.subdivision; // store current query params for future caching
        } catch (error) {
            console.error(error);
        }
    }, [buyOptionsParams]);


    function useLogFunctionRecreation(func, dependencies) {
        const lastFuncRef = useRef();
        
        useEffect(() => {
            if (lastFuncRef.current !== func) {
            console.log('Function has been recreated!');
            lastFuncRef.current = func;
            }
        }, [func, ...dependencies]);
    }

    const buyQuoteWrapper = useCallback(async () => {
        const response = await generateBuyQuote(buyQuoteParams);
        try {
            console.log(response);
            setBuyQuoteResponse(response);
        } catch (error) {
            console.log(error);
        }
    }, [buyQuoteParams]);

    useLogFunctionRecreation(buyQuoteWrapper, [buyQuoteParams]);

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

    const payment_amount_limits = useMemo(() => {
        const limits = buyOptionsResponse?.payment_currencies
                .find(currency => currency.id === buyQuoteParams.payment_currency)
                ?.limits.find(limit => limit.id === buyQuoteParams.payment_method);
        return {
            min: limits?.min || '',
            max: limits?.max || '',
        };
    }, [buyOptionsResponse, buyQuoteParams.payment_currency, buyQuoteParams.payment_method])


    console.log(payment_methods_list, purchase_networks_list, payment_amount_limits);

    console.log(buyQuoteParams.purchase_currency === '');

    return (
        <div>
            <div className="flex flex-col w-full space-y-5">

                {/* Generate Buy Configurations Card Box */}
                <BuyConfigBox />

                <Divider className="mt-20" />

                {/* Buy Options Card Box */}
                <Card id="buyOptionsHeader" >
                    {/* Buy Options Header */}
                    <div className="flex flex-col p-10 pb-5 gap-1">
                        <h1 
                            onClick={() => scrollToHeader("buyOptionsHeader")} 
                            className="font-bold underline"> 
                            Generate Buy Options: 
                        </h1>
                        <h2> The <Link href="https://docs.cdp.coinbase.com/onramp/docs/api-configurations/" isExternal> Buy Options API </Link> returns the supported fiat currencies and available crypto assets that can be passed into the Buy Quote API. </h2>
                    </div>

                    <div className="flex flex-col ml-10 gap-1 w-2/5">
                        <h2> 1. Input your <b>country</b> and optionally the <b>subdivision</b>, then click <b>'Generate Buy Options'</b>. </h2>
                        <h2> 2. The response will show the payment and purchase options in your selected country/subdivision. Your selected country will be passed into the Buy Quote API. </h2>
                    </div>
                    
                    
                    {/* Buy Options API Request Parameters & Button to generate Buy Options */}
                    <section className="flex flex-row gap-10 p-10">
                        <div className="flex flex-col space-y-4 w-full">
                            <h2 className="font-bold underline"> Enter Request Parameters </h2>
                            <Input
                                type="text"
                                name="country"
                                label="Country"
                                placeholder="Enter country of payment"
                                value={buyOptionsParams.country}
                                onChange={(value) => {onChangeBuyOptionsParams(value)}}
                                isRequired
                            />
                            <Input
                                type="text"
                                name="subdivision"
                                label="Subdivision"
                                placeholder="Enter subdivision (optional)"
                                value={buyOptionsParams.subdivision}
                                onChange={(value) => {onChangeBuyOptionsParams(value)}}
                            />
                            <Button onClick={buyOptionsWrapper}> Generate buy options </Button>
                        </div>
                        
                        <div className="flex flex-col space-y-4 w-full">
                            <h2 className="font-bold underline"> Buy Options Response </h2>
                            <Card className="flex-auto justify-top size-full p-5" title="Buy Option Response">
                                {buyOptionsResponse && <ReactJson collapsed={true} src={buyOptionsResponse} />} 
                            </Card>
                        </div>
                    </section>
                </Card>
            </div>

            <Divider className="my-10" />

            {/* Generate Buy Quote Card Box */}
            <div className="flex flex-col">
                <Card id="buyQuoteHeader">
                    {/* Buy Quote Header */}
                    <div className="flex flex-col p-10 pb-5 gap-1">
                        <h1 onClick={() => scrollToHeader("buyQuoteHeader")} className="font-bold underline"> Generate Buy Quote: </h1>
                        <h2> 
                            The <Link href="https://docs.cdp.coinbase.com/onramp/docs/api-generating-quotes/" isExternal> Buy Quote API </Link> provides clients with a quote based on the asset the user would like to purchase, 
                            the network they plan to purchase it on, the dollar amount of the payment, the payment currency, 
                            the payment method, and country of the user. 
                        </h2>
                    </div>
                    <div className="flex flex-col ml-10 gap-1 w-2/5">
                        <h2> 1. <b>'Generate Buy Options'</b> in the section above to specify the country parameter. </h2>   
                        <h2> 2. Select a <b>payment currency</b>, then select a <b>payment method</b> based on the available options. </h2>
                        <h2> 3. Select a <b>purchase currency</b>, then optionally select a <b>purchase network</b>. </h2>
                        <h2> 4. Enter the <b>fiat payment amount</b> you wish to spend on this transaction. Then, click <b> 'Generate Buy Quote' </b>. </h2>
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
                                <Select
                                    className="flex w-full"
                                    name="payment_currency"
                                    label="Payment Currency"
                                    placeholder="Select a payment currency"
                                    onChange={(value) => {onChangeBuyQuotesParams(value)}}
                                    isRequired
                                    items={buyOptionsResponse?.payment_currencies || []}
                                    disabled={buyQuoteParams.country === ''}
                                    >
                                    {(curr) => <SelectItem key={curr.id}>{curr.id}</SelectItem>}
                                </Select>
                                <Select
                                    className="flex w-full"
                                    name="payment_method"
                                    label="Payment Method"
                                    placeholder="Select a payment method"
                                    isRequired
                                    disabled={buyQuoteParams.payment_currency === ''}
                                    onChange={(value) => {onChangeBuyQuotesParams(value);}}
                                    items={payment_methods_list}
                                >
                                    {(method) => <SelectItem key={method.name}>{method.name}</SelectItem>}
                                </Select>
                                
                            </div>

                            <div className="flex flex-row justify-between gap-4">
                                <Select
                                    className="flex w-full"
                                    name="purchase_currency"
                                    label="Purchase Currency"
                                    placeholder="Select a purchase currency"
                                    isRequired
                                    disabled={buyQuoteParams.country === ''}
                                    onChange={(value) => {onChangeBuyQuotesParams(value)}}
                                    items={buyOptionsResponse?.purchase_currencies || []}
                                    >
                                    {(curr) => <SelectItem key={curr.symbol}>{curr.symbol}</SelectItem>}
                                </Select>
                                <Select
                                    className="flex w-full"
                                    name="purchase_network"
                                    label="Purchase Network"
                                    placeholder="Select purchase network (optional)"
                                    onChange={(value) => {onChangeBuyQuotesParams(value)}}
                                    items={purchase_networks_list}
                                    disabled={buyQuoteParams.purchase_currency === ''}
                                    >
                                    {((network) => <SelectItem key={network.name}>{network.name}</SelectItem>)}
                                </Select>
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
                            />

                            {/* Generate Buy Quote Button */}
                            <Button onClick={buyQuoteWrapper} className="w-min" >
                                Generate buy quote
                            </Button>
                        </div>

                        {/* Buy Quote Response */}
                        <div className="flex flex-col space-y-4 w-full">
                            <h2 className="font-bold underline"> Buy Quote Response </h2>
                            <Card className="flex-auto justify-top size-full p-5" title="Buy Quote Response">
                                {buyQuoteResponse && <ReactJson collapsed={true} src={buyQuoteResponse} />} 
                            </Card>
                        </div>
                    </section>
                </Card>

                <Divider className="my-10" />
            
                {/* Generate Secure Onramp Token + URL Card Box */}
                <GenTokenAndURL showBuyQuoteURLText aggregatorInputs={
                    {
                        quoteID: buyQuoteResponse?.quote_id || '',
                        defaultAsset: buyQuoteParams.purchase_currency,
                        defaultPaymentMethod: buyQuoteParams.payment_method,
                        defaultNetwork: buyQuoteParams.payment_network,
                        fiatCurrency: buyQuoteParams.payment_currency,
                        presentFiatAmount: buyQuoteParams.payment_amount,
                    }
                }/>
            </div>
        </div>
    )
}