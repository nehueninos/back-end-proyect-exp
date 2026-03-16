import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    // 🔑 Soporta "Authorization: Bearer <token>"
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "No hay token, permiso no válido" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    // ✅ Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Buscar usuario en DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // ✅ Guardamos usuario en la request
    req.user =  {
      _id: user._id,
  username: user.username,
  role: user.role,
  area: user.area,   // campo consistente
  name: user.name
    };

    next();
  } catch (err) {
    console.error("❌ Error en middleware auth:", err.message);
    return res.status(401).json({ message: "Token no válido o expirado" });
  }
};

export default auth;
