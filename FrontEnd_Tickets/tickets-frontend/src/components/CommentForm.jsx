import { useState } from "react";

export default function CommentForm({ onSubmit }) {
  const [texto, setTexto] = useState("");
  const [esInterno, setEsInterno] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const usuarioId = Number(prompt("UsuarioId que comenta:", "1") || 1);
    onSubmit({ texto, esInterno, usuarioId });
    setTexto(""); setEsInterno(false);
  };

  return (
    <form onSubmit={submit} style={{border:"1px solid #ddd", padding:"12px", borderRadius:8}}>
      <textarea style={{border:"1px solid #ddd", padding:"8px", width:"100%"}} rows={3}
        placeholder="Escribe un comentario..." value={texto} onChange={e=>setTexto(e.target.value)} />
      <label style={{display:"flex", gap:8, alignItems:"center", marginTop:8}}>
        <input type="checkbox" checked={esInterno} onChange={e=>setEsInterno(e.target.checked)} />
        <span>Comentario interno</span>
      </label>
      <button style={{marginTop:8, background:"#000", color:"#fff", padding:"6px 10px", borderRadius:6}}>Agregar</button>
    </form>
  );
}
