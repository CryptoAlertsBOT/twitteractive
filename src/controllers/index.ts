import axios, { AxiosResponse } from "axios";
import mongoose from "mongoose";
import T from "../bot";
import fetch from "node-fetch";



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
export const getBinanceData = async (symbol: string): Promise<Response | null>  => {
    symbol = symbol.toUpperCase();
    try {
        let url = new URL('https://api.binance.com/api/v3/ticker/price');
        var params = {symbol};
        url.search = new URLSearchParams(params).toString();
        //@ts-ignore
        return fetch(url);
        

    } catch(err) {
        console.log(err)
        return null;
    }
};

/**
 * @description Controller to send messages to USER.
 * @param userID Twitter ID
 * @param text Message to send
 */
export const sendMessageToUser = (userID: string, text:string) => {
    T.post('direct_messages/events/new', 
            {//@ts-ignore
                event: {
                    type: 'message_create',
                    message_create: {
                        target: {
                            recipient_id: userID
                        },
                        message_data: { text }
                    }
                }
            }, 
            (err, data, response) => {
                if (err) {
                    console.log('ERROR SENDING MESSAGE', err);
                }
            }
        )
};