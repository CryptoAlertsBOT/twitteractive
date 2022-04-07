import mongoose from "mongoose";
import { sendMessageToUser } from "../../controllers";
import { Symbol } from "../../models/Symbol";
import { User } from "../../models/User";
import { CommandType, InvalidRequestType, SymbolDocument, UserDocument } from "../../types/twitter";
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
        let user: UserDocument = await IncomingRequest.validateUser(this.userID, this.username, this.screenName);

        // check if symbol is valid
        let symbol: SymbolDocument | null = await IncomingRequest._checkIfValidSymbol(this.symbol);
        
        if(!symbol) {
            //notify user
            const text = `${this.symbol} is not a valid market ticker. Please try again with a valid one!\n\nExamples of valid tickers: BTCUSDT, ETHUSDT, ETHBTC etc.`;
            this.notifyInvalidRequest(InvalidRequestType.INVALID_SYMBOL, text);
            return false;
        }

        
        try {
            // Check if user has symbol subscription.
            // check if already present
            const isInArray = user.get('subscriptions').some((sub: mongoose.Types.ObjectId) => {
                return sub.equals(symbol!.get("_id"));
            });

            if (!isInArray) {
                sendMessageToUser(this.userID, `You aren't subscribed to #${this.symbol}!`);
                return false;
            }

            // update symbol list 
            await User.findOneAndUpdate({_id: user._id}, {$pull: {subscriptions: symbol._id}}, {upsert: true}).exec();
            await Symbol.findOneAndUpdate({_id: symbol._id}, {$pull: {users: user._id}}, {upsert: true}).exec();

            // like tweet
            this.likeTweet();

            // Send acknowledgement
            this.sendRemoveAck()

            return true;

        } catch (e: unknown) {
            
            this.notifyInvalidRequest(InvalidRequestType.UNKNOWN);
            return false;
        }
        
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