import mongoose from "mongoose";
import {Schema, Types} from "mongoose";
import { ISubscriptionSchema } from "./types";

const SubscriptionSchema: Schema<ISubscriptionSchema> = new Schema({
    symbol: {
        type: Types.ObjectId,
        ref: "Symbol",
        required: true,
    },
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: {currentTime: () => new Date(), createdAt: true, updatedAt: false}})


export const Subscription: mongoose.Model<ISubscriptionSchema> = mongoose.model<ISubscriptionSchema>("Subscription", SubscriptionSchema);