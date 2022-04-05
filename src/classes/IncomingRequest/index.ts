import T from "../../bot";
import { CommandType } from "../../types/twitter";

export class IncomingRequest {
    readonly tweetID: string;
    readonly userID: string;
    readonly name: string;
    readonly screenName: string;
    readonly text: string;
    public commandType: CommandType = CommandType.UNSET;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string) {
        this.tweetID = tweetID;
        this.userID = userID;
        this.name = accountName;
        this.screenName = screenName;
        this.text = text;
    }

    public static extractSymbols(hashtags: Array<Object>): Array<string> {
        return hashtags.map((tag: any) => tag.text);
    }

    /**
     * @description Search this.text for CommandTypes
     * If doesn't match any of the CommandTypes, set as new IncomingRequest(). 
     * Otherwise, for add - new AddRequest() etc..
     * 
     * @returns CommandType enum
     */
    public static validateRequest(): CommandType {
        
    }

    public log(): void {
        console.group(`TWEET ID: `.bgGreen, this.tweetID);
                console.log('USER ID: '.bgMagenta, this.userID);
                console.log('Screen Name: '.bgMagenta, this.screenName);
                console.log('TEXT: '.bgMagenta, this.text);
                console.log('COMMAND TYPE: '.bgMagenta, this.commandType);
        console.groupEnd();
    }
}