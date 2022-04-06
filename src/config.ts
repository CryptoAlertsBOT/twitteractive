import { IConfig } from "./types";

export const apiConfig: IConfig = {
    baseURL: "https://api.binance.com",
    marketPriceEndpoint: "/api/v3/ticker/price",
    symbolStats: "/api/v3/ticker/24hr",
    marketData: "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest",
}