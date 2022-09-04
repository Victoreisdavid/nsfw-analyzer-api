import cluster from "cluster";
import tf from "@tensorflow/tfjs-node";
import os from "os";
import dotenv from "dotenv";

dotenv.config()

tf.enableProdMode()

if (cluster.isPrimary) {
    const workers = process.env.WORKERS || os.cpus().length
    for (let i = 0; i < workers; i++) {
        cluster.fork()
    }
} else {
    console.log(`Worker ${cluster.worker.id} foi criado com sucesso.`)
    import("./src/index.js")
}