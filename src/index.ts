//@ts-nocheck

import app from "./api"
import {env} from "process";
import "./botConfig";
import "dotenv/config";
import colors from "colors"
import T from "./bot";

const port = env.SERVER_PORT!;
// listen to incoming requests.
app.listen(port, async () => {
    console.log(colors.green(`Web server running on PORT ${port}`));

    const tweets = await T.get("search/tweets", {q: "@Crypto3OT"})
    
     tweets.data.statuses.forEach(tweet => {
        if ((tweet.retweet_count == 0) && (tweet.entities.user_mentions.filter(m => m.screen_name == "Crypto3OT").length > 0)) {
            console.group(colors.green(tweet.id));
            console.log(tweet.text)
            console.log(tweet.entities)
            console.log(tweet.retweet_count)
            console.groupEnd()
        }

     });
})

