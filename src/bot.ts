import Twit from "twit";
import {env} from 'process';
import 'dotenv/config';

export const consumer_key: string = env.TWITTER_CONSUMER!;
export const consumer_secret: string = env.TWITTER_CONSUMER_SECRET!;
const access_token: string = env.TWITTER_ACCES_TOKEN!;
const access_token_secret: string = env.TWITTER_ACCES_TOKEN_SECRET!;

let T: Twit = new Twit({
    consumer_key,
    consumer_secret,
    access_token,
    access_token_secret
})

export default T;