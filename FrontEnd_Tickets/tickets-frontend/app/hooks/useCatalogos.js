// app/hooks/useCatalogos.js
import { useQuery } from "@tanstack/react-query";
import { obtenerEstados, obtenerPrioridades } from "../api/catalogosApi";

export function useEstados() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["estados"],
    queryFn: obtenerEstados,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const estados = Array.isArray(data) ? data : [];
  return { estados, isLoading, isError, error };
}

export function usePrioridades() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["prioridades"],
    queryFn: obtenerPrioridades,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const prioridades = Array.isArray(data) ? data : [];
  return { prioridades, isLoading, isError, error };
}
