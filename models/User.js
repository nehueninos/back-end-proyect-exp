import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = ["admin", "user"];
const AREAS = ["mesa_entrada", "conciliacion", "despacho", "archivo", "ejecucion"];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // evita duplicados tipo "Admin" y "admin"
    },
    password: {
      type: String,
      required: true,
      select: false, // nunca se devuelve automáticamente
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "user",
    },
    area: {
      type: String,
      enum: AREAS,
      required: true,
    },
   
  },
  { timestamps: true }
);

/**
 * 📌 Método para comparar contraseñas
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
