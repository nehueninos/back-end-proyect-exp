import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // ⚠️ Importante: setear strictQuery antes de conectar
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.ATLAS);

    console.log(`✅ Conectado a MongoDB: ${conn.connection.name}`);
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    process.exit(1); // Detiene la app si no conecta
  }
};

export default connectDB;
