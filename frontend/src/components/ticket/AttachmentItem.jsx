import React, { useState } from "react";
import toast from "react-hot-toast";
import { attachmentsService } from "../../services/api";
import {
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  File,
  User,
  Calendar,
  HardDrive,
  Eye,
  X,
} from "lucide-react";

const AttachmentItem = ({ attachment, currentUser, onFileDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Verificar si el usuario actual puede eliminar este archivo
  const canDelete = () => {
    return (
      attachment.uploadedBy._id === currentUser._id ||
      currentUser.role === "admin"
    );
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = () => {
    const mimeType = attachment.mimeType || "";

    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 text-green-600" />;
    } else if (mimeType === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    } else if (mimeType === "text/plain") {
      return <FileText className="w-8 h-8 text-gray-600" />;
    } else {
      return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Obtener extensión del archivo
  const getFileExtension = (filename) => {
    return filename.split(".").pop()?.toUpperCase() || "";
  };

  // Verificar si es imagen
  const isImage = () => {
    return attachment.mimeType && attachment.mimeType.startsWith("image/");
  };

  // Manejar descarga de archivo
  const handleDownload = async () => {
    try {
      setLoading(true);
      setError("");

      // Mostrar toast de inicio de descarga
      const downloadingToast = toast.loading(
        `Descargando ${attachment.originalName}...`
      );

      // Llamar al servicio de descarga
      const response = await attachmentsService.downloadFile(attachment._id);

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.originalName);
      document.body.appendChild(link);
      link.click();

      // Limpiar
      link.remove();
      window.URL.revokeObjectURL(url);

      // Mostrar éxito
      toast.dismiss(downloadingToast);
      toast.success(
        `Archivo "${attachment.originalName}" descargado exitosamente`
      );
    } catch (error) {
      console.error("Error descargando archivo:", error);
      const errorMessage =
        error.response?.data?.error || "Error al descargar el archivo";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de archivo
  const handleDelete = async () => {
    const fileName = attachment.originalName;

    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar "${fileName}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Mostrar toast de progreso
      const deletingToast = toast.loading(`Eliminando ${fileName}...`);

      await attachmentsService.deleteFile(attachment._id);

      // Mostrar éxito
      toast.dismiss(deletingToast);
      toast.success(`Archivo "${fileName}" eliminado exitosamente`);

      onFileDeleted(attachment._id);
    } catch (error) {
      console.error("Error eliminando archivo:", error);
      const errorMessage =
        error.response?.data?.error || "Error al eliminar el archivo";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Construir URL de imagen para preview
  const getImagePreviewUrl = () => {
    if (!isImage()) return null;
    // Suponiendo que el backend sirve las imágenes en /uploads
    return `${
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    }/uploads/${attachment.fileName}`.replace("/api", "");
  };

  // Manejar vista previa de imagen
  const handleImagePreview = () => {
    if (isImage()) {
      setShowImagePreview(true);
      toast.info("Haz clic fuera de la imagen para cerrar la vista previa");
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
      {/* Header del archivo */}
      <div className="flex items-start space-x-3">
        {/* Icono del archivo */}
        <div className="flex-shrink-0">{getFileIcon()}</div>

        {/* Información del archivo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {attachment.originalName}
              </h4>

              <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <HardDrive className="w-3 h-3 mr-1" />
                  <span>{formatFileSize(attachment.fileSize)}</span>
                </div>

                <div className="flex items-center">
                  <File className="w-3 h-3 mr-1" />
                  <span>{getFileExtension(attachment.originalName)}</span>
                </div>

                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  <span>{attachment.uploadedBy.name}</span>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    {new Date(attachment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex ml-4 space-x-1">
              {/* Preview para imágenes */}
              {isImage() && (
                <button
                  onClick={handleImagePreview}
                  disabled={loading}
                  className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                  title="Ver imagen"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}

              {/* Descargar */}
              <button
                onClick={handleDownload}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
                title="Descargar archivo"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Eliminar (solo si se puede) */}
              {canDelete() && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <div className="w-3 h-3 mr-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              Procesando...
            </div>
          )}
        </div>
      </div>

      {/* Preview de imagen inline (opcional) */}
      {isImage() && showImagePreview && (
        <div className="mt-4">
          <div className="relative">
            <img
              src={getImagePreviewUrl()}
              alt={attachment.originalName}
              onLoad={() => {
                setImageLoading(false);
                toast.success("Imagen cargada");
              }}
              onError={() => {
                setImageLoading(false);
                toast.error("Error cargando la imagen");
              }}
              className={`max-w-full h-auto max-h-64 rounded-lg border border-gray-200 ${
                imageLoading ? "opacity-50" : "opacity-100"
              }`}
            />

            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              </div>
            )}

            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute p-1 text-white bg-black bg-opacity-50 rounded-full top-2 right-2 hover:bg-opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de imagen completa */}
      {isImage() && showImagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={getImagePreviewUrl()}
              alt={attachment.originalName}
              className="max-w-full max-h-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                toast.error("Error cargando la imagen en pantalla completa");
              }}
            />

            <button
              onClick={() => {
                setShowImagePreview(false);
                toast.success("Vista previa cerrada");
              }}
              className="absolute p-2 text-white bg-black bg-opacity-50 rounded-full top-2 right-2 hover:bg-opacity-70"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute p-2 text-white bg-black bg-opacity-50 rounded bottom-4 left-4">
              <p className="text-sm">{attachment.originalName}</p>
              <p className="text-xs">{formatFileSize(attachment.fileSize)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentItem;
