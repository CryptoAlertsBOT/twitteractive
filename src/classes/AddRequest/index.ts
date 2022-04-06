import T from "../../bot";
import { checkSymbolValidity, sendMessageToUser } from "../../controllers";
import { Symbol } from "../../models/Symbol";
import { User } from "../../models/User";
import { CommandType, InvalidRequestType, SymbolDocument, UserDocument } from "../../types/twitter";
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

    public async addSubscription(): Promise<boolean> {
        // validate user
        let user: UserDocument = await IncomingRequest.validateUser(this.userID, this.username, this.screenName);

        // check if symbol is a valid symbol
        if (!await checkSymbolValidity(this.symbol)) {

            //notify user
            const text = `${this.symbol} is not a valid market ticker. Please try again with a valid one!\n\nExamples of valid tickers: BTCUSDT, ETHUSDT, ETHBTC etc.`;
            this.notifyInvalidRequest(InvalidRequestType.INVALID_SYMBOL, text);
            return false;
        }

        // check if already in DB.
        let symbol: SymbolDocument = await IncomingRequest.validateSymbol(this.symbol);
        let updatedUser;
        let updatedSymbol;
        try {
            
            updatedUser = await User.findByIdAndUpdate(user.get("_id"), {$push: {subscriptions: symbol._id}}, {new: true}).exec();
            updatedSymbol = await Symbol.findByIdAndUpdate(symbol.get("_id"), {$push: {users: user._id}}, {new: true}).exec();

        } catch (e: unknown) {
            
            this.notifyInvalidRequest(InvalidRequestType.UNKNOWN);
            return false;
        }

        if (updatedSymbol && updatedUser) {

            // like tweet
            this.likeTweet();
            // Send acknowledgement
            this.sendAddAck()
            return true;

        } else {
                
            this.notifyInvalidRequest(InvalidRequestType.UNKNOWN);
            return false;
        }
        
    }

    /**
     * @description Sends a notification to the user regarding the subscription add event.
     * @returns void
     */
    
    private sendAddAck(): void {
        const text: string = `Subscription added for ${this.symbol}, ${this.username}. You will be notified when it moves 3.5%.\n\n Tag us and say "remove #${this.symbol}" to remove this subscription.`
        sendMessageToUser(this.userID, text);
    }
}