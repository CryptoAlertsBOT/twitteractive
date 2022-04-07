import mongoose from "mongoose";
import {Schema, Types} from "mongoose";
import { IUserModel, IUserSchema } from "./types";

const userSchema: Schema<IUserSchema> = new Schema({
    twitterID: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: [true, "Username cannot be empty!"],
        unique: true,
    },
    screen_name: {
        type: String,
        required: true,
        unique: false,
    },

    subscriptions: [{
        type: Types.ObjectId,
        unique: true,
        ref: "Symbol"
    }],

    alerts: [{
        type: Types.ObjectId,
        ref: "CustomAlert"
    }]
}, {timestamps: {currentTime: () => new Date()}})



export const User: IUserModel = mongoose.model<IUserSchema, IUserModel>("User", userSchema);