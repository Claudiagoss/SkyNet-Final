// ✅ app/hooks/useUsuarios.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { obtenerUsuarios, crearUsuario } from "../api/usuariosApi";

export function useUsuarios() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["usuarios"],
    queryFn: obtenerUsuarios,
  });
  return { usuarios: data ?? [], isLoading, isError };
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}
