const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    // Configuración de conexión simplificada para versiones modernas
    const options = {
      // Configuraciones de rendimiento
      maxPoolSize: 10, // Máximo 10 conexiones en el pool
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
      socketTimeoutMS: 45000, // Timeout de socket de 45 segundos

      // Configuraciones de reconexión
      maxIdleTimeMS: 30000, // Cerrar conexiones inactivas después de 30s
    };

    // Conectar a MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info(`✅ MongoDB conectado: ${conn.connection.host}`);
    logger.info(`📊 Base de datos: ${conn.connection.name}`);

    // Eventos de la conexión
    mongoose.connection.on("error", (err) => {
      logger.error("❌ Error de conexión MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️  MongoDB desconectado");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("🔄 MongoDB reconectado");
    });

    // Manejo de cierre graceful
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        logger.info(
          "🔒 Conexión MongoDB cerrada por terminación de la aplicación"
        );
      } catch (error) {
        logger.error("❌ Error al cerrar conexión MongoDB:", error);
      }
    });
  } catch (error) {
    logger.error("❌ Error conectando a MongoDB:", error.message);

    // En desarrollo, mostrar más detalles
    if (process.env.NODE_ENV === "development") {
      logger.error("Detalles del error:", error);
      logger.error(
        "MongoDB URI:",
        process.env.MONGODB_URI ? "Configurado" : "NO CONFIGURADO"
      );
    }

    // Salir del proceso si no se puede conectar
    process.exit(1);
  }
};

// Función para verificar el estado de la conexión
const getConnectionStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || "unknown";
};

// Función para obtener estadísticas de la conexión
const getConnectionStats = () => {
  const connection = mongoose.connection;

  return {
    status: getConnectionStatus(),
    host: connection.host,
    port: connection.port,
    name: connection.name,
    collections: Object.keys(connection.collections).length,
    models: Object.keys(connection.models).length,
  };
};

module.exports = {
  connectDB,
  getConnectionStatus,
  getConnectionStats,
};
