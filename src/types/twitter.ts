import mongoose from "mongoose"
import { ISymbolSchema } from "../models/Symbol/types";
import { IUserSchema } from "../models/User/types"

export enum CommandType {
    UNSET= "none",
    ADD="add",
    REMOVE="remove",
    SETALERT="setalert",
    REMOVEALERT = "removealert"
}

// fill this from entity object blueprint later.
export type TweetEntityObject = {

}

export type UserDocument = mongoose.Document<IUserSchema>;
export type SymbolDocument = mongoose.Document<ISymbolSchema>;