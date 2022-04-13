import mongoose from "mongoose";
import { ISymbolSchema } from "../Symbol/types";
import { IUserSchema } from "../User/types";


export interface ISubscriptionSchema extends mongoose.Document {
    symbol: ISymbolSchema['_id'],
    user: IUserSchema['_id']
}