import mongoose from "mongoose";
import { getBinanceData, sendMessageToUser } from "../../controllers";
import { Subscription } from "../../models/Subscription";
import { Symbol } from "../../models/Symbol";
import { User } from "../../models/User";
import { CommandType, InvalidRequestType, SubscriptionDocument, SymbolDocument, UserDocument } from "../../types/twitter";
import { IncomingRequest } from "../IncomingRequest";

/**
 * Class for all 'add' requests.
 * Command Type 'ADD'
 * @params SYMBOL symbol to add to user subscription.
 */

export class AddRequest extends IncomingRequest {

    // public commandType: CommandType = CommandType.ADD;
    private hashtags: Array<string>;
    private symbol: string;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string, hashtags: Array<Object>, reTweeted: boolean) {

        // Instantiate super class [IncomingRequest]
        super(tweetID, userID, accountName, screenName, text, reTweeted, CommandType.ADD);

        // set class specific properties
        this.hashtags = IncomingRequest.extractSymbols(hashtags);
        // set symbol to the first recorded hashtag.
        this.symbol = this.hashtags[0].toUpperCase();

        // log to console
        this.log(CommandType.ADD);
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

    public async addSubscription(): Promise<boolean> {
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
        
                // check if already in DB.
                let symbol: SymbolDocument = await IncomingRequest.validateSymbolAndCreate(this.symbol);
                
                try {
                    // Create a subscription document and save.
                    let subscription: SubscriptionDocument | null = await this._validateAddSub(symbol.get('_id'), user.get('_id'));

                    // if subs is present, notify.
                    if (!subscription) {
                        IncomingRequest.notifyInvalidRequest(this.userID, InvalidRequestType.SUBSCRIPTION_ERROR, `You already have a subscription set for #${this.symbol}`);
                        return false;
                    }

                    // add subscription _id to user and symbol 
                    await User.findOneAndUpdate({_id: user._id}, {$addToSet: {subscriptions: subscription._id}}, {upsert: true}).exec();
                    await Symbol.findOneAndUpdate({_id: symbol._id}, {$addToSet: {subs: subscription._id}}, {upsert: true}).exec();

                    // like tweet
                    this.likeTweet();

                    // Send acknowledgement
                    this.sendAddAck()

                    return true;
        
                } catch (e: unknown) {
                    
                    IncomingRequest.notifyInvalidRequest(this.userID, InvalidRequestType.UNKNOWN);
                    return false;
                }
            })
        return false
        
    }

    /**
     * Function which validates the add subscription request.
     */

    private async _validateAddSub(symbol_id: mongoose.Types.ObjectId, user_id: mongoose.Types.ObjectId): Promise<SubscriptionDocument | null> {
        
        let sub: SubscriptionDocument | null = await Subscription.findOne({symbol: symbol_id, user: user_id}).exec();

        if (sub) {
            return null;
        }

        // if not exists, create a subscription document
        let newSub: SubscriptionDocument = new Subscription({
            symbol: symbol_id,
            user: user_id
        });

        await newSub.save();
        return newSub;
    }

    /**
     * @description Sends a notification to the user regarding the subscription add event.
     * @returns void
     */
    
    private sendAddAck(): void {
        const text: string = `Subscription added for #${this.symbol}, ${this.username}. You will be notified when it moves 3.5%.\n\n Tag us and say "remove #${this.symbol}" to remove this subscription.`
        sendMessageToUser(this.userID, text);
    }
}