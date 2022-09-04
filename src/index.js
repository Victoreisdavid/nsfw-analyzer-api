import fastify from "fastify";
import multipart from "@fastify/multipart";
import nsfw from "nsfwjs";
import fs from "fs";

import predict from "./predictor.js";

const validtypes = ["image/jpeg", "image/png"]

const css = fs.readFileSync("./src/static/style.css")
const home = fs.readFileSync("./src/static/home.html")
const how_to_use = fs.readFileSync("./src/static/how-to-use.html")

const app = fastify()
app.register(multipart, {
    limits: {
        fileSize: 10000000
    }
})

let _model;

app.get("/", async (req, res) => {
    res.type("text/html").send(home)
})

app.get("/how-to-use", async (req, res) => {
    res.type("text/html").send(how_to_use)
})

app.get("/static/style.css", async (req, res) => {
    res.type("text/css").send(css)
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

    const predictions = await predict(_model, buffer)

    res.type("application/json").send(predictions)
})

const start = async () => {
    console.log("Carregando modelo....")
    _model = await nsfw.load("file://model/", { type: "graph" })

    console.log("Modelo carregado. Iniciando servidor")
    app.listen({
        port: process.env.PORT || 3030,
        host: "0.0.0.0"
    })
}

start()