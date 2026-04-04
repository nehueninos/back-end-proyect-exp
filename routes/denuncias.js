import express from "express";
import mongoose from "mongoose";
import Denuncia from "../models/Denuncia.js";
import { crearDenuncia, generarPDFDenuncia } from "../controllers/denunciaController.js";

const router = express.Router();

/* ================= GET TODAS ================= */
router.get("/", async (req, res) => {
  try {
    const data = await Denuncia.find().sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    console.error("ERROR GET DENUNCIAS:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= CREAR ================= */
router.post("/", crearDenuncia);

/* ================= PDF POR ID ================= */
router.get("/:id/pdf", async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🔥 validar ObjectId antes de pasar al controller
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // 👉 dejamos que el controller maneje TODO
    return generarPDFDenuncia(req, res);

  } catch (err) {
    console.error("ERROR ROUTE PDF:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;