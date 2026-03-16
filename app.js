import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config.js";
import mongoose from "mongoose";
import { rutas } from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import transferRoutes from "./routes/transfers.js";
import expedientesRoutes from "./routes/expedientes.js";
import usersRoutes from "./routes/users.js";

// ⚡ Recomendación: evitar warnings de Mongoose en versiones nuevas
mongoose.set("strictQuery", true);

// Conectar a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    // Estas opciones ya no son necesarias en mongoose >= 6,
    // pero si estás en v5 déjalas
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
    process.exit(1); // 🔴 si falla la DB, el server no debería seguir corriendo
  });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Configuración CORS
const whiteList = [process.env.FRONTEND_URL || "http://localhost:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // ⚡ permite enviar cookies y headers de autorización
};
app.use(cors(corsOptions));

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/expedientes", expedientesRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/users", usersRoutes);
app.use("/api", rutas()); // otras rutas agrupadas

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente 🚀" });
});

// ⚡ Middleware global para errores (catch de throw o next(err))
app.use((err, req, res, next) => {
  console.error("⚠️ Error global:", err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto: ${PORT}`);
});
