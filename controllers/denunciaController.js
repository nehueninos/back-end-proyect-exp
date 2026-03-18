import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import { generatePDFTemplate } from "../utils/generatePDFTemplate.js"
import Denuncia from "../models/Denuncia.js";

export const generarPDFDenuncia = async (req, res) => {

try{

const complaint = req.body

// 💾 GUARDAR EN DB
const ultima = await Denuncia.findOne().sort({numero:-1})
const numero = ultima ? ultima.numero + 1 : 1

const nuevaDenuncia = await Denuncia.create({
...complaint,
numero
})



// ruta correcta del membrete
const letterheadPath = path.join(process.cwd(), "public", "membrete.png")

if(!fs.existsSync(letterheadPath)){
throw new Error("No se encontró el archivo membrete.png en /public")
}

const letterheadBase64 = fs.readFileSync(letterheadPath,{
encoding:"base64"
})

const html = generatePDFTemplate(complaint, letterheadBase64)

// lanzar navegador
const browser = await puppeteer.launch({
headless: "new",
args:["--no-sandbox","--disable-setuid-sandbox"]
})

const page = await browser.newPage()

await page.setContent(html,{
waitUntil:"domcontentloaded"
})

// generar pdf
const pdf = await page.pdf({
format:"A4",
printBackground:true,
margin:{
top:"0mm",
bottom:"0mm",
left:"0mm",
right:"0mm"
}
})

await browser.close()

res.setHeader("Content-Type","application/pdf")
res.setHeader("Content-Disposition","attachment; filename=denuncia.pdf")

res.end(pdf)

}catch(err){

console.error("ERROR PDF:", err)

res.status(500).json({
error:err.message
})

}

}