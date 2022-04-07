import mongoose from "mongoose";
import {Schema, Types} from "mongoose";
import { ISymbolSchema } from "./types";

const SymbolSchema: Schema<ISymbolSchema> = new Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        minlength: [4, "Symbols must be atleast 4 charecters long!"],
        uppercase: true,
    },
    users: [{
        type: Types.ObjectId,
        ref: "User"
    }]
}, {timestamps: {currentTime: () => new Date()}})


export const Symbol: mongoose.Model<ISymbolSchema> = mongoose.model<ISymbolSchema>("Symbol", SymbolSchema);