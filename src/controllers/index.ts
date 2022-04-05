import mongoose from "mongoose";
import T from "../bot";



export const connectDB = async (): Promise<boolean> => {
    let connection: boolean = false;

    mongoose.connect("mongodb+srv://root:ProjectPassword11!!@cluster1.bgw5q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
        .then(() => {
            console.log('MongoDB Connected'.green);
            connection = true;
        })
        .catch((err: mongoose.CallbackError) => {
            console.error(err?.name, err?.stack);
        });

        return connection;
};