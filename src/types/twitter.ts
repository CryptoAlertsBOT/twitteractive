import mongoose from "mongoose"
import { ISymbolSchema } from "../models/Symbol/types";
import { IUserSchema } from "../models/User/types"
import { ICustomAlertSchema } from "../models/CustomAlert/types"
import { ISubscriptionSchema } from "../models/Subscription/types";

export enum CommandType {
    UNSET= "none",
    ADD="add",
    REMOVE="remove",
    SETALERT="setalert",
    REMOVEALERT = "removealert"
}

/**
 * Invalid Request Types
 */
export enum InvalidRequestType {
    MULTIPLE_COMMANDS="MULTIPLE_COMMANDS",
    INVALID_COMMAND="INVALID_COMMAND",
    INVALID_SYMBOL="INVALID_SYMBOL",
    INVALID_TRIGGER_PRICE="INVALID_TRIGGER_PRICE",
    SUBSCRIPTION_ERROR="SUBSCRIPTION_ERROR",
    UNKNOWN="UNKNOWN",
}

// fill this from entity object blueprint later.
export type TweetEntityObject = {

}

export type UserDocument = mongoose.Document<IUserSchema>;
export type SymbolDocument = mongoose.Document<ISymbolSchema>;
export type AlertDocument = mongoose.Document<ICustomAlertSchema>;
export type SubscriptionDocument = mongoose.Document<ISubscriptionSchema>;