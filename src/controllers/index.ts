import axios, { AxiosResponse } from "axios";
import mongoose from "mongoose";
import T from "../bot";
import fetch from "node-fetch";
import { Base } from "../types";



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
    try {
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
    } catch (err: any) {
        console.error(err)
    }
};



/**
 * Check if SYMBOL is a valid symbol. [Ends with USDT or BTC]
 */

 export const endsWithBase = (symbol: string): Base | boolean => {
    if (symbol.endsWith("BTC")) {
        return Base.BTC;
    } else if (symbol.endsWith("USDT")) {
        return Base.USDT;
    } else {
        return false;
    }
}


/**
 * - Function to get the first SYMBOL quote asset.
 * - removes base
 */

 export const getQuoteAsset = (symbol: string): string | void => {
    const base: Base | boolean = endsWithBase(symbol);
    if(base === false) return;

    if (base === Base.USDT) {
        const quoteAsset = symbol.replace("USDT", "");
        return quoteAsset;
    } else if(base === Base.BTC){
        const quoteAsset = symbol.replace("BTC", "");
        return quoteAsset;
    }
}


/**
 * - Get the formatted Trigger Time. 
 * 
 */

 export const formatTriggerTime = (time: number): string => {
    // time is in seconds
    if(time >= 86400) {
        return `${(time / 86400).toFixed(0)} day(s)`;
    } else if (time >= 3600) {
        return `${(time / 3600).toFixed(1)} hour(s)`;
    } else if (time >= 60){
        return `${(time / 60).toFixed(1)} min(s)`;
    } else {
        return `${(time).toFixed(0)} secs`;
    }
}


/**
 * Function to get the Base in string.
 */

 export const getBaseAbbrevation = (base: Base): string => {
    return base === Base.USDT ? "USDT" : "BTC";
};  


/**
 * - Function to get formatted date string
 * 
 */

 export const getFormattedDateTime = (): string => {
    let now: Date = new Date();

    const year: number = now.getUTCFullYear();
    const month: number = now.getUTCMonth();
    const day: number = now.getUTCDate();
    let hours: string | number = now.getUTCHours();
    let minutes: string | number = now.getUTCMinutes();
    let seconds: string | number = now.getUTCSeconds();

   hours = hours < 10 ? addZero(hours) : hours;
   minutes = minutes < 10 ? addZero(minutes) : minutes;
   seconds = seconds < 10 ? addZero(seconds) : seconds;

   let monthString: string ='';
    switch(month) {
        case 0: 
           monthString = "Jan";
           break;
        case 1: 
           monthString = "Feb";
           break;
        case 2: 
           monthString = "Mar";
           break;
        case 3: 
           monthString = "Apr";
           break;
        case 4: 
           monthString = "May";
           break;
        case 5: 
           monthString = "Jun";
           break;
        case 6: 
           monthString = "Jul";
           break;
        case 7: 
           monthString = "Aug";
           break;
        case 8: 
           monthString = "Sep";
           break;
        case 9: 
           monthString = "Oct";
           break;
        case 10: 
           monthString = "Nov";
           break;
        case 11:  
           monthString = "Dec";
           break;
        default:
           break;
    }

    const dateTimeString: string = `[${day} ${monthString}] - ${hours}:${minutes}:${seconds} UTC`;
    return dateTimeString;
};


const addZero = (value: number): string => {
    return `0${value}`;
};