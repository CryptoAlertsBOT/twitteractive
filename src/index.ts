import app from "./api"
import {env} from "process";
import "dotenv/config";
import colors from "colors"
import T from "./bot";
import { connectDB } from "./controllers";
import { IncomingRequest } from "./classes/IncomingRequest";
import { AddRequest } from "./classes/AddRequest";

const port = env.SERVER_PORT!;


// listen to incoming requests.
app.listen(port, async () => {
    //connect DB
    await connectDB();

    console.log(colors.green(`Web server running on PORT ${port}`));

    const tweetStream = await T.stream("statuses/filter", {track: "@Crypto3OT", lang: 'en'});
    
    
    tweetStream.on('tweet', async (tweet) => {
        const isRetweeted: boolean = tweet.retweeted_status != null;
        const tweetID: string = tweet.id_str;
        const userID: string = tweet.user.id_str;
        const accountName: string = tweet.user.name;
        const userScreenName: string = tweet.user.screen_name;
        const tweetText: string = tweet.text;
        const symbolHashEntity: Object[] = tweet.entities.hashtags;

        /**
         * @AnkitVaity
         * @anubhavanand23
         * regex here to find out which commandType this request belongs to. 
         * Implement functionality in IncomingRequest.validateRequest().
         * Then, instantiate like below with their respecitive classes
         * ref: classes/* folder.
         * 
         * if request is an ADD request then instantiate with new AddRequest()
         */



        let request;
        request = new AddRequest(
            tweetID,
            userID,
            accountName,
            userScreenName,
            tweetText,
            symbolHashEntity
        );

        if (!isRetweeted) {
            // Log to console.
            request.log();

        }
     });

})

