"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initClient = exports.consumer_secret = exports.consumer = void 0;
const twitter_api_v2_1 = require("twitter-api-v2");
const process_1 = require("process");
require("dotenv/config");
const colors_1 = __importDefault(require("colors"));
exports.consumer = process_1.env.TWITTER_CONSUMER;
exports.consumer_secret = process_1.env.TWITTER_CONSUMER_SECRET;
const access_token = process_1.env.TWITTER_ACCES_TOKEN;
const access_token_secret = process_1.env.TWITTER_ACCES_TOKEN_SECRET;
if (exports.consumer == null || !exports.consumer_secret == null || !access_token == null || access_token_secret == null) {
    console.log(colors_1.default.red("No API Keys set"));
    process.exit(100);
}
exports.initClient = new twitter_api_v2_1.TwitterApi({
    appKey: exports.consumer,
    appSecret: exports.consumer_secret,
    accessToken: access_token,
    accessSecret: access_token_secret
});
const client = exports.initClient.readWrite;
exports.default = client;
//# sourceMappingURL=botConfig.js.map