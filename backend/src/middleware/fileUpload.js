const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(process.cwd(), "uploads", "tickets");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp_nombreoriginal
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;
    cb(null, fileName);
  },
});

// Validación de archivos
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB por defecto
    files: 5, // Máximo 5 archivos por request
  },
});

// Middleware para manejar errores de multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Archivo demasiado grande",
        maxSize: "5MB",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Demasiados archivos",
        maxFiles: 5,
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Campo de archivo inesperado",
      });
    }
  }

  if (error.message.includes("Tipo de archivo no permitido")) {
    return res.status(400).json({
      error: error.message,
      allowedTypes: ["JPEG", "PNG", "GIF", "PDF", "TXT", "DOC", "DOCX"],
    });
  }

  next(error);
};

module.exports = {
  upload,
  handleUploadError,
};
