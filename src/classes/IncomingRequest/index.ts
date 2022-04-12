import T from "../../bot";
import { sendMessageToUser } from "../../controllers";
import { CustomAlert } from "../../models/CustomAlert";
import { Symbol } from "../../models/Symbol";
import { User } from "../../models/User";
import { INVALID_COMMAND_TEXT, INVALID_SYMBOL_TEXT, MULTIPLE_COMMANDS_TEXT, UNKNOWN_ERROR } from "../../types/constants";
import { AlertDocument, CommandType, InvalidRequestType, SymbolDocument, UserDocument } from "../../types/twitter";

export class IncomingRequest {
    readonly tweetID: string;
    public readonly userID: string;
    readonly username: string;
    readonly screenName: string;
    readonly text: string;
    readonly reTweeted: boolean;
    public commandType: CommandType;

    constructor(tweetID: string, userID: string, accountName: string, screenName: string, text: string, reTweeted: boolean, type: CommandType) {
        this.tweetID = tweetID;
        this.userID = userID;
        this.username = accountName;
        this.screenName = screenName;
        this.text = text;
        this.reTweeted = reTweeted;
        this.commandType = type == null ? CommandType.UNSET : type;

        // log
        this.log()
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

            newUser.save();
            return newUser;
        }

        return currentUser;
    }


    /**
     * @description Check if symbol exists in DB, if not - add symbol to DB.
     * @param symbol {String} Current symbol string
     */

     public static async validateSymbolAndCreate(symbol: string): Promise<SymbolDocument> {
        let currentSymbol: SymbolDocument | null = await Symbol.findOne({symbol}).exec();
        
        if (!currentSymbol) {
            const newSymbol: SymbolDocument = new Symbol({ symbol, users: [] });

            newSymbol.save();
            return newSymbol;
        }

        return currentSymbol;
    }

        /**
     * @description Check if symbol exists in DB, if not - add symbol to DB.
     * @param symbol_id {ObjectID} Current symbol mongoose objectID
     * @param  user_id {ObjectID} Current user mongoose objectId
     * @param  t_price {Number} Trigegr price
     * @param  c_price {Number} Current Price
     */

         public static async validateAlert(symbol_id: mongoose.Types.ObjectId, user_id: mongoose.Types.ObjectId, t_price: number, c_price: number): Promise<AlertDocument | null>  {
            let currentAlert: AlertDocument | null = await CustomAlert.findOne({
                symbol: symbol_id, 
                user: user_id,
                trigger_price: t_price
            }).exec();
            
            // If alert already exists, we want to send back null.
            // This is so that we can notify the user that the alert is already set for that symbol at that price.
            if (currentAlert) {
                return null;
            }

            const newAlert: AlertDocument = new CustomAlert({ 
                symbol: symbol_id, 
                user: user_id,
                trigger_price: t_price,
                price_when_set: c_price
            });

            newAlert.save();
            return newAlert;
    
            
        }

    
    /**
     * @description Check if symbol exists in DB, if not - add symbol to DB.
     * @param symbol {String} Current symbol string
     */

     public static async _checkIfValidSymbol(symbol: string): Promise<SymbolDocument | null> {
        let currentSymbol: SymbolDocument | null = await Symbol.findOne({symbol: symbol}).exec();

        return currentSymbol;
    }

    /**
     * @description Search this.text for CommandTypes
     * If doesn't match any of the CommandTypes, set as new IncomingRequest(). 
     * Otherwise, for add - new AddRequest() etc..
     * 
     * @returns CommandType[] enum
     */

    public static validateRequest(text: string): CommandType[] {
        let commands: CommandType[] = [];

        const addKeyword = 'add'
        const addKeywordRegex = new RegExp("(^| +)" + addKeyword + "( +|[.])", "i");
        const isAddRequest = addKeywordRegex.test(text)

        const removeKeyword = 'remove'
        const removeKeywordRegex = new RegExp("(^| +)" + removeKeyword + "( +|[.])", "i");
        const isRemoveRequest = removeKeywordRegex.test(text)

        const setalertKeyword = 'setalert'
        const setalertKeywordRegex = new RegExp("(^| +)" + setalertKeyword + "( +|[.])", "i");
        const isSetAlertRequest = setalertKeywordRegex.test(text)

        const removealertKeyword = 'removealert'
        const removealertKeywordRegex = new RegExp("(^| +)" + removealertKeyword + "( +|[.])", "i");
        const isRemoveAlertRequest = removealertKeywordRegex.test(text)

        if(isAddRequest) {
            commands.push(CommandType.ADD)
        }
        if(isRemoveRequest) {
            commands.push(CommandType.REMOVE)
        }
        if(isSetAlertRequest) {
            commands.push(CommandType.SETALERT)
        }
        if(isRemoveAlertRequest) {
            commands.push(CommandType.REMOVEALERT)
        }

        return commands;
    }

    /**
     * classes/IncomingRequest
     * @description notify user of an invalid command or request.
     * @param type {Enum} Type of invalidity.
     */
    public notifyInvalidRequest(type: InvalidRequestType, customText?: string): void {

        // Switch case
        switch(type) {
            case InvalidRequestType.INVALID_COMMAND:
                sendMessageToUser(this.userID, INVALID_COMMAND_TEXT);
                break;

            case InvalidRequestType.MULTIPLE_COMMANDS:
                sendMessageToUser(this.userID, MULTIPLE_COMMANDS_TEXT);
                break;

            case InvalidRequestType.INVALID_SYMBOL:
                customText ? sendMessageToUser(this.userID, customText) : sendMessageToUser(this.userID, INVALID_SYMBOL_TEXT);
                break;

            case InvalidRequestType.UNKNOWN:
                sendMessageToUser(this.userID, UNKNOWN_ERROR);
                break;
                
            default:
                break;
        }

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