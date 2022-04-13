import NotificationEmitter from ".";
import { endsWithBase, formatTriggerTime, getBaseAbbrevation, getFormattedDateTime, getQuoteAsset, sendMessageToUser } from "../../controllers";
import { Base, IThresholdData } from "../../types";
import { PriceNotification } from "./types";


export const notification: NotificationEmitter = new NotificationEmitter();

/**
 * @event SUBSCIPTION_ALERT [INotificationData]
 * @description Send an alert to subscribed users for symbol.
 */

notification.on(PriceNotification.SUBSCIPTION_ALERT, (data: IThresholdData) => {
    let message = ``;
    // format the messsage string to be posted on twitter.
    const direction: string = Math.sign(data.change) === 1 ? `Increased` : `Decreased`;
    const base: Base | boolean = endsWithBase(data.symbol);
    const quoteAsset: string | void = getQuoteAsset(data.symbol);
    const triggerTimeString: string = formatTriggerTime(data.triggerTime);
    let signLessChange: number = Math.abs(data.change);
    let hashtags: string = `#${quoteAsset} #${data.symbol} #CryptoBOT`;

    if(data.change > 0) {
        message = `$${quoteAsset}\n✅  ${direction} ${signLessChange.toFixed(2)}% in ${triggerTimeString}\n💵 Price - ${data.last_price} ${getBaseAbbrevation(base as Base)}\n⏱️ ${getFormattedDateTime()}\n${hashtags}`;
    } else {
        message = `$${quoteAsset}\n🔻 ${direction} ${signLessChange.toFixed(2)}% in ${triggerTimeString}\n💵 Price - ${data.last_price} ${getBaseAbbrevation(base as Base)}\n⏱️ ${getFormattedDateTime()}\n${hashtags}`;
    }

    sendMessageToUser(data.userID, message);
    
});