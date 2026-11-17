export const categorias = [
  { id: 'restaurante', nombre: 'Restaurantes', icono: '🍽️' },
  { id: 'mercado', nombre: 'Mercados', icono: '🧺' },
  { id: 'caleta', nombre: 'Caletas', icono: '🐟' },
  { id: 'mirador', nombre: 'Miradores', icono: '🔭' },
  { id: 'patrimonio', nombre: 'Patrimonio', icono: '🏛️' },
];
function distanciaRuta(p, coords) {
  const k = Math.cos(p.lat * Math.PI / 180);
  let min = Infinity;
  for (let i = 1; i < coords.length; i++) {
    const a = [(coords[i-1][0]-p.lng)*k*111.2,(coords[i-1][1]-p.lat)*111.2];
    const b = [(coords[i][0]-p.lng)*k*111.2,(coords[i][1]-p.lat)*111.2];
    const dx=b[0]-a[0], dy=b[1]-a[1], den=dx*dx+dy*dy;
    const t=den ? Math.max(0,Math.min(1,-(a[0]*dx+a[1]*dy)/den)) : 0;
    min=Math.min(min,Math.hypot(a[0]+t*dx,a[1]+t*dy));
  }
  return min;
}
function tipo(tags) {
  if (['restaurant','fast_food','cafe','food_court'].includes(tags.amenity)) return 'restaurante';
  if (tags.amenity==='marketplace' || tags.shop==='supermarket' || ['greengrocer','convenience','seafood'].includes(tags.shop)) return 'mercado';
  if (tags.tourism==='viewpoint') return 'mirador';
  if (tags.harbour==='fishery' || tags.landuse==='port' && /caleta/i.test(tags.name||'')) return 'caleta';
  if (tags.historic || tags.tourism==='museum') return 'patrimonio';
  return null;
}
// Reduce the geometry without leaving large gaps between searches.
function simplificar(coords, toleranceKm = 0.15) {
  if (coords.length <= 2) return coords;
  const keep = new Uint8Array(coords.length); keep[0] = keep[coords.length - 1] = 1;
  const stack = [[0, coords.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let max = 0, index = -1;
    for (let i = a + 1; i < b; i++) {
      const d = distanciaRuta({lat:coords[i][1],lng:coords[i][0]}, [coords[a],coords[b]]);
      if (d > max) { max = d; index = i; }
    }
    if (max > toleranceKm) { keep[index] = 1; stack.push([a,index],[index,b]); }
  }
  return coords.filter((_, i) => keep[i]);
}
async function consultar(query, signal) {
  const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  for (const endpoint of endpoints) {
    if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 18000);
    const cancel = () => timeout.abort(); signal?.addEventListener('abort', cancel, {once:true});
    try {
      const response = await fetch(endpoint, {method:'POST', body:new URLSearchParams({data:query}), signal:timeout.signal});
      if (!response.ok) throw new Error(`Servicio no disponible (${response.status})`);
      const data = await response.json();
      if (data.remark || !Array.isArray(data.elements)) throw new Error('La consulta no pudo completarse.');
      return data.elements;
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
  }
  throw new Error('Los servicios de OpenStreetMap no respondieron. Intenta nuevamente.');
}
export async function buscarParadas(coords, signal) {
  if (!coords || coords.length < 2) throw new Error('La ruta no tiene geometría válida.');
  const puntos = simplificar(coords);
  const selectors=['["amenity"~"^(restaurant|fast_food|cafe|food_court|marketplace)$"]','["shop"~"^(supermarket|greengrocer|convenience|seafood)$"]','["tourism"~"^(viewpoint|museum)$"]','["historic"]','["harbour"="fishery"]','["landuse"="port"]["name"~"caleta",i]'];
  const chunks=[];
  for (let i=0; i<puntos.length-1; i+=79) chunks.push(puntos.slice(i, i+80));
  const elements=[];
  for (const chunk of chunks) {
    const line=chunk.map(([lon,lat])=>`${lat},${lon}`).join(',');
    const clauses=selectors.map(selector=>`nwr(around:3000,${line})${selector};`).join('');
    elements.push(...await consultar(`[out:json][timeout:35];(${clauses});out center tags;`,signal));
  }
  const seen=new Set();
  return elements.map(e=>{const tags=e.tags||{}, category=tipo(tags), lat=e.lat??e.center?.lat, lng=e.lon??e.center?.lon;return {id:`${e.type}/${e.id}`,name:tags.name || categorias.find(c=>c.id===category)?.nombre.replace(/s$/,'') || 'Lugar sin nombre',category,lat,lng,address:tags['addr:street']?[tags['addr:street'],tags['addr:housenumber']].filter(Boolean).join(' '):'',hours:tags.opening_hours||'',website:tags.website||'',source:`https://www.openstreetmap.org/${e.type}/${e.id}`}}).filter(p=>p.category && Number.isFinite(p.lat) && Number.isFinite(p.lng) && !seen.has(p.id) && seen.add(p.id)).map(p=>({...p,distance:distanciaRuta(p,coords)})).filter(p=>p.distance<=3).sort((a,b)=>a.distance-b.distance).slice(0,150);
}
