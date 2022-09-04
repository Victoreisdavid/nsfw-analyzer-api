import fastify from "fastify";
import fastify_static from "@fastify/static";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import predict from "./predictor.js";

const validtypes = ["image/jpeg", "image/png"]

const app = fastify()
app.register(multipart, {
    limits: {
        fileSize: 10000000
    }
})

app.register(fastify_static, {
    root: resolve(__dirname, "static"),
    prefix: "/"
})

app.register(cors, {
    origin: false
})

app.get("/", async (req, res) => {
    return res.sendFile("home.html", { cacheControl: false })
})

app.get("/how-to-use", async (req, res) => {
    return res.sendFile("how-to-use.html")
})

app.get("/static/style.css", async (req, res) => {
    return res.sendFile("style.css")
})

app.get("/static/nsfwjs_logo.jpg", async (req, res) => {
    return res.sendFile("nsfwjs_logo.jpg")
})

app.post("/api/predict", async (req, res) => {
    const file = await req.file()
    if(!file || !file.filename) {
        return res.status(400).type("application/json").send({ error: "No image provided" })
    }
    if(!validtypes.includes(file.mimetype)) {
        return res.status(400).type("application/json").send({ error: "Invalid image format" })
    }
    let buffer = await file.toBuffer()
    if(!buffer) {
        return res.status(400).type("application/json").send({ error: "unknown image" })
    }

    const predictions = await predict(buffer)

    res.type("application/json").send(predictions)
})

const start = async () => {
    app.listen({
        port: process.env.PORT || 3030,
        host: "0.0.0.0"
    })
}

start()