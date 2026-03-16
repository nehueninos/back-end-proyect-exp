import express from "express";
import Expediente from "../models/Expediente.js";
import User from "../models/User.js";
import TransferNotification from "../models/TransferNotification.js";
import ExpedienteHistory from "../models/ExpedienteHistory.js";
import auth from "../middlewares/auth.js";


const router = express.Router();

/**
 * ✅ Crear solicitud de transferencia — ASIGNA AUTOMÁTICAMENTE A UN CONCILIADOR RANDOM
 */
router.post("/request", auth, async (req, res) => {
  console.log("TRANSFER BODY:", req.body);

  try {
    const { expedienteId, toUserId, message } = req.body;

    if (!expedienteId) {
      return res.status(400).json({ message: "expedienteId es obligatorio" });
    }

    const expediente = await Expediente.findById(expedienteId);
    if (!expediente) {
      return res.status(404).json({ message: "Expediente no encontrado" });
    }

    // ✅ Solo puede transferir quien lo tiene asignado ahora
    if (expediente.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No tienes permisos para transferir este expediente" });
    }

    let destinationUser = null;

    // ✅ 1️⃣ Transferencia manual (se usa el usuario enviado por el front)
    if (toUserId) {
      destinationUser = await User.findById(toUserId);
      if (!destinationUser) {
        return res.status(404).json({ message: "Usuario destinatario no encontrado" });
      }
    } 
    // ✅ 2️⃣ Transferencia automática (se elige conciliador random)
    else {
      const conciliadores = await User.find({ role: "user", area: "conciliacion" });

      if (conciliadores.length === 0) {
        return res.status(400).json({ message: "No hay conciliadores disponibles" });
      }

      destinationUser = conciliadores[Math.floor(Math.random() * conciliadores.length)];
    }

    // ✅ Crear la notificación
    const notification = new TransferNotification({
      expedienteId: expediente._id,
      fromUserId: req.user._id,
      toUserId: destinationUser._id,
      toArea: destinationUser.area,
      message: message || `Transferencia automática a ${destinationUser.name}`,
      status: "pending",
    });

    await notification.save();

    const populatedNotification = await TransferNotification.findById(notification._id)
      .populate("expedienteId")
      .populate("fromUserId", "username name area")
      .populate("toUserId", "username name area");

    res.status(201).json(populatedNotification);

  } catch (error) {
    console.error("❌ Error en POST /request:", error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/pendientes', auth, async (req, res) => {
  try {
    const pendientes = await TransferNotification.find({
      toUserId: req.user._id,
      status: "pending",
    })
      .populate("expedienteId")
      .populate("fromUserId", "name area") // ✅ origen
      .populate("toUserId", "name area")   // ✅ destino
      .sort({ createdAt: -1 });

    res.json(pendientes);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo pendientes' });
  }
});


/**
 * ✅ Notificaciones pendientes
 */
router.get("/notifications", auth, async (req, res) => {
  try {
    const notifications = await TransferNotification.find({
      toUserId: req.user._id,
      status: "pending",
    })
      .populate("expedienteId")
      .populate("fromUserId", "username name area")
      .sort({ createdAt: -1 });

    const formatted = notifications.map((notif) => ({
      id: notif._id,
      expediente: notif.expedienteId,
      from_user: notif.fromUserId,
      to_user_id: notif.toUserId,
      to_area: notif.toArea,
      status: notif.status,
      message: notif.message,
      created_at: notif.createdAt,
      updated_at: notif.updatedAt,
    }));

    res.json(formatted);

  } catch (error) {
    console.error("❌ Error en GET /notifications:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ Aceptar transferencia (SIN random)
 */
router.post("/accept/:notificationId", auth, async (req, res) => {
  try {
    const notification = await TransferNotification.findById(req.params.notificationId)
      .populate("expedienteId");

    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    if (notification.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No tienes permisos para aceptar esta transferencia" });
    }

    const expediente = notification.expedienteId;

    // ✅ Guardamos área anterior ANTES de modificar
    const oldArea = expediente.areaActual;

    // ✅ Aceptamos el pase
    expediente.userId = req.user._id;
    expediente.areaActual = req.user.area;
    await expediente.save();

    // ✅ Cambiamos la notificación
    notification.status = "accepted";
    await notification.save();

    // ✅ Guardar historial
    const history = new ExpedienteHistory({
      expedienteId: expediente._id,
      fromArea: oldArea,
      toArea: req.user.area,
      fromUserId: notification.fromUserId,
      toUserId: req.user._id,
      observaciones: notification.message || "Transferencia aceptada",
    });

    await history.save();

    // ✅ Enviar UNA sola respuesta
    return res.json({
      success: true,
      message: "Transferencia aceptada",
      expedienteId: expediente._id,
    });

  } catch (error) {
    console.error("❌ Error en POST /accept:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


/**
 * ✅ Rechazar transferencia
 */
router.post("/reject/:notificationId", auth, async (req, res) => {
  try {
    const notification = await TransferNotification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    if (notification.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No tienes permisos para rechazar esta transferencia" });
    }

    notification.status = "rejected";
    await notification.save();

    res.json({ success: true, message: "Transferencia rechazada" });

  } catch (error) {
    console.error("❌ Error en POST /reject:", error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
