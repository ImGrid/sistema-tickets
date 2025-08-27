import React, { useState, useRef } from "react";
import { attachmentsService } from "../../services/api";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
  Image,
} from "lucide-react";

const FileUpload = ({ ticketId, onFilesUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Configuración de archivos permitidos
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const maxFiles = 5;

  // Validar archivo individual
  const validateFile = (file) => {
    const errors = [];

    // Verificar tipo
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Tipo de archivo no permitido: ${file.type}`);
    }

    // Verificar tamaño
    if (file.size > maxFileSize) {
      errors.push(
        `Archivo muy grande: ${formatFileSize(file.size)} (máximo: 5MB)`
      );
    }

    return errors;
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-8 h-8 text-green-600" />;
    } else {
      return <FileText className="w-8 h-8 text-blue-600" />;
    }
  };

  // Manejar selección de archivos
  const handleFileSelection = (files) => {
    const fileList = Array.from(files);
    const validFiles = [];
    const fileErrors = [];

    // Validar cantidad total
    if (selectedFiles.length + fileList.length > maxFiles) {
      fileErrors.push(`Máximo ${maxFiles} archivos permitidos`);
      setErrors(fileErrors);
      return;
    }

    // Validar cada archivo
    fileList.forEach((file, index) => {
      const validation = validateFile(file);
      if (validation.length === 0) {
        validFiles.push({
          file,
          id: Date.now() + index,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
        });
      } else {
        fileErrors.push(`${file.name}: ${validation.join(", ")}`);
      }
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setErrors(fileErrors);
  };

  // Manejar drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelection(files);
  };

  // Manejar click en file input
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleFileSelection(files);
    // Limpiar input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = "";
  };

  // Abrir file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Remover archivo seleccionado
  const removeFile = (fileId) => {
    setSelectedFiles((prev) => {
      const newFiles = prev.filter((f) => f.id !== fileId);
      // Limpiar URL objects para evitar memory leaks
      const removedFile = prev.find((f) => f.id === fileId);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  };

  // Subir archivos
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setErrors([]);

      // Preparar archivos para upload
      const filesToUpload = selectedFiles.map((f) => f.file);

      // Simular progress (el backend no devuelve progress real)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          filesToUpload.forEach((_, index) => {
            if (!newProgress[index]) newProgress[index] = 0;
            if (newProgress[index] < 90) {
              newProgress[index] += Math.random() * 20;
            }
          });
          return newProgress;
        });
      }, 200);

      // Subir archivos
      const response = await attachmentsService.uploadFiles(
        ticketId,
        filesToUpload
      );

      clearInterval(progressInterval);

      // Completar progress
      setUploadProgress((prev) => {
        const completed = {};
        filesToUpload.forEach((_, index) => {
          completed[index] = 100;
        });
        return completed;
      });

      // Notificar éxito
      onFilesUploaded(response.attachments);

      // Limpiar estado
      setTimeout(() => {
        selectedFiles.forEach((f) => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
        setSelectedFiles([]);
        setUploadProgress({});
      }, 1000);
    } catch (error) {
      console.error("Error subiendo archivos:", error);

      setErrors([error.response?.data?.error || "Error al subir los archivos"]);
    } finally {
      setUploading(false);
    }
  };

  // Limpiar archivos seleccionados
  const clearSelectedFiles = () => {
    selectedFiles.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setSelectedFiles([]);
    setUploadProgress({});
    setErrors([]);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* Header */}
      <div className="flex items-center mb-4 space-x-2">
        <Upload className="w-5 h-5 text-gray-600" />
        <h4 className="text-sm font-medium text-gray-900">Subir Archivos</h4>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={openFilePicker}
      >
        <Upload
          className={`w-12 h-12 mx-auto mb-4 ${
            isDragging ? "text-blue-600" : "text-gray-400"
          }`}
        />

        <p className="mb-2 text-sm text-gray-600">
          {isDragging
            ? "Suelta los archivos aquí"
            : "Arrastra archivos aquí o haz click para seleccionar"}
        </p>

        <p className="text-xs text-gray-500">
          Máximo {maxFiles} archivos, 5MB cada uno
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Errores de validación */}
      {errors.length > 0 && (
        <div className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="ml-2">
              <p className="text-sm font-medium text-red-800">
                Errores de validación:
              </p>
              <ul className="mt-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-900">
              Archivos seleccionados ({selectedFiles.length})
            </h5>
            <button
              onClick={clearSelectedFiles}
              disabled={uploading}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Limpiar todo
            </button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((fileData, index) => (
              <div
                key={fileData.id}
                className="flex items-center p-3 bg-white border border-gray-200 rounded-lg"
              >
                {/* Icono/Preview */}
                <div className="flex-shrink-0 mr-3">
                  {fileData.preview ? (
                    <img
                      src={fileData.preview}
                      alt={fileData.file.name}
                      className="object-cover w-12 h-12 rounded"
                    />
                  ) : (
                    getFileIcon(fileData.file)
                  )}
                </div>

                {/* Info del archivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileData.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(fileData.file.size)}
                  </p>

                  {/* Progress bar durante upload */}
                  {uploading && uploadProgress[index] !== undefined && (
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                          style={{ width: `${uploadProgress[index] || 0}%` }}
                        ></div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {Math.round(uploadProgress[index] || 0)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex-shrink-0 ml-3">
                  {uploadProgress[index] === 100 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <button
                      onClick={() => removeFile(fileData.id)}
                      disabled={uploading}
                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botón de subir */}
          <div className="flex justify-end pt-3">
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir {selectedFiles.length} archivo
                  {selectedFiles.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
