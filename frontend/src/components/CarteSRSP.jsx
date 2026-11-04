import { useState } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Tooltip, useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, ExternalLink, Maximize2, Minimize2, Building2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import "../styles/carte-srsp.css";

const POSITION = [-20.5299, 47.2439];
const NOM = "SRSP AMBOHIBARY";
const NOM_COURT = "Ambohibary, Ambositra";
const REGION = "Amoron'i Mania";

function createIcon() {
  return L.divIcon({
    className: "srsp-pin",
    html: `
      <div class="srsp-pin-body">
        <span class="srsp-pin-pulse"></span>
        <span class="srsp-pin-core">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white"
               stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </span>
      </div>`,
    iconSize: [46, 58],
    iconAnchor: [23, 54],
    popupAnchor: [0, -52],
  });
}

function DarkModeLayer() {
  const map = useMap();
  const { isDarkMode } = useTheme();
  const el = map.getContainer();
  if (isDarkMode) {
    el.classList.add("srsp-dark-map");
  } else {
    el.classList.remove("srsp-dark-map");
  }
  return null;
}

export default function CarteSRSP() {
  const [pleinEcran, setPleinEcran] = useState(false);

  const coordsGoogle = `${POSITION[0]},${POSITION[1]}`;
  const urlItineraire = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${NOM}, ${REGION}`)}&ll=${coordsGoogle}`;
  const urlGoogle = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${NOM}, ${NOM_COURT}`)}&ll=${coordsGoogle}`;

  return (
    <div className={`carte-srsp rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white transition-all ${pleinEcran ? "carte-srsp-fullscreen" : ""}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <MapPin size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 leading-tight">Localisation SRSP</h3>
            <p className="text-xs text-gray-500 truncate">{NOM_COURT} · {REGION}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <a
            href={urlGoogle}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Ouvrir dans Google Maps"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={() => setPleinEcran(!pleinEcran)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title={pleinEcran ? "Réduire" : "Plein écran"}
          >
            {pleinEcran ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Carte */}
      <div className={`relative ${pleinEcran ? "carte-srsp-body-fullscreen" : "h-64"}`}>
        <MapContainer
          key={pleinEcran ? "full" : "normal"}
          center={POSITION}
          zoom={14}
          scrollWheelZoom
          className="carte-srsp-map"
        >
          <DarkModeLayer />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={POSITION} icon={createIcon()}>
            <Tooltip permanent direction="top" offset={[0, -60]} className="srsp-tooltip">
              {NOM}
            </Tooltip>
            <Popup>
              <div className="srsp-popup">
                <div className="srsp-popup-title">
                  <Building2 size={14} />
                  {NOM}
                </div>
                <p className="srsp-popup-text">
                  Service régional de la solde et des personnels<br />{NOM_COURT}, {REGION}
                </p>
                <a
                  href={urlItineraire}
                  target="_blank"
                  rel="noreferrer"
                  className="srsp-popup-btn"
                >
                  <Navigation size={13} />
                  Itinéraire
                </a>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Actions bas de carte */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2">
          <button
            onClick={() => window.open(urlGoogle, "_blank")}
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-gray-200 transition-colors"
          >
            <ExternalLink size={13} />
            Google Maps
          </button>
          <a
            href={urlItineraire}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-colors"
          >
            <Navigation size={13} />
            Itinéraire
          </a>
        </div>
      </div>

      {!pleinEcran && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/40">
          <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
            <MapPin size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            Double-cliquez pour zoomer · molette pour naviguer
          </p>
        </div>
      )}
    </div>
  );
}