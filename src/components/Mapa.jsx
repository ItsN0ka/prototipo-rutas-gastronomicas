import { imagenParada } from "../data/imagenes";
import FiltroParadas from "./FiltroParadas";
import { categorias } from "../services/paradas";
import { useEffect, useRef } from "react";
export default function Mapa({ places, zone, destination, route, focus, paradas, paradasEstado, categoriasActivas, onToggleCategoria }) {
  const container = useRef(null),
    map = useRef(null),
    layer = useRef(null),
    routeLayer = useRef(null),
    paradasLayer = useRef(null);
  useEffect(() => {
    if (!window.L) return;
    const L = window.L;
    map.current = L.map(container.current).setView([-18.38, -69.92], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map.current);
    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    if (!map.current) return;
    const L = window.L;
    if (layer.current) layer.current.remove();
    layer.current = L.layerGroup().addTo(map.current);
    places
      .filter((p) => p.zone === zone || p.id === "arica")
      .forEach((p) =>
        L.circleMarker([p.lat, p.lng], {
          radius: 7,
          color: "white",
          weight: 3,
          fillColor: p.id === destination ? "#d95e3b" : "#658e73",
          fillOpacity: 1,
        })
          .addTo(layer.current)
          .bindPopup(
            `<b>${p.name}</b><br>${p.desc}<br><small>Ubicación referencial</small>`,
          ),
      );
  }, [places, zone, destination]);
  useEffect(() => {
    if (!map.current) return;
    if (routeLayer.current) routeLayer.current.remove();
    if (route) {
      routeLayer.current = window.L.geoJSON(route.geometry, {
        style: { color: "#1d745b", weight: 5 },
      }).addTo(map.current);
      map.current.fitBounds(routeLayer.current.getBounds(), {
        padding: [45, 45],
      });
    }
  }, [route]);
  useEffect(() => {
    if (!map.current) return;
    const L = window.L;
    if (paradasLayer.current) paradasLayer.current.remove();
    paradasLayer.current = L.layerGroup().addTo(map.current);
    paradas.filter(p => categoriasActivas.includes(p.category)).forEach(p => {
      const category = categorias.find(c => c.id === p.category);
      const icon = L.divIcon({className: 'parada-icono', html: `<span>${category.icono}</span>`, iconSize:[32,32], iconAnchor:[16,16]});
      const content = document.createElement('div');
      const photo = document.createElement('img'); photo.src = imagenParada(p); photo.alt = `Imagen ilustrativa de ${p.zone}`; photo.className = 'popup-imagen'; content.append(photo);
      const title = document.createElement('strong'); title.textContent = p.name; content.append(title);
      const detail = document.createElement('p'); detail.textContent = `${category.nombre} · ${p.zone}`; content.append(detail);
      const description = document.createElement('p'); description.textContent = p.desc; content.append(description);
      const specialty = document.createElement('p'); specialty.textContent = `Destacado: ${p.specialty}`; content.append(specialty);
      const hours = document.createElement('p'); hours.textContent = p.hours; content.append(hours);
      const disclaimer = document.createElement('small'); disclaimer.textContent = 'Lugar ficticio de demostración. Ubicación y datos referenciales.'; content.append(disclaimer);
      L.marker([p.lat,p.lng],{icon}).addTo(paradasLayer.current).bindPopup(content);
    });
  }, [paradas, categoriasActivas]);
  useEffect(() => {
    if (map.current && focus) {
      map.current.setView([focus.lat, focus.lng], 12);
      const photo = imagenParada(focus);
      window.L.popup()
        .setLatLng([focus.lat, focus.lng])
        .setContent(`<img class="popup-imagen" src="${photo}" alt="Imagen ilustrativa"><b>${focus.name}</b><p>${focus.desc}</p><small>Lugar ficticio de demostración.</small>`)
        .openOn(map.current);
    }
  }, [focus]);
  return (
    <div className="map-panel">
      <div className="map-top">
        <div>
          <span className="step">02 / DESCUBRE</span>
          <h2>Tu viaje en el mapa</h2>
        </div>
        <div className="map-key">
          <i /> Zonas locales <span /> Tu ruta
        </div>
      </div>
      <div className="map-area">
        <div id="map" ref={container} />
        <div className="map-overlay">
          <span>✳</span>
          <div>
            <b>Un territorio por descubrir</b>
            <small>Selecciona un marcador para explorar</small>
          </div>
        </div>
        {!window.L && (
          <div id="map-error">
            El mapa no pudo cargarse. Revisa tu conexión.
          </div>
        )}
      </div>
      <FiltroParadas activas={categoriasActivas} onToggle={onToggleCategoria} status={paradasEstado} count={paradas.filter(p => categoriasActivas.includes(p.category)).length} />
      <div className="map-foot">
        <span>✦ &nbsp; COSTA / VALLES / INTERIOR</span>
        <span>ARICA Y PARINACOTA, CHILE</span>
      </div>
    </div>
  );
}
