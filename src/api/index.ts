import express, {Application, Request, Response} from "express";
import cors from "cors";
import {router as v1Router} from "./v1";
import {env} from "process";
import bodyParser from "body-parser";

// Instantiate the Express App.

const app: Application = express();

//user cors
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use("/hook/v1/", v1Router)

app.get('/', (req: Request, res: Response) => {
    res.json({
        version: env.VERSION!,
        description: "Backend Server for CryptoBOT Twitter Service",
    });
})

// default export
export default app;