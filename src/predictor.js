import tf from "@tensorflow/tfjs-node";
import nsfw from "nsfwjs";
import jpeg from "jpeg-js";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

tf.enableProdMode()

/**
 * Converte imagens para JPG usando o sharp
 * @param {Buffer} image Imagem a ser convertida 
 * @returns {Promise<Buffer>} Buffer da imagem convertida
 */
async function convertImage(image) {
    const img = await sharp(image).toFormat("jpeg").jpeg({ force: true }).toBuffer()
    return img 
}

/**
 * Converte a imagem JPG para um tensor3D.
 * @param {Buffer} img Imagem a ser convertida.
 * @returns {Promise<tf.Tensor3D>} Tensor3D da imagem preparado para o NSFWJS analisar.
 */
async function convert(img) {
    const image = jpeg.decode(img, true)

    const numChannels = 3
    const numPixels = image.width * image.height
    const values = new Int32Array(numPixels * numChannels)
  
    for (let i = 0; i < numPixels; i++)
      for (let c = 0; c < numChannels; ++c)
        values[i * numChannels + c] = image.data[i * 4 + c]
  
    return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
}

/**
 * Analisa o resultado do NSFWJS e converte para um modo mais fácil de ler.
 * @param {Array} classify Array com as classificações do NSFWJS. 
 * @returns {Object} Objeto com as classificações convertidas.
 */
function parseClassify(classify) {
    const labels = {}
    for (const label of classify) {
        if (label.probability >= 0 && label.probability <= 1) {
            labels[label.className] = label.probability
        }
    }
    return labels
}

/**
 * Analisa a imagem usando um modelo do NSFWJS.
 * @param {nsfw.NSFWJS} model Modelo a ser usado.
 * @param {Buffer} image Imagem a ser analisada
 * @param {String} mimetype Tipo da imagem
 * @returns {Promise<Object>} Classificações da imagem
 */
async function predict(model, image) {
    const mimetype = await fileTypeFromBuffer(image)
    const img = mimetype.mime == "image/jpeg" ? await convert(image) : await convert(await convertImage(image)) 
    return parseClassify(await model.classify(img))
}

export default predict