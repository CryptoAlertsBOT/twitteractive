import T from "../bot";




/**
 * 
 * @description - Controller to `like` a tweet.
 * @param ID {String} - Tweet ID to Like
 * @returns void
 */
export const likeTweet = (ID: string) => {
    T.post('favorites/create',  {id: ID}, (err, data, response) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Message Liked'.yellow)
        }
    });
} 


/**
 * @description - Sends acknowledgement message to user for tweets.
 * @param id {String} - User ID
 * @param symbolHashes {Array<String>} - TICKER TAGS in contention
 * @param username {String} - Twitter screen name
 */
export const sendAck = (id: string, symbolHashes: string[], username: string) => {
    T.post('direct_messages/events/new', 
        {//@ts-ignore
            event: {
                type: 'message_create',
                message_create: {
                    target: {
                        recipient_id: id
                    },
                    message_data: {
                        text: `Alert created for ${symbolHashes[0]}, ${username}. You will be notified when it hits.`
                    }
                }
            }
        }, 
        (err, data, response) => {
            if (!err) {
                console.log("Message sent".yellow);
            } else {
                console.log(err);
            }
        }
    )
}

