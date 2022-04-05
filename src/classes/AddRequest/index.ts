import mongoose from "mongoose";
import T from "../../bot";
import { Symbol } from "../../models/Symbol";
import { User } from "../../models/User";
import { IUserSchema } from "../../models/User/types";
import { CommandType, SymbolDocument, UserDocument } from "../../types/twitter";
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

        // validate symbol.
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

        // create symbol if not exists in `symbol` collection.
        let symbol: SymbolDocument = await IncomingRequest.validateSymbol(this.symbol);
        
        try {
            
            let updatedUser = await User.findByIdAndUpdate(user.get("_id"), {$push: {subscriptions: symbol._id}}, {new: true}).exec();
            let updatedSymbol = await Symbol.findByIdAndUpdate(symbol.get("_id"), {$push: {users: user._id}}, {new: true}).exec();

            console.log("updated_user ", updatedUser);
            console.log("updated symbol ", updatedSymbol);

        } catch (e: unknown) {
            console.log(e);
            return false;
        }

        // like tweet
        this.likeTweet();
        // Send acknowledgement
        this.sendAddAck()
        return true;
    }

    /**
     * @description Sends a notification to the user regarding the subscription add event.
     * @returns void
     */
    
    private sendAddAck(): void {
        T.post('direct_messages/events/new', 
            {//@ts-ignore
                event: {
                    type: 'message_create',
                    message_create: {
                        target: {
                            recipient_id: this.userID
                        },
                        message_data: {
                            text: `Subscription added for ${this.symbol}, ${this.username}. You will be notified when it moves 3.5%.\n\n Tag us and say "remove #${this.symbol}" to remove this subscription.` 
                        }
                    }
                }
            }, 
            (err, data, response) => {
                if (!err) {
                    console.log("Message sent".yellow);
                } else {
                    console.log(err);
                }
            }
        )
    }
}