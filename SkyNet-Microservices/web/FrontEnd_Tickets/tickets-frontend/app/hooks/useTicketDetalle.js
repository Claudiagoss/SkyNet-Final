import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { obtenerTicketPorId } from "../api/ticketsApi";
import { obtenerComentarios, crearComentario } from "../api/comentariosApi";

export function useTicketDetalle(ticketId) {
  const { data: ticket, isLoading: loadingTicket } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => obtenerTicketPorId(ticketId),
    enabled: !!ticketId,
  });

  const { data: comentarios = [], isLoading: loadingComentarios } = useQuery({
    queryKey: ["comentarios", ticketId],
    queryFn: () => obtenerComentarios(ticketId),
    enabled: !!ticketId,
  });

  return { ticket, comentarios, loadingTicket, loadingComentarios };
}

export function useCrearComentario(ticketId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => crearComentario(ticketId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comentarios", ticketId] });
    }
  });
}
