import type { Dictionary } from "@/content/fr";

/**
 * Typical unit in plan view, in feet: 36 ft wide, 35 ft deep, outside wall at the bottom.
 * Numbered markers are legend keys for the list beside the drawing.
 */
export default function UnitDrawing({ d, title }: { d: Dictionary["included"]["drawing"]; title: string }) {
  const ink = "#0f1d1e";
  const steel = "#56666a";
  const teal = "#557a7c";
  const marker = (n: number, x: number, y: number) => (
    <g key={n}>
      <circle cx={x} cy={y} r={1.6} fill="#1d3a3c" />
      <text x={x} y={y + 0.05} textAnchor="middle" dominantBaseline="central" fontSize={1.85} fontWeight={700} fill="#d4f0c9" className="mono">
        {n}
      </text>
    </g>
  );

  return (
    <svg viewBox="-3 -2.5 42.5 46" role="img" aria-label={title} className="block h-auto w-full">
      <defs>
        <pattern id="slab" width="2" height="2" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".09" fill={steel} fillOpacity=".45" />
        </pattern>
      </defs>

      {/* Concrete slab */}
      <rect x={0} y={0} width={36} height={35} fill="url(#slab)" />

      {/* Walls: demising wall at the back, party walls on the sides, outside wall at the front */}
      <g fill={ink}>
        <rect x={-0.5} y={-0.5} width={37} height={0.5} />
        <rect x={-0.5} y={-0.5} width={0.5} height={36.2} />
        <rect x={36} y={-0.5} width={0.5} height={36.2} />
        <rect x={-0.5} y={35} width={4.5} height={0.7} />
        <rect x={7} y={35} width={2.5} height={0.7} />
        <rect x={16.5} y={35} width={5.5} height={0.7} />
        <rect x={32} y={35} width={4.5} height={0.7} />
        {/* Washroom partitions */}
        <rect x={0} y={8} width={4} height={0.3} />
        <rect x={6.5} y={8} width={1.3} height={0.3} />
        <rect x={7.5} y={0} width={0.3} height={8.3} />
      </g>

      {/* Front window */}
      <g stroke={ink} strokeWidth={0.1} fill="none">
        <rect x={9.5} y={35} width={7} height={0.7} />
        <line x1={9.5} y1={35.25} x2={16.5} y2={35.25} />
        <line x1={9.5} y1={35.45} x2={16.5} y2={35.45} />
      </g>

      {/* Walk-in door */}
      <line x1={4} y1={35} x2={4} y2={32} stroke={ink} strokeWidth={0.18} />
      <path d="M7 35 A3 3 0 0 0 4 32" fill="none" stroke={steel} strokeWidth={0.1} />

      {/* Overhead garage door: panel in the opening, tracks running into the shop */}
      <rect x={22} y={35.05} width={10} height={0.4} fill="#d4f0c9" stroke={ink} strokeWidth={0.1} />
      <g stroke={teal} strokeWidth={0.12} strokeDasharray=".7 .45" fill="none">
        <path d="M22.25 35V23.5H31.75V35" />
      </g>

      {/* Washroom: toilet, sink, door */}
      <g stroke={ink} strokeWidth={0.1} fill="#fff">
        <rect x={0.6} y={0.4} width={2.4} height={0.85} rx={0.15} />
        <ellipse cx={1.8} cy={2.6} rx={0.85} ry={1.25} />
        <rect x={4.4} y={0.4} width={2.4} height={1.6} rx={0.3} />
        <ellipse cx={5.6} cy={1.2} rx={0.75} ry={0.5} />
      </g>
      <line x1={6.5} y1={8} x2={6.5} y2={5.5} stroke={ink} strokeWidth={0.16} />
      <path d="M4 8 A2.5 2.5 0 0 1 6.5 5.5" fill="none" stroke={steel} strokeWidth={0.1} />

      {/* Water heater */}
      <circle cx={9.7} cy={1.85} r={1.2} fill="#fff" stroke={ink} strokeWidth={0.1} />
      <circle cx={9.7} cy={1.85} r={0.45} fill="none" stroke={ink} strokeWidth={0.08} />

      {/* Electrical panel */}
      <rect x={0.05} y={24} width={0.55} height={3.4} fill={teal} stroke={ink} strokeWidth={0.08} />

      {/* Labels */}
      <text x={20} y={15.5} textAnchor="middle" fontSize={1.35} letterSpacing={0.12} fill={steel} className="mono uppercase">
        {d.open}
      </text>

      {/* Garage door width */}
      <g stroke={steel} strokeWidth={0.08}>
        <line x1={22} y1={36.2} x2={22} y2={40} />
        <line x1={32} y1={36.2} x2={32} y2={40} />
        <line x1={22} y1={39} x2={32} y2={39} />
        <line x1={21.6} y1={39.4} x2={22.4} y2={38.6} />
        <line x1={31.6} y1={39.4} x2={32.4} y2={38.6} />
      </g>
      <text x={27} y={41.9} textAnchor="middle" fontSize={1.3} fill={steel} className="mono">
        {d.width}
      </text>

      {/* Legend keys */}
      {marker(1, 27, 29.3)}
      {marker(2, 5.6, 29.6)}
      {marker(3, 2.9, 25.7)}
      {marker(4, 12.6, 1.9)}
    </svg>
  );
}
