import express from "express"
import { generarPDFDenuncia } from "../controllers/denunciaController.js"

const router = express.Router()

router.get("/", async (req,res)=>{
const data = await Denuncia.find().sort({fechaCreacion:-1})
res.json(data)
})

router.post("/pdf", generarPDFDenuncia)

export default router