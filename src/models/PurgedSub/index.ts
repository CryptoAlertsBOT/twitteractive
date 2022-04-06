import mongoose from "mongoose";
import {Schema, Types} from "mongoose";
import { IPurgedSubModel, IPurgedSubSchema } from "./types";

const PurgedSubSchema: Schema<IPurgedSubSchema> = new Schema({
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
    deletedOn: {
        type: Date,
        requried: true,
    }
    
}, {timestamps: {createdAt: true, updatedAt: false, currentTime: () => new Date()}});


/**
 * Middleware to run post deletion
 */
PurgedSubSchema.pre('validate', function (next) {
    
    // set `deletedOn`
    this.update({}, {$set: {deletedOn: new Date()}});
    return next();
});


export const PurgedSub: IPurgedSubModel = mongoose.model<IPurgedSubSchema>("PurgedSub", PurgedSubSchema);