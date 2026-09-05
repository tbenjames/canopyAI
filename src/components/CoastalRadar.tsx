// Stylized coastal grid placeholder showing plot coordinates relative to a
// schematic shoreline. Not a real geographic projection, purely illustrative.
export function CoastalRadar({ points }: { points: { lat: number; lng: number; risk?: "low" | "medium" | "high" | null }[] }) {
  const w = 600, h = 280;
  // Project lat/lng into the box by simple normalization
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats, 8.0), maxLat = Math.max(...lats, 9.0);
  const minLng = Math.min(...lngs, -13.5), maxLng = Math.max(...lngs, -12.8);
  const rangeLat = maxLat - minLat || 1;
  const rangeLng = maxLng - minLng || 1;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto rounded-xl border bg-card" style={{ borderColor: "#E2E8F0" }}>
      <defs>
        <linearGradient id="ocean" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#cfe6ee" />
          <stop offset="100%" stopColor="#9ec7d3" />
        </linearGradient>
        <linearGradient id="land" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#eef2ec" />
          <stop offset="100%" stopColor="#d8e0d3" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#ocean)" />
      <path d={`M0,${h * 0.6} C${w * 0.2},${h * 0.45} ${w * 0.4},${h * 0.75} ${w * 0.6},${h * 0.55} S${w},${h * 0.7} ${w},${h * 0.5} L${w},${h} L0,${h} Z`} fill="url(#land)" />
      {/* radar grid */}
      <g stroke="#1A3622" strokeOpacity={0.08}>
        {Array.from({ length: 8 }).map((_, i) => <line key={`v${i}`} x1={(i * w) / 8} y1={0} x2={(i * w) / 8} y2={h} />)}
        {Array.from({ length: 5 }).map((_, i) => <line key={`hl${i}`} x1={0} y1={(i * h) / 5} x2={w} y2={(i * h) / 5} />)}
      </g>
      <text x={12} y={20} fontSize={11} fill="#1A3622" fontWeight={600} fontFamily="Inter,sans-serif">Atlantic fringe · stylized</text>
      <text x={w - 80} y={h - 12} fontSize={11} fill="#1A3622" opacity={0.6} fontFamily="Inter,sans-serif">inland →</text>
      {points.map((p, i) => {
        const x = ((p.lng - minLng) / rangeLng) * (w - 40) + 20;
        const y = h - (((p.lat - minLat) / rangeLat) * (h - 40) + 20);
        const c = p.risk === "high" ? "#c0443b" : p.risk === "medium" ? "#E5A93C" : "#1A3622";
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={c} fillOpacity={0.18} />
            <circle cx={x} cy={y} r={4} fill={c} />
          </g>
        );
      })}
    </svg>
  );
}
