import {Request, Response, Router} from "express";
import "dotenv/config";
import {env} from 'process';
import colors from "colors";

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
 * @description Callback handler for Twitter authentication.
 * @returns JSON Response 
 * @deprecated
 */
 router.get("/callback", async (req: Request, res:Response) => {
    
    console.log('/callback entered')
    // Exact tokens from query string
    const oauth_token = req.query.oauth_token as string;
    const oauth_verifier = req.query.oauth_verifier as string;

    // Get the saved oauth_token_secret from session
    //@ts-ignore
    const { oauth_token_secret } = req.session;

    
    if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
        console.log("Twitter Authentication Failed.".red);
        return res.status(400).send('You denied the app or your session expired!');
    }

});