import mongoose from "mongoose";

export interface IPurgedSubSchema extends mongoose.Document {
    symbol: string,
    userID: string,
    username: string,
    createdAt: Date,
    deletedOn?: Date
}

export interface IPurgedSubModel extends mongoose.Model<IPurgedSubSchema> {}