export default function CommentList({ comentarios }) {
  if (!comentarios?.length) return <p style={{color:"#666"}}>Sin comentarios aún.</p>;
  return (
    <ul style={{display:"grid", gap:8}}>
      {comentarios.map(c => (
        <li key={c.comentarioId} style={{border:"1px solid #ddd", padding:"8px", borderRadius:8}}>
          <div style={{fontSize:12, color:"#666"}}>
            #{c.comentarioId} • {c.esInterno ? "Interno" : "Público"} • {c.creadoEl ? new Date(c.creadoEl).toLocaleString() : ""}
          </div>
          <div>{c.texto}</div>
        </li>
      ))}
    </ul>
  );
}
