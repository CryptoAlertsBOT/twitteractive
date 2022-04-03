import mongoose from "mongoose";
import {Schema, Types} from "mongoose";
import { ICustomAlertSchema } from "./types";

const CustomAlertSchema: Schema<ICustomAlertSchema> = new Schema({
    symbol: {
        type: Types.ObjectId,
        ref: "Symbol",
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    trigger_price: {
        type: Number,
        required: true,
        min: [0, "Trigger price cannot be negative"],
    },
    price_when_set: {
        type: Number,
        required: true,
        min: [0, "Current price cannot be negative or 0"]
    }
})


export const CustomAlert: mongoose.Model<ICustomAlertSchema> = mongoose.model<ICustomAlertSchema>("CustomAlert", CustomAlertSchema);