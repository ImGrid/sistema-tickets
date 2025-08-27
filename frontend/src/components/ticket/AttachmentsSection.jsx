import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { attachmentsService } from "../../services/api";
import FileUpload from "../common/FileUpload";
import AttachmentItem from "./AttachmentItem";
import { Paperclip, RefreshCw, AlertCircle, Upload } from "lucide-react";

const AttachmentsSection = ({ ticketId, ticketStatus }) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Cargar archivos al montar y cuando cambie el ticketId
  useEffect(() => {
    if (ticketId) {
      loadAttachments();
    }
  }, [ticketId]);

  // Función para cargar archivos adjuntos
  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await attachmentsService.getAttachments(ticketId);
      setAttachments(response.attachments || []);
    } catch (error) {
      console.error("Error cargando archivos:", error);
      setError("Error cargando los archivos adjuntos");
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar archivos
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await attachmentsService.getAttachments(ticketId);
      setAttachments(response.attachments || []);
    } catch (error) {
      console.error("Error refrescando archivos:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Función para manejar archivos subidos exitosamente
  const handleFilesUploaded = (newAttachments) => {
    setAttachments((prevAttachments) => [
      ...prevAttachments,
      ...newAttachments,
    ]);
  };

  // Función para manejar archivo eliminado
  const handleFileDeleted = (deletedAttachmentId) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter(
        (attachment) => attachment._id !== deletedAttachmentId
      )
    );
  };

  // Verificar si el usuario puede subir archivos
  const canUploadFiles = () => {
    // No se pueden subir archivos en tickets cerrados
    if (ticketStatus === "closed") return false;

    // Todos los usuarios autenticados pueden subir archivos a sus tickets relevantes
    return true;
  };

  // Calcular estadísticas de archivos
  const fileStats = {
    totalFiles: attachments.length,
    totalSize: attachments.reduce((sum, file) => sum + (file.fileSize || 0), 0),
    imageFiles: attachments.filter(
      (file) => file.mimeType && file.mimeType.startsWith("image/")
    ).length,
    documentFiles: attachments.filter(
      (file) => file.mimeType && !file.mimeType.startsWith("image/")
    ).length,
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header de archivos adjuntos */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paperclip className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Archivos Adjuntos ({attachments.length})
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Estadísticas básicas */}
          {fileStats.totalFiles > 0 && (
            <span className="text-sm text-gray-500">
              {formatFileSize(fileStats.totalSize)}
            </span>
          )}

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2 text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 border-l-4 border-red-400 bg-red-50">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadAttachments}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload de archivos */}
      {canUploadFiles() && (
        <FileUpload ticketId={ticketId} onFilesUploaded={handleFilesUploaded} />
      )}

      {/* Lista de archivos */}
      <div className="space-y-4">
        {/* Loading state */}
        {loading && (
          <div className="p-6 text-center">
            <div className="w-6 h-6 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando archivos...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && attachments.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <Paperclip className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No hay archivos adjuntos</p>
            {canUploadFiles() && (
              <p className="mt-1 text-xs text-gray-400">
                Arrastra archivos aquí o usa el botón de subir
              </p>
            )}
          </div>
        )}

        {/* Lista de archivos */}
        {!loading && !error && attachments.length > 0 && (
          <div className="space-y-3">
            {/* Resumen de archivos */}
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total: {fileStats.totalFiles} archivos</span>
                <span>Tamaño: {formatFileSize(fileStats.totalSize)}</span>
                <span>Imágenes: {fileStats.imageFiles}</span>
                <span>Documentos: {fileStats.documentFiles}</span>
              </div>
            </div>

            {/* Archivos */}
            {attachments.map((attachment) => (
              <AttachmentItem
                key={attachment._id}
                attachment={attachment}
                currentUser={user}
                onFileDeleted={handleFileDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info sobre tipos de archivo permitidos */}
      {canUploadFiles() && (
        <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
          <p className="text-sm text-blue-800">
            <strong>📎 Archivos permitidos:</strong> Imágenes (JPG, PNG, GIF),
            Documentos (PDF, TXT, DOC, DOCX). Tamaño máximo: 5MB por archivo.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;
