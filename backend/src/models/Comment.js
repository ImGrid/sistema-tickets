const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "El contenido del comentario es obligatorio"],
      trim: true,
      maxlength: [2000, "El comentario no puede tener más de 2000 caracteres"],
    },
    type: {
      type: String,
      enum: ["user", "agent", "system"],
      default: "user",
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas
commentSchema.index({ ticketId: 1, createdAt: 1 });
commentSchema.index({ userId: 1 });

module.exports = mongoose.model("Comment", commentSchema);
