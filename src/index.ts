import app from "./api"
import {env} from "process";
import "dotenv/config";
import colors from "colors"
import T from "./bot";
import { likeTweet, sendAck } from "./controllers";

const port = env.SERVER_PORT!;
// listen to incoming requests.
app.listen(port, async () => {
    console.log(colors.green(`Web server running on PORT ${port}`));

    const tweetStream = await T.stream("statuses/filter", {track: "@Crypto3OT", lang: 'en'});
  
    
    tweetStream.on('tweet', async (tweet) => {
        const isRetweeted: boolean = tweet.retweeted_status != null;
        const tweetID: string = tweet.id_str;
        const userID: string = tweet.user.id_str;
        const userScreenName: string = tweet.user.screen_name;
        const tweetText: string = tweet.text;
        const symbolHashes: string[] = tweet.entities.hashtags.map((tag: any) => tag.text)


        if (!isRetweeted) {
            console.group(`TWEET ID: `.bgGreen, tweetID)
                console.log('USER ID: '.bgMagenta, userID);
                console.log('Screen Name: '.bgMagenta, userScreenName);
                console.log('TEXT: '.bgMagenta, tweetText)
                console.log('SYMBOL HASH: '.bgMagenta, symbolHashes)
            console.groupEnd()
        
            // likeTweet(tweetID);
            sendAck(userID, symbolHashes, userScreenName);
            }
     });


     
})

