import mongoose from "mongoose";
import { ISymbolSchema } from "../Symbol/types";
import { IUserSchema } from "../User/types";

export interface ICustomAlertSchema extends mongoose.Document {
    symbol: ISymbolSchema['_id'],
    user: IUserSchema['_id'],
    trigger_price: number,
    price_when_set: number
}