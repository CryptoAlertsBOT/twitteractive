import mongoose from "mongoose";
import { IUserSchema } from "../User/types";

export interface ISymbolSchema extends mongoose.Document {
    symbol: string,
    users: IUserSchema['_id'][]
}