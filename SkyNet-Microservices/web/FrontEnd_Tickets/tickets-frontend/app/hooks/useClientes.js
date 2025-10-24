import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { obtenerClientes, crearCliente } from "../api/clientesApi";

export function useClientes() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["clientes"], queryFn: obtenerClientes });
  return { clientes: data ?? [], isLoading, isError };
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crearCliente,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}
