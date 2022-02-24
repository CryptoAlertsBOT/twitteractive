import {TwitterApi} from "twitter-api-v2";
import {env} from 'process';
import 'dotenv/config';
import colors from 'colors'


const consumer: string = env.TWITTER_CONSUMER!;
const consumer_secret: string = env.TWITTER_CONSUMER_SECRET!;
const access_token: string = env.TWITTER_ACCES_TOKEN!;
const access_token_secret: string = env.TWITTER_ACCES_TOKEN_SECRET!;


if (!consumer || !consumer_secret || !access_token || access_token_secret) {
    console.log("No API Keys set".red);
    process.exit(100);
}

const client: TwitterApi = new TwitterApi({
    appKey: consumer,
    appSecret: consumer_secret,
    accessToken: access_token,
    accessSecret: access_token_secret, 
});