import { Schema } from "inspector";
import mongoose from "mongoose";
import { ISymbolSchema } from "../Symbol/types";

export interface IUserSchema extends mongoose.Document {
    username: string,
    screen_name: string,
    subscriptions: ISymbolSchema['_id'][],
    alerts: mongoose.Types.ObjectId[]
}