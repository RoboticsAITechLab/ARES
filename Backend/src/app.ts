/**
 * @file app.ts
 * @description Core Express application setup, registering CORS and JSON body-parser middlewares.
 */

import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

export default app;
