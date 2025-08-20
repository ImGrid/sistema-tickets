const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: [true, "El nombre original del archivo es obligatorio"],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, "El nombre del archivo es obligatorio"],
      unique: true,
    },
    filePath: {
      type: String,
      required: [true, "La ruta del archivo es obligatoria"],
    },
    mimeType: {
      type: String,
      required: [true, "El tipo MIME es obligatorio"],
    },
    fileSize: {
      type: Number,
      required: [true, "El tamaño del archivo es obligatorio"],
      min: [0, "El tamaño del archivo no puede ser negativo"],
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas
attachmentSchema.index({ ticketId: 1 });
attachmentSchema.index({ uploadedBy: 1 });
attachmentSchema.index({ fileName: 1 });

module.exports = mongoose.model("Attachment", attachmentSchema);
