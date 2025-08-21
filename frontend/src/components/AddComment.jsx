import React, { useState } from "react";
import { commentsService } from "../services/api";
import { MessageSquare, Send, Shield } from "lucide-react";

const AddComment = ({ ticketId, userRole, onCommentAdded }) => {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Verificar si el usuario puede crear comentarios internos
  const canCreateInternalComments = () => {
    return ["agent", "supervisor", "admin"].includes(userRole);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("El comentario no puede estar vacío");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await commentsService.createComment(
        ticketId,
        content.trim(),
        isInternal && canCreateInternalComments()
      );

      onCommentAdded(response.comment);

      // Limpiar formulario
      setContent("");
      setIsInternal(false);
    } catch (error) {
      console.error("Error creando comentario:", error);

      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Error al crear el comentario");
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en textarea
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center mb-3 space-x-2">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h4 className="text-sm font-medium text-gray-900">
          Agregar Comentario
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Textarea para el comentario */}
        <div>
          <textarea
            value={content}
            onChange={handleContentChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Escribe tu comentario aquí..."
            disabled={loading}
          />

          {/* Contador de caracteres */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Caracteres: {content.length}</span>
            {content.length > 1500 && (
              <span className="text-red-500">
                Máximo recomendado: 1500 caracteres
              </span>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Opciones y botón de envío */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Checkbox para comentario interno (solo agentes+) */}
            {canCreateInternalComments() && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="flex items-center space-x-1 text-sm text-gray-700">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span>Comentario interno</span>
                </div>
              </label>
            )}

            {/* Info sobre comentario interno */}
            {isInternal && (
              <span className="text-xs text-orange-600">
                Solo visible para agentes y administradores
              </span>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Comentario
              </>
            )}
          </button>
        </div>
      </form>

      {/* Información sobre tipos de comentarios */}
      {canCreateInternalComments() && (
        <div className="pt-3 mt-3 text-xs text-gray-500 border-t border-gray-200">
          <p>
            <strong>Comentarios normales:</strong> Visibles para todos los
            involucrados en el ticket.
          </p>
          <p>
            <strong>Comentarios internos:</strong> Solo visibles para agentes,
            supervisores y administradores.
          </p>
        </div>
      )}
    </div>
  );
};

export default AddComment;
