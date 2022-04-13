import mongoose from "mongoose";
import { ISubscriptionSchema } from "../Subscription/types";

export interface ISymbolSchema extends mongoose.Document {
    symbol: string,
    subs: ISubscriptionSchema['_id'][]
}