# CB Onramp quickstart

## Introduction
Welcome to Coinbase Onramp! This demo app will get you up and running with a basic API integration with Coinbase Onramp. 

## Onramp initialization
Coinbase Onramp can be initialized two ways: via URL (non-secure) or via API (secure). In the URL method, all initialization parameters are passed as query string parameters. In the API method, the destination wallet address is passed via an API call which returns a one-time-use session token. The session token is then combined with the rest of the initialization parameters to generate an Onramp URL. See [docs](https://docs.cdp.coinbase.com/pay-sdk/docs/api-initializing/) for more details. 

## Onramp APIs
Coinbase Onramp has several APIs that can be called from a backend server to support different types of integrations. The use cases they support include:
- Creating session tokens
- Generating quotes for onramp aggregation
- Retrieving supported assets and payment methods in a given country

Note: an API integration is not required to use Onramp. The quickest way to use onramp is to pass all initialization parameters via query string parameter. 

## API keys
All of the Onramp APIs require a JWT bearer token. To generate JWTs you'll need to create an API key which can be created in the CDP portal. You can find example code to generate JWTs [here](https://docs.cdp.coinbase.com/sign-in-with-coinbase/docs/api-key-authentication/). 

## Demo app
This repo includes a simple demo app which calls the session tokens API to generate an Onramp URL (i.e. the secure initialization method). 
Instructions: Enter an Ethereum address in the text box, click Generate secure token, and then launch Onramp with the generated URL. 

## How to run
First, download an API key from the CDP portal and drop it into the api_keys folder as cdp_api_key.json. Install dependencies by running `yarn install`. Then start the app by running `yarn run dev` and navigate to [localhost:3000](localhost:3000).