import { Router } from "express";
import auth from "../middlewares/auth.js";
import Expediente from "../models/Expediente.js";
import TransferNotification from "../models/TransferNotification.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = Router();

/* ✅ MODELO LOCAL: para guardar el índice del último conciliador */
const systemConfigSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
});
const SystemConfig =
  mongoose.models.SystemConfig ||
  mongoose.model("SystemConfig", systemConfigSchema);

/* ✅ FUNCIÓN DE ROTACIÓN DE CONCILIADORES */
async function getNextConciliador() {
  const conciliadores = await User.find({ role: "user", area: "conciliacion" }).sort({ _id: 1 });

  if (conciliadores.length === 0) {
    throw new Error("No hay conciliadores disponibles");
  }

  // Obtener el índice actual guardado
  let config = await SystemConfig.findOne({ key: "ultimoConciliadorIndex" });
  if (!config) {
    config = new SystemConfig({ key: "ultimoConciliadorIndex", value: 0 });
  }

  const currentIndex = config.value || 0;
  const conciliadorAsignado = conciliadores[currentIndex];

  // Calcular el siguiente índice (rotación)
  const nextIndex = (currentIndex + 1) % conciliadores.length;
  config.value = nextIndex;
  await config.save();

  return conciliadorAsignado;
}

/* ✅ MIS EXPEDIENTES */
router.get("/mis-expedientes", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const expedientes = await Expediente.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "name username area")
      .populate("createdBy", "name username area")
      .populate("conciliadorAsignado", "name username area");


    res.json(expedientes);
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo mis expedientes" });
  }
});

/* ✅ TODOS LOS EXPEDIENTES CON FILTROS */
router.get("/", auth, async (req, res) => {
  try {
    const { search, area, estado } = req.query;

    console.log(">> /api/expedientes - req.user:", req.user._id);
    console.log(">> /api/expedientes - req.query:", req.query);

    const role = String(req.user?.role || "").toLowerCase();
    const userArea = String(req.user?.area || "").toLowerCase();

    let filter = {};

    if (role !== "admin" && userArea !== "mesa_entrada") {
      filter.area = userArea;
    }

    if (area && area !== "all") {
      const requestedArea = String(area).toLowerCase();
      if (role === "admin" || userArea === "mesa_entrada") {
        filter.area = requestedArea;
      }
    }

    if (search) {
      const regex = { $regex: search, $options: "i" };
      const or = [{ nombre: regex }, { numero: regex }];
      if (Object.keys(filter).length > 0) {
        filter = { $and: [filter, { $or: or }] };
      } else {
        filter.$or = or;
      }
    }

    if (estado && estado !== "all") {
      if (filter.$and) filter.$and.push({ estado });
      else if (filter.$or) filter = { $and: [{ $or: filter.$or }, { estado }] };
      else filter.estado = estado;
    }

    const expedientes = await Expediente.find(filter)
      .populate("userId", "name username area")
      .populate("createdBy", "name username area")
      .populate("conciliadorAsignado", "name username area")
      .sort({ createdAt: -1 });

    return res.json(expedientes);
  } catch (error) {
    console.error("❌ Error GET /expedientes:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

/* ✅ CREAR NUEVO EXPEDIENTE CON ROTACIÓN DE CONCILIADORES */
router.post("/", auth, async (req, res) => {
  try {
    const {
      numero,
      nombre,
      denunciante,
      denunciado,
      escritos,
      caratula,
      caratulaType,
      descripcion,
      estado,
      prioridad,
      articulo,
      localidad,
      areaActual,
      fechaCreacion,
      horaCreacion,
    } = req.body;

    // Verificar duplicado
    const existingExpediente = await Expediente.findOne({ numero });
    if (existingExpediente) {
      return res.status(400).json({ message: "El número de expediente ya existe" });
    }

    // Asignar conciliador por rotación
    const conciliador = await getNextConciliador();

    const expediente = new Expediente({
      numero,
      nombre,
      denunciante,
      denunciado,
      escritos,
      caratula,
      caratulaType,
      descripcion,
      estado: estado || "activo",
      prioridad,
      articulo,
      localidad,
      createdBy: req.user._id,
      userId: conciliador._id, // asignado al conciliador
      conciliadorAsignado: conciliador._id,  
      areaActual: "conciliacion",
      fechaCreacion,
      horaCreacion,
    });

    await expediente.save();

    // Crear notificación automática
    const notification = new TransferNotification({
      expedienteId: expediente._id,
      fromUserId: req.user._id,
      toUserId: conciliador._id,
      toArea: "conciliacion",
      message: `Expediente asignado automáticamente: ${expediente.numero}`,
      status: "pending",
    });

    await notification.save();

    res.status(201).json({
      expediente,
      message: `Expediente asignado a ${conciliador.name}`,
    });
  } catch (error) {
    console.error("💥 Error al crear expediente:", error);
    res.status(500).json({
      message: "Error al crear expediente",
      error: error.message,
    });
  }
});

/* ✅ OBTENER EXPEDIENTE POR ID */
router.get("/:id", auth, async (req, res) => {
  try {
    const expediente = await Expediente.findById(req.params.id);
    if (!expediente) {
      return res.status(404).json({ message: "Expediente no encontrado" });
    }
    res.json(expediente);
  } catch (error) {
    console.error("❌ Error GET /expedientes/:id:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
});

/* ✅ HISTORIAL (placeholder) */
router.get("/:id/history", auth, async (req, res) => {
  res.json([]); // completar si guardás historial
});

export default router;
