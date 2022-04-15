import { Schema } from "inspector";
import mongoose from "mongoose";
import { ISymbolSchema } from "../Symbol/types";

export interface IUserSchema extends mongoose.Document {
    twitterID: string,
    username: string,
    screen_name: string,
    subs?: ISymbolSchema['_id'][],
    alerts?: mongoose.Types.ObjectId[]
}

export interface IUserModel extends mongoose.Model<IUserSchema> {
}