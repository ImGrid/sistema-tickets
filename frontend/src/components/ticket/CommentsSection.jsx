import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { commentsService } from "../../services/api";
import CommentItem from "./CommentItem";
import AddComment from "./AddComment";
import { MessageSquare, RefreshCw, AlertCircle } from "lucide-react";

const CommentsSection = ({ ticketId, ticketStatus }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Cargar comentarios al montar y cuando cambie el ticketId
  useEffect(() => {
    if (ticketId) {
      loadComments();
    }
  }, [ticketId]);

  // Función para cargar comentarios
  const loadComments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await commentsService.getComments(ticketId);
      setComments(response.comments || []);

      // Solo mostrar toast si hay comentarios y no es la carga inicial
      if (!loading && response.comments && response.comments.length > 0) {
        toast.success(
          `${response.comments.length} comentario${
            response.comments.length > 1 ? "s" : ""
          } cargado${response.comments.length > 1 ? "s" : ""}`
        );
      }
    } catch (error) {
      console.error("Error cargando comentarios:", error);
      const errorMessage = "Error cargando los comentarios";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar comentarios
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await commentsService.getComments(ticketId);
      setComments(response.comments || []);
      toast.success("Comentarios actualizados");
    } catch (error) {
      console.error("Error refrescando comentarios:", error);
      toast.error("Error al actualizar los comentarios");
    } finally {
      setRefreshing(false);
    }
  };

  // Función para agregar nuevo comentario
  const handleCommentAdded = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
    // No agregamos toast aquí porque ya se maneja en AddComment
  };

  // Función para actualizar comentario editado
  const handleCommentUpdated = (updatedComment) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment
      )
    );
    toast.success("Comentario actualizado");
  };

  // Función para eliminar comentario
  const handleCommentDeleted = (deletedCommentId) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment._id !== deletedCommentId)
    );
    toast.success("Comentario eliminado");
  };

  // Verificar si el usuario puede comentar
  const canComment = () => {
    // No se puede comentar en tickets cerrados
    if (ticketStatus === "closed") return false;

    // Todos los usuarios autenticados pueden comentar en sus tickets
    return true;
  };

  // Manejar retry cuando hay error
  const handleRetry = async () => {
    setError("");
    await loadComments();
  };

  return (
    <div className="space-y-6">
      {/* Header de comentarios */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Comentarios y Actividad ({comments.length})
          </h3>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="p-2 text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50"
          title="Actualizar comentarios"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 border-l-4 border-red-400 bg-red-50">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para agregar comentario */}
      {canComment() && (
        <AddComment
          ticketId={ticketId}
          userRole={user.role}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {/* Loading state */}
        {loading && (
          <div className="p-6 text-center">
            <div className="w-6 h-6 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600">
              Cargando comentarios...
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && comments.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No hay comentarios aún</p>
            {canComment() ? (
              <p className="mt-1 text-xs text-gray-400">
                Sé el primero en comentar
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">
                Este ticket está cerrado
              </p>
            )}
          </div>
        )}

        {/* Comments timeline */}
        {!loading && !error && comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUser={user}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
              />
            ))}

            {/* Mensaje informativo al final */}
            {comments.length > 5 && (
              <div className="p-3 text-center border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Se muestran todos los {comments.length} comentarios
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info sobre comentarios internos para agentes */}
      {(user.role === "agent" ||
        user.role === "supervisor" ||
        user.role === "admin") &&
        canComment() && (
          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Puedes crear comentarios internos que
              solo verán otros agentes y administradores.
            </p>
          </div>
        )}

      {/* Info sobre ticket cerrado */}
      {ticketStatus === "closed" && (
        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">
            <strong>ℹ️ Información:</strong> Este ticket está cerrado. No se
            pueden agregar nuevos comentarios.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
