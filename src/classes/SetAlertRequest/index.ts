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
    private trigger_price: number | null;
    private price_when_set!: number;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string, hashtags: Array<Object>, reTweeted: boolean) {

        // Instantiate super class [IncomingRequest]
        super(tweetID, userID, accountName, screenName, text, reTweeted, CommandType.SETALERT);

        // set class specific properties
        this.hashtags = IncomingRequest.extractSymbols(hashtags);
        this.trigger_price = SetAlertRequest.extractPrice(text);
        
        // set symbol to the first recorded hashtag.
        this.symbol = '';
        if(this.hashtags[0] == undefined) return;
        this.symbol = this.hashtags[0].toUpperCase();

        // log to console
        this.log(CommandType.SETALERT);
    }

    public static extractPrice(text: string): number | null{
        const regex: RegExp = /[+-]?\d+(\.\d+)?/g;
        const textArr: string[] = text.split("-p")
        let price: RegExpMatchArray | null;

        if(textArr.length > 1) {
            price = textArr[1].match(regex);
            if (!price) return null;

            // else
            let match: number[] = price.map((v) => { return parseFloat(v); });

           if(match.length > 0) return match[0];
        }

        return null;
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
        // check if trigger price is valid
        if(!this.trigger_price) {
            IncomingRequest.notifyInvalidRequest(this.userID, InvalidRequestType.INVALID_TRIGGER_PRICE);
            return false;
        }


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

                    //notify user
                    const text = `${this.symbol} is not a valid market ticker. Please try again with a valid one!\n\nExamples of valid tickers: BTCUSDT, ETHUSDT, ETHBTC etc.`;
                    IncomingRequest.notifyInvalidRequest(this.userID, InvalidRequestType.INVALID_SYMBOL, text);
                    return false;
                }
              
                
                try {
                    // set current price from binance data 
                    this.price_when_set = data.price;

                    // get symbol from DB
                    let symbol: SymbolDocument = await IncomingRequest.validateSymbolAndCreate(this.symbol);

                    // check if already in DB.
                    let alert: AlertDocument | null = await this.validateAlert(symbol.get("_id"), user.get("_id"), this.trigger_price!, this.price_when_set);

                    // If alert is null, it means that the alert already exists.
                    // Notify user of the error.
                    // return false.
                    if(!alert) {
                        sendMessageToUser(this.userID, `#${this.symbol} already has a price alert set at ${this.trigger_price}!`);
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
                    
                    IncomingRequest.notifyInvalidRequest(this.userID, InvalidRequestType.UNKNOWN);
                    return false;
                }
            })
        return false
        
    }

    /**
     * @description Check if Alert exists in DB, if not - returns null. Otherwise returns the alert document.
     * @param symbol_id {ObjectID} Current symbol mongoose objectID
     * @param  user_id {ObjectID} Current user mongoose objectId
     * @param  t_price {Number} Trigegr price
     * @param  c_price {Number} Current Price
     */

    private async validateAlert(symbol_id: mongoose.Types.ObjectId, user_id: mongoose.Types.ObjectId, t_price: number, c_price: number): Promise<AlertDocument | null>  {
        let currentAlert: AlertDocument | null = await CustomAlert.findOne({
            symbol: symbol_id, 
            user: user_id,
            trigger_price: t_price
        }).exec();
        
        // If alert already exists, we want to send back null.
        // This is so that we can notify the user that the alert is already set for that symbol at that price.
        if (currentAlert) {
            return null;
        }

        const newAlert: AlertDocument = new CustomAlert({ 
            symbol: symbol_id, 
            user: user_id,
            trigger_price: t_price,
            price_when_set: c_price
        });

        newAlert.save();
        return newAlert;

    
    }

    /**
     * @description Sends a notification to the user regarding the subscription add event.
     * @returns void
     */
    
    private sendAddAlertAck(): void {
        const text: string = `You will be notified when #${this.symbol} hits ${this.trigger_price}, ${this.username}. \n\n Tag us and say "removealert #${this.symbol} -p ${this.trigger_price}" to remove this custom alert.`
        sendMessageToUser(this.userID, text);
    }
}