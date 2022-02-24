"use strict";
//@ts-nocheck
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("./api"));
const process_1 = require("process");
require("./botConfig");
require("dotenv/config");
const colors_1 = __importDefault(require("colors"));
const bot_1 = __importDefault(require("./bot"));
const port = process_1.env.SERVER_PORT;
// listen to incoming requests.
api_1.default.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(colors_1.default.green(`Web server running on PORT ${port}`));
    const tweets = yield bot_1.default.get("search/tweets", { q: "@Crypto3OT" });
    tweets.data.statuses.forEach(tweet => {
        if ((tweet.retweet_count == 0) && (tweet.entities.user_mentions.filter(m => m.screen_name == "Crypto3OT").length > 0)) {
            console.group(colors_1.default.green(tweet.id));
            console.log(tweet.text);
            console.log(tweet.entities);
            console.log(tweet.retweeted);
            console.log(tweet.retweet_count);
            console.groupEnd();
        }
    });
}));
//# sourceMappingURL=index.js.map