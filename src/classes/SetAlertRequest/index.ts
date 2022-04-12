import mongoose from "mongoose";
import { getBinanceData, sendMessageToUser } from "../../controllers";
import { Symbol } from "../../models/Symbol";
import { User } from "../../models/User";
import { CustomAlert } from "../../models/CustomAlert";
import { CommandType, InvalidRequestType, SymbolDocument, UserDocument, AlertDocument } from "../../types/twitter";
import { IncomingRequest } from "../IncomingRequest";

/**
 * Class for all 'add' requests.
 * Command Type 'ADD'
 * @params SYMBOL symbol to add to user subscription.
 */

export class SetAlertRequest extends IncomingRequest {

    // public commandType: CommandType = CommandType.ADD;
    private hashtags: Array<string>;
    private symbol: string;
    private trigger_price: number;
    private price_when_set!: number;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string, hashtags: Array<Object>, reTweeted: boolean) {

        // Instantiate super class [IncomingRequest]
        super(tweetID, userID, accountName, screenName, text, reTweeted, CommandType.SETALERT);

        // set class specific properties
        this.hashtags = IncomingRequest.extractSymbols(hashtags);
        // set symbol to the first recorded hashtag.
        this.symbol = this.hashtags[0];

        this.trigger_price = SetAlertRequest.extractPrice(text);

    }

    public static extractPrice(text: string): number{
        const regex = /[+-]?\d+(\.\d+)?/g;
        const textArr = text.split("-p")
        let price: string | any[] = [];

        if(textArr.length > 1) {
            price = textArr[1].match(regex).map(function(v) { return parseFloat(v); });
        }

        if (price.length > 0) {
            return price[0]
        }
        
        return 0;
    }


    /**
     * @description Function to add the subscription request to the database.
     * @params Symbol - this.symbol
     * @params User - this.userID
     * 
     * @summary Must add the SYMBOL given to the `user.subscriptions` collection.
     * on Success trigger this.sendAck()
     * 
     * @returns Promise<boolean>
     */

    public async addAlert(): Promise<boolean> {
        // validate user
        let user: UserDocument = await IncomingRequest.validateUserAndCreate(this.userID, this.username, this.screenName);

        // check if symbol is a valid symbol
        const data: Promise<Response | null> = getBinanceData(this.symbol)
        let isValidSymbol = true;
        data
            .then((res) => res?.json())
            .then(async (data) => {
                if (data.msg) {
                    isValidSymbol = false;
                }

                if (!isValidSymbol) {

                    // Set current price 
                    this.price_when_set = data.price;

                    //notify user
                    const text = `${this.symbol} is not a valid market ticker. Please try again with a valid one!\n\nExamples of valid tickers: BTCUSDT, ETHUSDT, ETHBTC etc.`;
                    this.notifyInvalidRequest(InvalidRequestType.INVALID_SYMBOL, text);
                    return false;
                }
              
                
                try {
                    // set current price from binance data 
                    this.price_when_set = data.price;

                    // get symbol from DB
                    let symbol: SymbolDocument = await IncomingRequest.validateSymbolAndCreate(this.symbol);

                    // check if already in DB.
                    let alert: AlertDocument | null = await IncomingRequest.validateAlert(symbol.get("_id"), user.get("_id"), this.trigger_price, this.price_when_set);

                    // If alert is null, it means that the alert already exists.
                    // Notify user of the error.
                    // return false.
                    if(!alert) {
                        sendMessageToUser(this.userID, `${this.symbol} already has a price alert set at ${this.trigger_price}!`);
                        return false;
                    }

                    // if alert is not null, a new alert has been added to the customalert database.
                    // update the user model to include this alert in the alerts list.
                    // update alerts list in User model
                    await User.findOneAndUpdate({_id: user._id}, {$addToSet: {alerts: alert._id}}, {upsert: true}).exec();

                    // like tweet
                    this.likeTweet();

                    // Send acknowledgement
                    this.sendAddAlertAck()

                    return true;
        
                } catch (e: unknown) {
                    
                    this.notifyInvalidRequest(InvalidRequestType.UNKNOWN);
                    return false;
                }
            })
        return false
        
    }

    /**
     * @description Sends a notification to the user regarding the subscription add event.
     * @returns void
     */
    
    private sendAddAlertAck(): void {
        const text: string = `You will be notified when ${this.symbol} hits ${this.trigger_price}, ${this.username}. \n\n Tag us and say "removealert #${this.symbol} -p ${this.trigger_price}" to remove this custom alert.`
        sendMessageToUser(this.userID, text);
    }
}