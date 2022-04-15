import mongoose from "mongoose";

export interface IPurgedAlertSchema extends mongoose.Document {
    symbol: string,
    userID: string,
    username: string,
    trigger_price: number,
    price_when_set: number
    deletedOn?: Date
}

export interface IPurgedAlertModel extends mongoose.Model<IPurgedAlertSchema> {}