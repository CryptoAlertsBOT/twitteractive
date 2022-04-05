import mongoose from "mongoose";
import T from "../../bot";
import { Symbol } from "../../models/Symbol";
import { User } from "../../models/User";
import { IUserSchema } from "../../models/User/types";
import { CommandType, SymbolDocument, UserDocument } from "../../types/twitter";

export class IncomingRequest {
    readonly tweetID: string;
    readonly userID: string;
    readonly username: string;
    readonly screenName: string;
    readonly text: string;
    public commandType: CommandType = CommandType.UNSET;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string) {
        this.tweetID = tweetID;
        this.userID = userID;
        this.username = accountName;
        this.screenName = screenName;
        this.text = text;
    }

    public static extractSymbols(hashtags: Array<Object>): Array<string> {
        return hashtags.map((tag: any) => tag.text);
    }

    /**
     * @description Check if user exists in DB, if not - add user to DB.
     * @param twitterID - twitter ID
     * @param username twitter name
     * @param screen_name twitter `@username`
     * @returns Promise<boolean>
     */

    public static async validateUser(twitterID: string, username: string, screen_name: string): Promise<UserDocument> {
        let currentUser: UserDocument | null = await User.findOne({twitterID}).exec();
        
        if (!currentUser) {
            const newUser: UserDocument = new User({
                twitterID,
                username,
                screen_name,
                subscriptions: [],
                alerts: []
            })

            return newUser;
        }

        return currentUser;
    }


    /**
     * @description Check if symbol exists in DB, if not - add symbol to DB.
     * @param symbol {String} Current symbol string
     */

     public static async validateSymbol(symbol: string): Promise<SymbolDocument> {
        let currentSymbol: SymbolDocument | null = await Symbol.findOne({symbol}).exec();
        
        if (!currentSymbol) {
            const newSymbol: SymbolDocument = new Symbol({ symbol, users: [] });

            return newSymbol;
        }

        return currentSymbol;
    }

    /**
     * @description Search this.text for CommandTypes
     * If doesn't match any of the CommandTypes, set as new IncomingRequest(). 
     * Otherwise, for add - new AddRequest() etc..
     * 
     * @returns CommandType enum
     */
    public static validateRequest(): CommandType {

     return CommandType.ADD; // or whatever
    }

    public log(): void {
        console.group(`TWEET ID: `.bgGreen, this.tweetID);
                console.log('USER ID: '.bgMagenta, this.userID);
                console.log('Screen Name: '.bgMagenta, this.screenName);
                console.log('TEXT: '.bgMagenta, this.text);
                console.log('COMMAND TYPE: '.bgMagenta, this.commandType);
        console.groupEnd();
    }

    protected likeTweet () {
        T.post('favorites/create',  {id: this.tweetID}, (err, data, response) => {
            if (err) {
                console.log(err)
            }
        });
    }
}