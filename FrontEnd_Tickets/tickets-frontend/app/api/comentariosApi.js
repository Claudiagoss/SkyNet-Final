import api from "../config/axios";

export async function crearComentario(ticketId, payload) {
  const { data } = await api.post(`/tickets/${ticketId}/comentarios`, payload);
  return data;
}

export async function obtenerComentarios(ticketId) {
  const { data } = await api.get(`/tickets/${ticketId}/comentarios`);
  return data;
}
