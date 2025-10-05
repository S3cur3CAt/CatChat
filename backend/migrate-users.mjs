import mongoose from "mongoose";
import User from "./src/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateUsers() {
  try {
    console.log("🚀 Iniciando migración de usuarios...");

    // Agregar el campo selectedBackground a todos los usuarios existentes
    const result = await User.updateMany(
      { selectedBackground: { $exists: false } }, // Solo usuarios que no tienen el campo
      { $set: { selectedBackground: "none" } } // Establecer valor por defecto
    );

    console.log(`✅ Migración completada. ${result.modifiedCount} usuarios actualizados.`);

    if (result.modifiedCount > 0) {
      console.log("📋 Usuarios migrados exitosamente");
    } else {
      console.log("ℹ️ Todos los usuarios ya tienen el campo selectedBackground");
    }

  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
}

// Ejecutar migración
migrateUsers();
