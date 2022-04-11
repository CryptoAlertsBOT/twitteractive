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

export class SetAlert extends IncomingRequest {

    // public commandType: CommandType = CommandType.ADD;
    private hashtags: Array<string>;
    private symbol: string;
    private trigger_price: number;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string, hashtags: Array<Object>, reTweeted: boolean) {

        // Instantiate super class [IncomingRequest]
        super(tweetID, userID, accountName, screenName, text, reTweeted, CommandType.SETALERT);

        // set class specific properties
        this.hashtags = IncomingRequest.extractSymbols(hashtags);
        // set symbol to the first recorded hashtag.
        this.symbol = this.hashtags[0];

        this.trigger_price = IncomingRequest.extractPrice(text);

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
        let user: UserDocument = await IncomingRequest.validateUser(this.userID, this.username, this.screenName);

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
                    this.notifyInvalidRequest(InvalidRequestType.INVALID_SYMBOL, text);
                    return false;
                }
        
                // check if already in DB.
                let symbol: SymbolDocument = await IncomingRequest.validateSymbolAndCreate(this.symbol);
                
                try {
                    
                   // check if already present
                    const isInArray = user.get('alerts').some((sub: mongoose.Types.ObjectId) => {
                        return sub.equals(symbol.get("_id"));
                    });

                    if (isInArray) {
                        sendMessageToUser(this.userID, `${this.symbol} is already added to your alerts!`);
                        return false;
                    }

                    // update symbol list 
                    await User.findOneAndUpdate({_id: user._id}, {$addToSet: {alerts: symbol._id}}, {upsert: true}).exec();
                    await Symbol.findOneAndUpdate({_id: symbol._id}, {$addToSet: {users: user._id}}, {upsert: true}).exec();
                    
                    const newAlert: AlertDocument = new CustomAlert({
                        symbol,
                        user,
                        trigger_price: this.trigger_price,
                        price_when_set: data.price,
                    })
        
                    newAlert.save();

                    // like tweet
                    this.likeTweet();

                    // Send acknowledgement
                    this.sendAddAck()

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
    
    private sendAddAck(): void {
        const text: string = `Alert added for ${this.symbol}, ${this.username}. You will be notified when it hits ${this.symbol}.\n\n Tag us and say "remove #${this.symbol}" to remove this subscription.`
        sendMessageToUser(this.userID, text);
    }
}