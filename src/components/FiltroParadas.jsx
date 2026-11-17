import { categorias } from '../services/paradas';
export default function FiltroParadas({activas,onToggle,status,count}) {
 return <div className="paradas-control"><strong>PARADAS EN EL CAMINO</strong><div className="paradas-filtros">{categorias.map(c=><button key={c.id} type="button" aria-pressed={activas.includes(c.id)} className={activas.includes(c.id)?'activo':''} onClick={()=>onToggle(c.id)}>{c.icono} {c.nombre}</button>)}</div><p aria-live="polite">{status}{count!=null&&` · ${count} visibles`}</p><small>Ejemplos ficticios en la zona elegida. Sus ubicaciones son referenciales y pueden requerir desvíos.</small></div>
}
