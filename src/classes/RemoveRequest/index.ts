import mongoose from "mongoose";
import { sendMessageToUser } from "../../controllers";
import { Subscription } from "../../models/Subscription";
import { Symbol } from "../../models/Symbol";
import { User } from "../../models/User";
import { CommandType, InvalidRequestType, SubscriptionDocument, SymbolDocument, UserDocument } from "../../types/twitter";
import { IncomingRequest } from "../IncomingRequest";

/**
 * Class for all 'remove' requests.
 * Command Type 'REMOVE'
 * @params SYMBOL symbol to add to user subscription.
 */

export class RemoveRequest extends IncomingRequest {

    // public commandType: CommandType = CommandType.ADD;
    private hashtags: Array<string>;
    private symbol: string;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string, hashtags: Array<Object>, reTweeted: boolean) {

        // Instantiate super class [IncomingRequest]
        super(tweetID, userID, accountName, screenName, text, reTweeted, CommandType.REMOVE);

        // set class specific properties
        this.hashtags = IncomingRequest.extractSymbols(hashtags);
        // set symbol to the first recorded hashtag.
        this.symbol = this.hashtags[0];

        // log to console
        this.log(CommandType.REMOVE);

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

    public async removeSubscription(): Promise<boolean> {
        // validate user
        let user: UserDocument = await IncomingRequest.validateUserAndCreate(this.userID, this.username, this.screenName);

        // check if symbol is valid
        let symbol: SymbolDocument | null = await IncomingRequest._checkIfValidSymbol(this.symbol);
        
        if(!symbol) {
            //notify user
            const text = `${this.symbol} is not a valid market ticker. Please try again with a valid one!\n\nExamples of valid tickers: BTCUSDT, ETHUSDT, ETHBTC etc.`;
            IncomingRequest.notifyInvalidRequest(this.userID, InvalidRequestType.INVALID_SYMBOL, text);
            return false;
        }

        
        try {
            // Check if user has symbol subscription.
            // check if already present
           let subscription: SubscriptionDocument | null = await this._validateRemoveSub(symbol.get('_id'), user.get('_id'));

           // No subscription exists, then
           if (!subscription) {
               IncomingRequest.notifyInvalidRequest(this.userID, InvalidRequestType.SUBSCRIPTION_ERROR, `You don't have a subscription set for ${this.symbol}`);
               return false;
           }

            // update symbol list 
            await User.findOneAndUpdate({_id: user._id}, {$pull: {subscriptions: subscription._id}}, {upsert: true}).exec();
            await Symbol.findOneAndUpdate({_id: symbol._id}, {$pull: {subs: subscription._id}}, {upsert: true}).exec();

            // like tweet
            this.likeTweet();

            // Send acknowledgement
            this.sendRemoveAck()

            return true;

        } catch (e: unknown) {
            
            IncomingRequest.notifyInvalidRequest(this.userID, InvalidRequestType.UNKNOWN);
            return false;
        }
        
    }


    /**
     * Function to validate remove subscription request
     * @description checks to see if sub is present.
     */

    private async _validateRemoveSub(symbol_id: mongoose.Types.ObjectId, user_id: mongoose.Types.ObjectId): Promise<SubscriptionDocument | null> {

        const sub: SubscriptionDocument | null = await Subscription.findOne({symbol: symbol_id, user: user_id}).exec();
        if (!sub) {
            return null;
        }

        return sub;
    }

    /**
     * @description Sends a notification to the user regarding the subscription add event.
     * @returns void
     */
    
    private sendRemoveAck(): void {
        const text: string = `Subscription removed for ${this.symbol}, ${this.username}.\n\n Tag us and say "add #${this.symbol}" to add this subscription again.`
        sendMessageToUser(this.userID, text);
    }
}