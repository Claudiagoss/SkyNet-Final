import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { obtenerTickets, crearTicket } from "../api/ticketsApi";

export function useTickets() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["tickets"], queryFn: obtenerTickets });
  return { tickets: data ?? [], isLoading, isError };
}

export function useCrearTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crearTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}
