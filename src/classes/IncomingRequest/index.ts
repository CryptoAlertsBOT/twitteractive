import T from "../../bot";
import { CommandType } from "../../types/twitter";

export class IncomingRequest {
    readonly tweetID: string;
    readonly userID: string;
    readonly name: string;
    readonly screenName: string;
    readonly text: string;
    #hashtags: Array<string>;
    public commandType: CommandType = CommandType.UNSET;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string, hashtags: Array<Object>) {
        this.tweetID = tweetID;
        this.userID = userID;
        this.name = accountName;
        this.screenName = screenName;
        this.text = text;
        this.#hashtags = IncomingRequest.extractSymbols(hashtags);
    }

    public static extractSymbols(hashtags: Array<Object>): Array<string> {
        return hashtags.map((tag: any) => tag.text);
    }

    public log(): void {
        console.group(`TWEET ID: `.bgGreen, this.tweetID);
                console.log('USER ID: '.bgMagenta, this.userID);
                console.log('Screen Name: '.bgMagenta, this.screenName);
                console.log('TEXT: '.bgMagenta, this.text);
                console.log('SYMBOL HASH: '.bgMagenta, this.#hashtags);
                console.log('COMMAND TYPE: '.bgMagenta, this.commandType);
        console.groupEnd();
    }

    public sendAck(): void {
        T.post('direct_messages/events/new', 
            {//@ts-ignore
                event: {
                    type: 'message_create',
                    message_create: {
                        target: {
                            recipient_id: this.userID
                        },
                        message_data: {
                            text: `Alert created for ${this.#hashtags[0]}, ${this.name}. You will be notified when it hits.`
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