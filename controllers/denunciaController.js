import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { generatePDFTemplate } from "../utils/generatePDFTemplate.js";
import Denuncia from "../models/Denuncia.js";


// =======================================
// ✅ CREAR DENUNCIA (GUARDA EN DB)
// =======================================
export const crearDenuncia = async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ error: "Datos requeridos" });
    }

    // 🔢 número correlativo
    const ultima = await Denuncia.findOne().sort({ numero: -1 });
    const numero = ultima ? ultima.numero + 1 : 1;

    const nuevaDenuncia = await Denuncia.create({
      ...data,
      numero,
    });

    res.status(201).json(nuevaDenuncia);

  } catch (err) {
    console.error("ERROR CREAR:", err);

    res.status(500).json({
      error: err.message || "Error al crear denuncia",
    });
  }
};



// =======================================
// ✅ GENERAR PDF (NO GUARDA)
// =======================================
export const generarPDFDenuncia = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 buscar denuncia existente
    const denuncia = await Denuncia.findById(id);

    if (!denuncia) {
      return res.status(404).json({ error: "Denuncia no encontrada" });
    }

    // 🖼️ membrete (opcional)
    const letterheadPath = path.join(process.cwd(), "public", "membrete.png");

    let letterheadBase64 = null;

    if (fs.existsSync(letterheadPath)) {
      letterheadBase64 = fs.readFileSync(letterheadPath, {
        encoding: "base64",
      });
    }

    // 🧾 generar HTML
    const html = generatePDFTemplate(denuncia, letterheadBase64);

    // 🚀 puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    // 📄 PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });

    await browser.close();

    // 📤 response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=denuncia-${denuncia.numero}.pdf`
    );

    res.end(pdf);

  } catch (err) {
    console.error("ERROR PDF:", err);

    res.status(500).json({
      error: err.message || "Error generando PDF",
    });
  }
};