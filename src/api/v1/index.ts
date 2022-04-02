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

router.post('/payload', (req: Request, res: Response) => {
    const payload: IPricePayload = req.body;
    
});
