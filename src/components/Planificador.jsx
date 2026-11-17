export default function Planificador({
  zone,
  setZone,
  origin,
  setOrigin,
  destination,
  setDestination,
  places,
  onGenerate,
  status,
  route,
}) {
  const options = places.filter((p) => p.zone === zone && p.id !== "arica");
  const selected = places.find((p) => p.id === destination);
  return (
    <aside>
      <div className="aside-heading">
        <span className="step">01 / PLANIFICA</span>
        <h2>Diseña tu viaje</h2>
        <p>Elige una zona y un destino para descubrir el camino.</p>
      </div>
      <label className="label">¿QUÉ ZONA QUIERES EXPLORAR?</label>
      <div className="zones">
        {[
          ["Costa", "", "Mar y sabores"],
          ["Valle", "", "Tierra fértil"],
          ["Interior", "", "Ruta andina"],
        ].map(([z, icon, detail]) => (
          <button
            key={z}
            className={"zone " + (zone === z ? "active" : "")}
            onClick={() => setZone(z)}
          >
            <span>{icon}</span>
            <b>{z}</b>
            <small>{detail}</small>
          </button>
        ))}
      </div>
      <div className="route-selector" aria-label="Selecciona tu recorrido">
        <div className="route-selector-heading"><span>✦ TU RECORRIDO</span><small>EN AUTO</small></div>
        <div className="route-fields">
          <div className="route-field route-field-origin">
            <span className="route-field-icon" aria-hidden="true">◉</span>
            <div className="route-field-content"><label htmlFor="origin">PUNTO DE PARTIDA</label>
              <select id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                <option value="arica">Centro de Arica</option>
                <option value="geo">Mi ubicación actual</option>
                {["azapa", "poconchile", "putre"].map((id) => <option key={id} value={id} disabled={id === destination}>{places.find((p) => p.id === id).name}</option>)}
              </select>
            </div><span className="route-field-chevron" aria-hidden="true">⌄</span>
          </div>
          <div className="route-field route-field-destination">
            <span className="route-field-icon" aria-hidden="true">●</span>
            <div className="route-field-content"><label htmlFor="destination">DESTINO</label>
              <select id="destination" value={destination} onChange={(e) => setDestination(e.target.value)}>
                {options.map((p) => <option key={p.id} value={p.id} disabled={p.id === origin}>{p.name}</option>)}
              </select>
            </div><span className="route-field-chevron" aria-hidden="true">⌄</span>
          </div>
        </div>
      </div>
      <p className="destination-info">{selected?.desc}</p>
      <button className="generate" onClick={onGenerate}>
        Generar mi ruta <span>↗</span>
      </button>
      <p className="note">Recorrido en auto · tiempos aproximados</p>
      <div className="route-result" aria-live="polite">
        <div className="result-top">
          {route ? "TU RECORRIDO EN AUTO" : "TU RECORRIDO"}
        </div>
        <p>{status}</p>
        {route && (
          <div className="metrics">
            <div>
              <strong>{route.time}</strong>
              <small>tiempo estimado</small>
            </div>
            <div>
              <strong>{(route.distance / 1000).toFixed(1)} km</strong>
              <small>distancia</small>
            </div>
          </div>
        )}
        {route && <p>Sin tráfico en tiempo real ni tiempo de paradas.</p>}
      </div>
    </aside>
  );
}
