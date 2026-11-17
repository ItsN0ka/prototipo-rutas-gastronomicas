import { useState } from "react";
import { categorias } from "./services/paradas";
import { paradasDemo } from "./data/paradasDemo";
import Planificador from "./components/Planificador";
import Mapa from "./components/Mapa";
import ZonasCercanas from "./components/ZonasCercanas";
import { places } from "./data/places";
import { calcularRuta, zonasCercanas, duracion } from "./services/rutas";
import "./style.css";
export default function App() {
  const [zone, setZoneState] = useState("Costa"),
    [origin, setOrigin] = useState("arica"),
    [destination, setDestination] = useState("chinchorro"),
    [route, setRoute] = useState(null),
    [status, setStatus] = useState(
      "Elige tu destino y genera una ruta para comenzar.",
    ),
    [focus, setFocus] = useState(null),
    [near, setNear] = useState(
      places.filter((p) =>
        ["chinchorro", "azapa", "poconchile", "putre"].includes(p.id),
      ),
    ),
    [caption, setCaption] = useState(
      "Genera una ruta para ver las zonas cercanas a tu recorrido.",
    );
  const paradas = paradasDemo.filter(p => p.zone === zone);
  const paradasEstado = "Paradas de demostración en la zona seleccionada";
  const [categoriasActivas, setCategoriasActivas] = useState(categorias.map(c => c.id));
  function limpiarRuta() {
    setRoute(null);
    setStatus("Elige tu destino y genera una ruta para comenzar.");
  }
  function cambiarOrigen(id) { setOrigin(id); limpiarRuta(); }
  function cambiarDestino(id) { setDestination(id); limpiarRuta(); }
  function setZone(z) {
    setZoneState(z);
    setDestination(places.find((p) => p.zone === z && p.id !== "arica" && p.id !== origin)?.id ?? "");
    limpiarRuta();
  }
  async function generar() {
    setRoute(null);
    setStatus("Buscando el recorrido por carretera…");
    setNear([]);
    setCaption("Genera una ruta para ver las zonas cercanas a tu recorrido.");
    try {
      let start = places.find((p) => p.id === origin),
        end = places.find((p) => p.id === destination);
      if (origin === "geo") {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation
            ? navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 12000,
              })
            : reject(new Error("Ubicación no disponible.")),
        );
        start = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          id: "geo",
          name: "Tu ubicación",
        };
      }
      if (!start || !end || start.id === end.id)
        throw new Error("Elige un origen y destino distintos.");
      const r = await calcularRuta(start, end);
      setRoute({ ...r, time: duracion(r.duration) });
      setStatus(`${start.name} → ${end.name}`);
      setNear(zonasCercanas(places, r.geometry.coordinates, start.id, end.id));
      setCaption(
        `Zonas de muestra a aproximadamente 8 km o menos del trazado entre ${start.name} y ${end.name}. Pueden requerir un desvío.`,
      );
    } catch (e) {
      setStatus(
        e.code === 1
          ? "No se autorizó la ubicación."
          : e.message || "No se pudo calcular la ruta. Revisa la conexión.",
      );
    }
  }
  return (
    <>
      <header>
        <a className="brand" href="#">
          <span className="brandicon">✳</span>
          <span>
            <b>Sabores del Norte</b>
            <small>ARICA Y PARINACOTA</small>
          </span>
        </a>
        <div className="headright">
          <span>UN VIAJE CON SABOR LOCAL</span>
          <a href="#mapa">Explorar el mapa ↗</a>
        </div>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span /> EXPLORA ARICA Y PARINACOTA
            </div>
            <h1>
              Una ruta, muchos <em>sabores.</em>
            </h1>
            <p>
              Del océano a los Andes, descubre los paisajes y productos que
              hacen única nuestra región.
            </p>
          </div>
          <div className="intro-note">
            <strong>01 — ELIGE TU CAMINO</strong>
            <p>Una región, muchas maneras de recorrerla.</p>
            <span>↓</span>
          </div>
        </section>
        <section className="workspace" id="mapa">
          <Planificador
            {...{
              zone,
              setZone,
              origin,
              setOrigin: cambiarOrigen,
              destination,
              setDestination: cambiarDestino,
              places,
              status,
              route,
            }}
            onGenerate={generar}
          />
          <Mapa {...{ places, zone, destination, route, focus, paradas, paradasEstado, categoriasActivas }} onToggleCategoria={id => setCategoriasActivas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} />
        </section>
        <ZonasCercanas
          places={paradas}
          zone={zone}
          onSelect={(p) => {
            setFocus(p);
            document
              .getElementById("mapa")
              .scrollIntoView({ behavior: "smooth" });
          }}
        />
      </main>
      <footer>
        <b>✳ &nbsp; Sabores del Norte</b>
        <span>Hecho para descubrir Arica y Parinacota.</span>
      </footer>
    </>
  );
}

