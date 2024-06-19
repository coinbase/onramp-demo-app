import { Button, Card, Link, Select, SelectItem } from "@nextui-org/react";
import { useState } from "react";
import ReactJson from "react-json-view";
import { generateBuyConfig } from "../utils/queries";
import { scrollToHeader } from "../utils/helpers";


export function BuyConfigBox() {
    // json response containing BuyConfig and BuyOptions
    const [buyConfig, setBuyConfig] = useState();

    const [configLoading, setConfigLoading] = useState(false);

    const buyConfigurationWrapper = async () => {
        setConfigLoading(true);
        const response = await generateBuyConfig();
        try {
            setConfigLoading(false);
            setBuyConfig(response);
        } catch (error) {
            setConfigLoading(false);
            alert(error);
        }
    }
    
    return (
        <Card id="buyConfigHeader" className="flex flex-col p-10">
            <h1 className="font-bold mb-1" onClick={() => scrollToHeader("buyConfigHeader")}> Generate Buy Config: </h1>
            <h2>The <Link isExternal href="https://docs.cdp.coinbase.com/onramp/docs/api-configurations/#buy-options"> Buy Config API </Link> returns the list of countries supported by Coinbase Onramp, and the payment methods available in each country.</h2>
        <div className="flex flex-row w-full justify-center gap-10 mt-5">
            <Button className="w-full" onClick={buyConfigurationWrapper}> Generate Buy Config </Button>
            <Card className="w-full p-5">
                {configLoading ? 'loading...' : (buyConfig && <ReactJson collapsed={true} src={buyConfig} />)} 
            </Card>
        </div>
        </Card>
    );
}