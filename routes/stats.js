import express from "express";
import TransferNotification from "../models/TransferNotification.js";
import Expediente from "../models/Expediente.js";
import Denuncia from "../models/Denuncia.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// ✅ STATS MULTAS (SI / NO)
router.get("/multas", auth, async (req, res) => {
  try {
    const { area, userId, fechaDesde, fechaHasta } = req.query;

    const match = {};

    if (area) match.toArea = area;
    if (userId) match.toUserId = userId;

    if (fechaDesde || fechaHasta) {
      match.createdAt = {};
      if (fechaDesde) match.createdAt.$gte = new Date(fechaDesde);
      if (fechaHasta) match.createdAt.$lte = new Date(fechaHasta);
    }

    // 🔥 NO FILTRAMOS multaPagada acá (clave del problema)

    const stats = await TransferNotification.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$multaPagada",
          total: { $sum: 1 }
        }
      }
    ]);

    // 🔥 Inicializamos
   let resultado = {
  si: 0,
  no: 0
};

stats.forEach(item => {
  if (
    item._id === true ||
    item._id === "true" ||
    item._id === "si"
  ) {
    resultado.si += item.total;
  }

  if (
    item._id === false ||
    item._id === "false" ||
    item._id === "no"
  ) {
    resultado.no += item.total;
  }
});

    stats.forEach(item => {
      if (item._id === true) resultado.si += item.total;
      else if (item._id === false) resultado.no += item.total;
    });
    res.json(resultado);

  } catch (err) {
    console.error("❌ Error stats:", err);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
});
router.get("/dashboard", auth, async (req, res) => {
  try {
    const totalExpedientes = await Expediente.countDocuments();
    const totalDenuncias = await (await import("../models/Denuncia.js")).default.countDocuments();

    // 🔥 agrupado por área
    const porArea = await Expediente.aggregate([
      {
        $group: {
          _id: "$areaActual",
          total: { $sum: 1 }
        }
      }
    ]);

    const areas = {};
    porArea.forEach(a => {
      areas[a._id] = a.total;
    });

    res.json({
      totalExpedientes,
      totalDenuncias,
      areas
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error dashboard" });
  }
});
export default router;