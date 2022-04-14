import {Request, Response, Router} from "express";
import "dotenv/config";
import {env} from 'process';
import colors from "colors";
import { IThresholdData, IPricePayload, ICustomAlertData } from "../../types";
import { Symbol } from "../../models/Symbol";
import { AlertDocument, SubscriptionDocument, SymbolDocument, UserDocument } from "../../types/twitter";
import { Subscription } from "../../models/Subscription";
import { notification } from "../../events/Notification/handler";
import { PriceNotification } from "../../events/Notification/types";
import { CustomAlert } from "../../models/CustomAlert";
import mongoose from "mongoose";

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

router.post('/alertPayload', async (req: Request, res: Response) => {
    const payload: IPricePayload = req.body;

    // Check if symbol is present in DB. If not, add.
    // 
    // Query payload with database.
    let symbolInContext: SymbolDocument | null = await Symbol.findOne({symbol: payload.symbol}).exec();
    if(!symbolInContext) return;

    // Query object to filter CustomAlert DB.
    const alertMatchQuery: {[key: string]: any} = {$or: [
        {$and: [
            {$gt: ["$trigger_price", "$price_when_set"]},
            {$lte: ["$trigger_price", payload.price]}
        ]},
        {$and: [
            {$gt: ["$price_when_set", "$trigger_price"]},
            {$lte: [payload.price, "$trigger_price"]}
        ]}
    ]};

    // Get matched alerts
    let alertsMatched: AlertDocument[] | null = await CustomAlert.find({symbol: symbolInContext._id, $expr: alertMatchQuery})
        .populate('symbol')
        .populate('user')
        .exec();

    // If no alerts matched, then return.
    if (!alertsMatched) return;

    // else
    alertsMatched.forEach((alert: AlertDocument) => {
        const alert_id: mongoose.Types.ObjectId = alert.get('_id');
        const twitterID: string = alert.get("user.twitterID");
        const username: string = alert.get("user.username");
        const trigger_price: number = alert.get("trigger_price");
        const price_when_set: number = alert.get("price_when_set");

        const data: ICustomAlertData = {
            alert_id,
            twitterID,
            username,
            symbol: payload.symbol,
            trigger_price,
            price_when_set,
            last_price: payload.price
        }


        // fire off notification event here.
        notification.emit(PriceNotification.CUSTOM_ALERT, data);
    });

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