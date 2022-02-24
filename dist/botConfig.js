"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_api_v2_1 = require("twitter-api-v2");
const process_1 = require("process");
require("dotenv/config");
const consumer = process_1.env.TWITTER_CONSUMER;
const consumer_secret = process_1.env.TWITTER_CONSUMER_SECRET;
const access_token = process_1.env.TWITTER_ACCES_TOKEN;
const access_token_secret = process_1.env.TWITTER_ACCES_TOKEN_SECRET;
if (!consumer || !consumer_secret || !access_token || access_token_secret) {
    console.log("No API Keys set".red);
    process.exit(100);
}
const client = new twitter_api_v2_1.TwitterApi({
    appKey: consumer,
    appSecret: consumer_secret,
    accessToken: access_token,
    accessSecret: access_token_secret,
});
//# sourceMappingURL=botConfig.js.map