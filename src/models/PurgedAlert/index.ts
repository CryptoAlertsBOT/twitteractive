import mongoose from "mongoose";
import {Schema, Types} from "mongoose";
import { IPurgedAlertModel, IPurgedAlertSchema } from "./types";

const PurgedAlertSchema: Schema<IPurgedAlertSchema> = new Schema({
    symbol: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    username: {
        type: String,
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
    },
    createdOn: {
        type: Date,
        requried: true,
    },
    deletedOn: {
        type: Date,
        requried: true,
    }
    
}, {timestamps: {createdAt: false, updatedAt: false, currentTime: () => new Date()}});


/**
 * Middleware to run post deletion
 */
PurgedAlertSchema.pre('validate', function (next) {

    // set `deletedOn`
    this.set('deletedOn', new Date());
    next();
});


export const PurgedAlert: IPurgedAlertModel = mongoose.model<IPurgedAlertSchema>("PurgedAlert", PurgedAlertSchema);