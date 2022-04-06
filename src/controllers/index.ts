import axios, { AxiosResponse } from "axios";
import mongoose from "mongoose";
import T from "../bot";
import { apiConfig } from "../config";
import { APISymbolResponse } from "../types";



export const connectDB = async (): Promise<boolean> => {
    let connection: boolean = false;

    mongoose.connect("mongodb+srv://root:ProjectPassword11!!@cluster1.bgw5q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
        .then(() => {
            console.log('MongoDB Connected'.green);
            connection = true;
        })
        .catch((err: mongoose.CallbackError) => {
            console.error(err?.name, err?.stack);
        });

        return connection;
};

/**
 * 
 * @param symbol {String} 
 * @description call to GET /api/v3/ticker/price
 * @returns Promise<boolean>
 */
export const checkSymbolValidity = async (symbol: string): Promise<boolean> => {
    let response: AxiosResponse<APISymbolResponse> = await axios.get(`${apiConfig.baseURL}${apiConfig.marketPriceEndpoint}`, {params: {symbol}});
    
    // check if symbol is valid
    if (!response.data.symbol) {
        return false;
    } 

    return true;
};