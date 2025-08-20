const fs = require("fs");
const path = require("path");

// Crear carpeta de logs si no existe
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Colores para consola
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Configuración del logger
const config = {
  level: process.env.LOG_LEVEL || "info",
  console: true,
  file: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
};

class Logger {
  constructor() {
    this.currentLogLevel = levels[config.level] || levels.info;
  }

  // Función para formatear timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Función para formatear mensaje
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const pid = process.pid;

    let logObject = {
      timestamp,
      level,
      pid,
      message,
    };

    // Agregar metadata si existe
    if (Object.keys(meta).length > 0) {
      logObject.meta = meta;
    }

    return logObject;
  }

  // Función para escribir a archivo
  writeToFile(level, formattedMessage) {
    if (!config.file) return;

    try {
      const filename = path.join(
        logsDir,
        `app-${new Date().toISOString().split("T")[0]}.log`
      );
      const logLine = JSON.stringify(formattedMessage) + "\n";

      fs.appendFileSync(filename, logLine);

      // Verificar tamaño del archivo y rotar si es necesario
      this.rotateLogFile(filename);
    } catch (error) {
      console.error("Error escribiendo log a archivo:", error);
    }
  }

  // Función para rotar archivos de log
  rotateLogFile(filename) {
    try {
      const stats = fs.statSync(filename);

      if (stats.size > config.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const newFilename = filename.replace(".log", `-${timestamp}.log`);

        fs.renameSync(filename, newFilename);

        // Limpiar archivos antiguos
        this.cleanOldLogFiles();
      }
    } catch (error) {
      // Archivo no existe o error leyendo stats, no hacer nada
    }
  }

  // Función para limpiar archivos de log antiguos
  cleanOldLogFiles() {
    try {
      const files = fs
        .readdirSync(logsDir)
        .filter((file) => file.endsWith(".log"))
        .map((file) => ({
          name: file,
          path: path.join(logsDir, file),
          time: fs.statSync(path.join(logsDir, file)).mtime,
        }))
        .sort((a, b) => b.time - a.time);

      // Mantener solo los archivos más recientes
      if (files.length > config.maxFiles) {
        const filesToDelete = files.slice(config.maxFiles);
        filesToDelete.forEach((file) => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error("Error limpiando archivos de log:", error);
    }
  }

  // Función para imprimir en consola con colores
  printToConsole(level, formattedMessage) {
    if (!config.console) return;

    const colorMap = {
      error: colors.red,
      warn: colors.yellow,
      info: colors.green,
      debug: colors.cyan,
    };

    const color = colorMap[level] || colors.white;
    const timestamp = formattedMessage.timestamp;
    const message = formattedMessage.message;

    let output = `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${
      colors.reset
    }`;

    // Agregar metadata si existe
    if (formattedMessage.meta) {
      output += `\n${color}META: ${JSON.stringify(
        formattedMessage.meta,
        null,
        2
      )}${colors.reset}`;
    }

    console.log(output);
  }

  // Función principal de logging
  log(level, message, meta = {}) {
    // Verificar si el nivel está habilitado
    if (levels[level] > this.currentLogLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);

    // Escribir a consola
    this.printToConsole(level, formattedMessage);

    // Escribir a archivo
    this.writeToFile(level, formattedMessage);
  }

  // Métodos de conveniencia
  error(message, meta = {}) {
    this.log("error", message, meta);
  }

  warn(message, meta = {}) {
    this.log("warn", message, meta);
  }

  info(message, meta = {}) {
    this.log("info", message, meta);
  }

  debug(message, meta = {}) {
    this.log("debug", message, meta);
  }

  // Método para logging de requests HTTP
  request(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    };

    this.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, meta);
  }

  // Método para logging de errores con stack trace
  errorWithStack(message, error) {
    const meta = {
      error: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code }),
      ...(error.name && { name: error.name }),
    };

    this.error(message, meta);
  }
}

// Crear instancia única del logger
const logger = new Logger();

module.exports = logger;
