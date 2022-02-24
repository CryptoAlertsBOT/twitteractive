import express, {Application} from "express";
import cors from "cors";
import "dotenv/config";
import {env} from 'process';

// Instantiate the Express App.
const port = env.SERVER_PORT!;
const app: Application = express();
app.use(cors());


// listen to incoming requests.
app.listen(port, () => {
    console.log(`Web server running on PORT ${port}`);
})


// default export
export default app;