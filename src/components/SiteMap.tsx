import { useEffect, useRef } from "react";
import L from "leaflet";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color?: string; // hex
  onClick?: () => void;
}

interface Props {
  pins: MapPin[];
  height?: number;
  center?: [number, number];
  zoom?: number;
}

// Sierra Leone center default
const DEFAULT_CENTER: [number, number] = [8.46, -11.78];

export function SiteMap({ pins, height = 420, center = DEFAULT_CENTER, zoom = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layers: L.Layer[] = [];
    pins.forEach((p) => {
      const color = p.color ?? "#2f6d4f";
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${color};width:18px;height:18px;border:2px solid white;border-radius:50%;box-shadow:0 0 0 2px ${color}66, 0 2px 6px rgba(0,0,0,.3)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const m = L.marker([p.lat, p.lng], { icon }).addTo(map).bindTooltip(p.label, { direction: "top", offset: [0, -10] });
      if (p.onClick) m.on("click", p.onClick);
      layers.push(m);
    });
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]));
      if (pins.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
    return () => { layers.forEach((l) => map.removeLayer(l)); };
  }, [pins]);

  return <div ref={ref} style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }} />;
}
