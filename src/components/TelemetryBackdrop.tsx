/** Animated SVG backdrop, flowing telemetry lines + faint plot grid.
 *  Pure CSS animation, respects prefers-reduced-motion. */
export function TelemetryBackdrop({ className = "", intensity = 0.5 }: { className?: string; intensity?: number }) {
  return (
    <div className={`telemetry-backdrop pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        style={{ opacity: intensity }}
      >
        <defs>
          <linearGradient id="telemetry-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <pattern id="telemetry-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#telemetry-grid)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M 0 ${120 + i * 90} Q 300 ${80 + i * 90} 600 ${140 + i * 90} T 1200 ${110 + i * 90}`}
            fill="none"
            stroke="url(#telemetry-line)"
            strokeWidth="1.4"
            className="telemetry-stroke"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <circle
            key={i}
            cx={80 + i * 80}
            cy={300 + Math.sin(i) * 80}
            r="2"
            fill="currentColor"
            className="telemetry-dot"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
