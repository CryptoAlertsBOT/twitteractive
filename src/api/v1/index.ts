import {Request, Response, Router} from "express";
import "dotenv/config";
import {env} from 'process';
import colors from "colors";
import { IPricePayload } from "../../types";

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

router.post('/thresholdPayload', (req: Request, res: Response) => {
    const symbolToNotify: string = req.body.symbol;

    // Query for symbol in DB
    // Notify all users associated with its subscriptions.
}); 