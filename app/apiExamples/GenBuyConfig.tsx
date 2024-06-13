import { Button } from "@nextui-org/button";
import { Divider, Textarea } from "@nextui-org/react";
import { useState } from "react";
import { Input } from "@nextui-org/input";
import { BuyOptionsResponse } from "../utils/types";

export default function GenBuyConfig () {
    const generateBuyConfig = async () => {
        console.log("generateBuyConfig");
        fetch("/api/buy-config-api", {
          method: "GET",
        }).then(async (response) => {
          const json = await response.json();
          if (response.ok) {
              setBuyConfig(json);
          }})
      };

    const [buyConfig, setBuyConfig] = useState();

    const [buyOptions, setBuyOptions] = useState<BuyOptionsResponse>();
    const [country, setCountry] = useState('');
    const [subdivision, setSubdivision] = useState('');

    const generateBuyOptions = async () => {
      console.log("generateBuyOptions");
      fetch("/api/buy-options-api", {
        method: "POST",
        body: JSON.stringify({ country, subdivision}),
      }).then(async (response) => {
        const json = await response.json();
        if (response.ok) {
            setBuyOptions(json);
        }})

      if (buyOptions) {
        const payments_currencies = buyOptions.payment_currencies.map((currency) => {
          return currency.id;
        });
        console.log(payments_currencies)
      }
    };

    return (
      <div className="flex flex-col w-full space-y-5">
        <Button onClick={generateBuyConfig}> Generate Buy Configuration </Button>
        <Textarea
          isReadOnly
          label="Buy Configuration Response"
          variant="bordered"
          labelPlacement="outside"
          value={buyConfig ? JSON.stringify(buyConfig) : ""}
          className="w-full"
        />

        <Divider className="my-15" />
          <Input
            type="text"
            label="Country"
            placeholder="Enter country of payment"
            value={country}
            onValueChange={(value) => {
            setCountry(value);
            }}
          />
          <Input
            type="text"
            label="Subdivision"
            placeholder="Enter subdivision (optional)"
            value={subdivision}
            onValueChange={(value) => {
            setSubdivision(value);
            }}
          />

          <Button onClick={generateBuyOptions}> Generate Buy Options </Button>
          <Textarea
            isReadOnly
            label="Buy Options Response"
            variant="bordered"
            labelPlacement="outside"
            value={buyOptions ? JSON.stringify(buyOptions) : ""}
            className="w-full"
        />
      </div>
    )
}