import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

// ✅ Función para generar token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// ============================
// 📌 Registro
// ============================
router.post("/register", async (req, res) => {
  try {
    const { username, password, name, area } = req.body;

    // Validaciones rápidas
    if (!username || !password || !name || !area) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = new User({
      username,
      password: hashedPassword,
      name,
      area,
      role: username === "admin" ? "admin" : "user",
    });

    await user.save();

    // Generar token
    const token = generateToken(user);

    res.status(201).json({
      message: "Usuario creado exitosamente",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        area: user.area,
      },
    });
  } catch (error) {
    console.error("❌ Error en /register:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

router.get("/by-area/:area", async (req, res) => {
  try {
    const { area } = req.params;
    const users = await User.find({ area });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios por área" });
  }
});
// ============================
// 📌 Login
// ============================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validaciones rápidas
    if (!username || !password) {
      return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
    }

    // Buscar usuario
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "usuario no encontrado" });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password || "");
    if (!isValidPassword) {
      return res.status(400).json({ message: "contraseña invalida" });
    }

    // Generar token
    const token = generateToken(user);

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        area: user.area,
      },
    });
  } catch (error) {
    console.error("❌ Error en /login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Si usás autenticación con JWT
router.post("/logout", (req, res) => {
  // Si el token se guarda en una cookie:
  res.clearCookie("token"); // borra la cookie
  return res.json({ message: "Sesión cerrada correctamente" });
});

export default router;
