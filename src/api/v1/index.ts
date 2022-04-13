import {Request, Response, Router} from "express";
import "dotenv/config";
import {env} from 'process';
import colors from "colors";
import { IThresholdData, IPricePayload } from "../../types";
import { Symbol } from "../../models/Symbol";
import { SubscriptionDocument, SymbolDocument, UserDocument } from "../../types/twitter";
import { Subscription } from "../../models/Subscription";
import { notification } from "../../events/Notification/handler";
import { PriceNotification } from "../../events/Notification/types";

// Instantiate Express Router
export const router: Router = Router();

/**
 * @description Root response for Backend Server.
 * @returns JSON Response 
 * 
 */
 router.get('/', (req: Request, res: Response) => {
    res.json({
        version: env.VERSION!,
        description: "Webhook API for CryptoBOT Twitter Service",
    })
});


/**
 * Listen to the payload [IPricePayload] from Main Service - CryptoBOT
 * Query the database to see if users have the subscription set.
 * If so, check if user needs to be alerted.
 */

router.post('/alertPayload', (req: Request, res: Response) => {
    const payload: IPricePayload = req.body;

    // Check if symbol is present in DB. If not, add.
    // 
    // Query payload with database.
});


/**
 * Threshold payload
 */

router.post('/thresholdPayload', async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    
    const symbolToNotify: string = req.body.symbol;
    const last_price: number = req.body.last_price;
    const change: number = req.body.change;
    const triggerTime : number = req.body.triggerTime;

    // Query for symbol in DB.
    let symbolDoc: SymbolDocument | null = await Symbol.findOne({symbol: symbolToNotify}).exec();

    if(!symbolDoc) {
        return;
    }

    // Query for all the subscriptions with this symbol.
    let subsToAlert: SubscriptionDocument[] = await Subscription.find({symbol: symbolDoc._id}).populate('symbol').populate('user').exec();

    // Notify all users associated with its subscriptions.
    subsToAlert.forEach((sub: SubscriptionDocument) => {
        
        let userDoc: UserDocument = sub.get('user');
        let symbolDoc: SymbolDocument = sub.get('symbol');

        // fire off an event to notify user about symbol.
        let data: IThresholdData = {
            userID: userDoc.get("twitterID"),
            last_price,
            symbol: symbolToNotify,
            change,
            triggerTime

        };

        // Emit event with data.
        notification.emit(PriceNotification.SUBSCIPTION_ALERT, data);
    });

    
}); 