import React, { useState } from "react";
import { commentsService } from "../services/api";
import {
  User,
  UserCheck,
  Settings,
  Edit,
  Trash2,
  Save,
  X,
  Shield,
  Clock,
} from "lucide-react";

const CommentItem = ({
  comment,
  currentUser,
  onCommentUpdated,
  onCommentDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Verificar si el usuario actual puede editar este comentario
  const canEdit = () => {
    return (
      comment.userId._id === currentUser._id || currentUser.role === "admin"
    );
  };

  // Verificar si el usuario actual puede eliminar este comentario
  const canDelete = () => {
    return (
      comment.userId._id === currentUser._id || currentUser.role === "admin"
    );
  };

  // Obtener el ícono según el tipo de comentario
  const getCommentIcon = () => {
    if (comment.type === "system") {
      return <Settings className="w-5 h-5 text-gray-600" />;
    } else if (comment.type === "agent") {
      return <UserCheck className="w-5 h-5 text-blue-600" />;
    } else {
      return <User className="w-5 h-5 text-green-600" />;
    }
  };

  // Obtener el color del border según el tipo
  const getBorderColor = () => {
    if (comment.isInternal) {
      return "border-l-4 border-orange-400 bg-orange-50";
    } else if (comment.type === "agent") {
      return "border-l-4 border-blue-400 bg-blue-50";
    } else if (comment.type === "system") {
      return "border-l-4 border-gray-400 bg-gray-50";
    } else {
      return "border-l-4 border-green-400 bg-green-50";
    }
  };

  // Manejar inicio de edición
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    setError("");
  };

  // Manejar cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setError("");
  };

  // Manejar guardar edición
  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setError("El comentario no puede estar vacío");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await commentsService.updateComment(
        comment._id,
        editContent.trim()
      );

      onCommentUpdated(response.comment);
      setIsEditing(false);
    } catch (error) {
      console.error("Error actualizando comentario:", error);
      setError("Error al actualizar el comentario");
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminar comentario
  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      return;
    }

    try {
      setLoading(true);
      await commentsService.deleteComment(comment._id);
      onCommentDeleted(comment._id);
    } catch (error) {
      console.error("Error eliminando comentario:", error);
      setError("Error al eliminar el comentario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${getBorderColor()}`}>
      {/* Header del comentario */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getCommentIcon()}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {comment.userId.name}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{comment.userId.role}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
              {comment.editedAt && (
                <>
                  <span>•</span>
                  <span className="italic">Editado</span>
                </>
              )}
              {comment.isInternal && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-orange-600" />
                    <span className="font-medium text-orange-600">Interno</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Acciones del comentario */}
        {!isEditing && (canEdit() || canDelete()) && (
          <div className="flex space-x-1">
            {canEdit() && (
              <button
                onClick={handleStartEdit}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDelete() && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenido del comentario */}
      <div className="ml-7">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Escribe tu comentario..."
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                disabled={loading || !editContent.trim()}
                className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 mr-1 border-b-2 border-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Guardar
                  </>
                )}
              </button>

              <button
                onClick={handleCancelEdit}
                disabled={loading}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <X className="w-3 h-3 mr-1" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="prose-sm prose max-w-none">
            <p className="text-gray-800 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && !isEditing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="w-4 h-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
