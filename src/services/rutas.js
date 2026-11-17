export async function calcularRuta(start, end) {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
  );
  if (!response.ok) throw new Error("El servicio de rutas no respondió.");
  const data = await response.json();
  if (data.code !== "Ok" || !data.routes?.length)
    throw new Error("No se encontró una ruta por carretera.");
  return data.routes[0];
}
export function zonasCercanas(places, coordinates, start, end) {
  return places
    .filter((p) => p.id !== start && p.id !== end)
    .map((p) => ({
      p,
      d: Math.min(
        ...coordinates
          .filter(
            (_, i) =>
              i % Math.max(1, Math.floor(coordinates.length / 500)) === 0,
          )
          .map(([lng, lat]) =>
            Math.hypot(
              (p.lat - lat) * 111.2,
              (p.lng - lng) * 111.2 * Math.cos((p.lat * Math.PI) / 180),
            ),
          ),
      ),
    }))
    .filter((x) => x.d <= 8)
    .sort((a, b) => a.d - b.d)
    .map((x) => x.p);
}
export function duracion(seconds) {
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
}
