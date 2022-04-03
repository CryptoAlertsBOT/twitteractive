import mongoose from "mongoose";
import {Schema, Types} from "mongoose";
import { IUserSchema } from "./types";

const userSchema: Schema<IUserSchema> = new Schema({
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
        ref: "Symbol"
    }],

    alerts: [{
        type: Types.ObjectId,
        ref: "CustomAlert"
    }]
})

export const User: mongoose.Model<IUserSchema> = mongoose.model<IUserSchema>("User", userSchema);