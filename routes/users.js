import express from "express";
import User from "../models/User.js";
import ExpedienteHistory from "../models/ExpedienteHistory.js";
import auth  from "../middlewares/auth.js";

const router = express.Router();

// Buscar usuarios por área (ignora acentos y mayúsculas)
router.get("/by-area/:area", auth, async (req, res) => {
  try {
    const areaParam = decodeURIComponent(req.params.area)
      .normalize("NFD") // separa letras y tildes
      .replace(/[\u0300-\u036f]/g, "") // elimina tildes
      .toLowerCase(); // minúsculas para comparar mejor

    // Trae todos los usuarios
    const users = await User.find()
      .select("_id username name area")
      .sort({ name: 1 });

    // Filtra por coincidencia sin importar tildes ni mayúsculas
    const filtered = users.filter((u) => {
      const normalizedArea = u.area
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return normalizedArea === areaParam;
    });

    res.json(filtered);
  } catch (error) {
    console.error("Error en /by-area/:area:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/history/:expedienteId', auth, async (req, res) => {
  try {
    const history = await ExpedienteHistory.find({ expedienteId: req.params.expedienteId })
      .populate('fromUserId', 'username name')
      .populate('toUserId', 'username name')
      .sort({ createdAt: -1 });

    const formattedHistory = history.map(record => ({
      id: record._id,
      expediente_id: record.expedienteId,
      from_area: record.fromArea,
      to_area: record.toArea,
      from_user: record.fromUserId,
      to_user: record.toUserId,
      observaciones: record.observaciones,
      created_at: record.createdAt
    }));

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
