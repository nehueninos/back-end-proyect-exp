import mongoose from "mongoose";
import { Schema, model } from "mongoose";
const AREAS = ["mesa_entrada", "conciliacion", "despacho", "archivo", "ejecucion"];
const PRIORIDAD =  ['baja', 'media', 'alta'];
const ARTICULO = ['1', '2', '3', '4', '5', '6'];
const LOCALIDAD = [
'Formosa_Capital',
'Clorinda',
'El_Colorado',
'Ingeniero_Juarez',
'Las_Lomitas',
'Ibarreta',
'Laguna_Blanca',
'Comandante_Fontana',
'Palo_Santo',
'Espinillo',
'Pirane',
'San_Francisco_de_Laishi',
'Laguna_Yema',
'General_Enrique_Mosconi',
'San_Hilario',
'Villa_Trinidad',
'Mariano_Boedo',
'Gran_Guardia',
'Mojon_de_Fierro',
'Colonia_Pastoril'];



const expedienteSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    denunciante: {type: String, requiere: true, trim: true },
    denunciado: {type: String, requiere: true, trim: true },
    escritos: {type: String, requiere: true, trim: true }, 
    caratula: { type: String }, // Puede ser URL o base64
    caratulaType: { type:  String },
    descripcion: {type: String, default: ''},
    estado: { type: String },
    prioridad: { type: String, default: "media", enum: PRIORIDAD },
    articulo: {type: String, required: true, enum: ARTICULO },
    localidad: {type: String, required: true, enum: LOCALIDAD },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    areaActual: { type: String, enum: AREAS, required: true },
    conciliadorAsignado: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/**
 * 📌 Virtuals para formatear fecha/hora automáticamente
 */
expedienteSchema.virtual("fechaCreacion").get(function () {
  if (!this.createdAt) return "";
  return new Date(this.createdAt).toLocaleDateString("es-ES");
});

expedienteSchema.virtual("horaCreacion").get(function () {
  if (!this.createdAt) return "";
  return new Date(this.createdAt).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

/**
 * 📌 Aseguramos que los virtuals se incluyan en JSON y Object
 */
expedienteSchema.set("toJSON", { virtuals: true });
expedienteSchema.set("toObject", { virtuals: true });

const Expediente = mongoose.model("Expediente", expedienteSchema);
export default Expediente;
