import app from "./api"
import {env} from "process";
import "dotenv/config";
import colors from "colors"
import T from "./bot";
import { connectDB } from "./controllers";
import { IncomingRequest } from "./classes/IncomingRequest";
import { AddRequest } from "./classes/AddRequest";
import { SetAlertRequest } from "./classes/SetAlertRequest";
import { CommandType, InvalidRequestType } from "./types/twitter";
import { RemoveRequest } from "./classes/RemoveRequest";
import { RemoveAlertRequest } from "./classes/RemoveAlertRequest";

const port = env.SERVER_PORT!;


// listen to incoming requests.
app.listen(port, async () => {
    //connect DB
    await connectDB();

    console.log(colors.yellow(`Web server running on PORT ${port}`));

    try {
        const tweetStream = await T.stream("statuses/filter", {track: "@Crypto3OT", lang: 'en'});
    
        tweetStream.on('tweet', async (tweet) => {
         
            const isRetweeted: boolean = tweet.retweeted_status != null;
            if (isRetweeted) {
                return;
            } 
            const tweetID: string = tweet.id_str;
            const userID: string = tweet.user.id_str;
            const accountName: string = tweet.user.name;
            const userScreenName: string = tweet.user.screen_name;
            const tweetText: string = tweet.text;
            const symbolHashEntity: Object[] = tweet.entities.hashtags;
    
            /**
             * regex here to find out which commandType this request belongs to. 
             * Implement functionality in IncomingRequest.validateRequest().
             * Then, instantiate like below with their respecitive classes
             * ref: classes/* folder.
             * 
             * if request is an ADD request then instantiate with new AddRequest()
             */
    
    
            const commandType : CommandType[] = IncomingRequest.validateRequest(tweetText);
    
            // catch invalid commands
            if( commandType.length != 1 ) {
                
                // Call Invalid Request
                IncomingRequest.notifyInvalidRequest(userID, InvalidRequestType.INVALID_COMMAND, "Please enter a valid command.\n\nFor a valid command syntax reference, please visit our documentation.");
    
            } else if(commandType[0] == CommandType.ADD) {
                // Add Request
                let addRequest: AddRequest = new AddRequest(
                    tweetID,
                    userID,
                    accountName,
                    userScreenName,
                    tweetText,
                    symbolHashEntity,
                    isRetweeted
                );
    
                // Process Request.
                addRequest.addSubscription();
                
            } else if (commandType[0] == CommandType.REMOVE) {
                // Remove Request
                let removeRequest: RemoveRequest = new RemoveRequest(
                    tweetID,
                    userID,
                    accountName,
                    userScreenName,
                    tweetText,
                    symbolHashEntity,
                    isRetweeted
                );
    
                // call remove 
                removeRequest.removeSubscription()
    
            } else if (commandType[0] == CommandType.SETALERT) {
                // Set Alert
                let setAlert:  SetAlertRequest = new SetAlertRequest(
                    tweetID,
                    userID,
                    accountName,
                    userScreenName,
                    tweetText,
                    symbolHashEntity,
                    isRetweeted
                );
    
                // Process Request.
                setAlert.addAlert();
            } else if (commandType[0] == CommandType.REMOVEALERT){
                // Remove Alert
                let removeAlertRequest:  RemoveAlertRequest = new RemoveAlertRequest(
                    tweetID,
                    userID,
                    accountName,
                    userScreenName,
                    tweetText,
                    symbolHashEntity,
                    isRetweeted
                );
    
                // process request
                removeAlertRequest.removeAlert();
            }
    
         });
    } catch(err) {
        // log error.
        console.log('MAIN FILE ERROR', err);
    }
    

})

