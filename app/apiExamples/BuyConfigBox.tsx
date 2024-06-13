import { Button, Card } from "@nextui-org/react";
import { useState } from "react";
import ReactJson from "react-json-view";
import { generateBuyConfig } from "../utils/queries";


export function BuyConfigBox() {
    // json response containing BuyConfig and BuyOptions
    const [buyConfig, setBuyConfig] = useState();

    const buyConfigurationWrapper = async () => {
        const response = await generateBuyConfig();
        try {
            console.log(response);
            setBuyConfig(response);
        } catch (error) {
            console.error(error);
        }
    }
    
    return (
        <Card className="flex flex-col p-10">
            <h1 className="font-bold underline mb-1"> GENERATE BUY CONFIGURATIONS: </h1>
            <h2>Generate different buy configurations for Onramp transactions</h2>
        
        <div className="flex flex-row w-full justify-center gap-10 mt-5">
            <Button className="w-full" onClick={buyConfigurationWrapper}> Generate Buy Configuration </Button>
            <Card className="w-full p-5">
                {buyConfig && <ReactJson collapsed={true} src={buyConfig} />} 
            </Card>
        </div>
        </Card>
    );
}