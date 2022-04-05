import T from "../../bot";
import { CommandType } from "../../types/twitter";
import { IncomingRequest } from "../IncomingRequest";

/**
 * Class for all 'add' requests.
 * Command Type 'ADD'
 * @params SYMBOL symbol to add to user subscription.
 */

export class AddRequest extends IncomingRequest {

    public commandType: CommandType = CommandType.ADD;
    private hashtags: Array<string>;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string, hashtags: Array<Object>) {

        // Instantiate super class [IncomingRequest]
        super(tweetID, userID, accountName, screenName, text);

        // set class specific properties
        this.hashtags = IncomingRequest.extractSymbols(hashtags)
    }


    /**
     * @AnkitVaity @anubhavanand23 @
     * @description Function to add the subscription request to the database.
     * @params Symbol - this.symbol
     * @params User - this.userID
     * 
     * @summary Must add the SYMBOL given to the `user.subscriptions` collection.
     * on Success trigger this.sendAck()
     */

    public addSubscription() {
        
    }




    private sendAck(): void {
        T.post('direct_messages/events/new', 
            {//@ts-ignore
                event: {
                    type: 'message_create',
                    message_create: {
                        target: {
                            recipient_id: this.userID
                        },
                        message_data: {
                            text: `Alert created for ${this.hashtags[0]}, ${this.name}. You will be notified when it hits.`
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