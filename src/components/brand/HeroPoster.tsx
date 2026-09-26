/**
 * Art-directed still of the loom — shown before WebGL wakes, and instead of it for
 * reduced-motion or no-WebGL visitors. Warp threads, a sindoor drape with a zari
 * border and jaal, and a slow CSS drift so it is never quite static.
 */
export function HeroPoster({ className }: { className?: string }) {
  const warps = Array.from({ length: 26 }, (_, i) => 20 + i * 38)
  return (
    <svg className={`hero-poster ${className ?? ''}`} viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hp-cloth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8e2616" />
          <stop offset="0.45" stopColor="#b3361f" />
          <stop offset="1" stopColor="#4a120a" />
        </linearGradient>
        <linearGradient id="hp-fold" x1="0" x2="1">
          {Array.from({ length: 9 }).map((_, i) => (
            <stop key={i} offset={i / 8} stopColor="#000" stopOpacity={i % 2 ? 0.28 : 0} />
          ))}
        </linearGradient>
        <pattern id="hp-jaal" width="46" height="58" patternUnits="userSpaceOnUse">
          <path d="M0 29 C8 16 16 10 23 0 C30 10 38 16 46 29 C38 42 30 48 23 58 C16 48 8 42 0 29Z" fill="none" stroke="#d9b777" strokeWidth="0.9" opacity="0.55" />
          <circle cx="23" cy="29" r="1.6" fill="#d9b777" opacity="0.8" />
        </pattern>
        <radialGradient id="hp-glow" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#dcc28e" stopOpacity="0.16" />
          <stop offset="1" stopColor="#dcc28e" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hp-drape">
          <path d="M150 90 H850 C846 250 872 420 900 560 C780 610 640 586 500 606 C360 586 220 612 100 560 C128 420 154 250 150 90Z" />
        </clipPath>
      </defs>
      <rect width="1000" height="700" fill="#15110f" />
      <rect width="1000" height="700" fill="url(#hp-glow)" />
      <g className="hp-warp-back">{warps.filter((_, i) => i % 2 === 0).map((x) => <line key={x} x1={x} y1="0" x2={x} y2="700" stroke="#dcc28e" strokeOpacity="0.22" strokeWidth="1" />)}</g>
      <g className="hp-cloth">
        <g clipPath="url(#hp-drape)">
          <rect x="80" y="80" width="840" height="560" fill="url(#hp-cloth)" />
          <rect x="80" y="80" width="840" height="560" fill="url(#hp-jaal)" />
          <rect x="80" y="80" width="840" height="560" fill="url(#hp-fold)" />
          <path d="M100 520 C220 572 360 548 500 566 C640 548 780 572 900 520 V620 H100Z" fill="#c9a660" opacity="0.9" />
          <path d="M100 506 C220 558 360 534 500 552 C640 534 780 558 900 506" fill="none" stroke="#e8d3a2" strokeWidth="2" />
          <path d="M100 494 C220 546 360 522 500 540 C640 522 780 546 900 494" fill="none" stroke="#e8d3a2" strokeWidth="1" />
        </g>
        <line x1="130" y1="90" x2="870" y2="90" stroke="#dcc28e" strokeWidth="3" />
      </g>
      <g className="hp-warp-front">{warps.filter((_, i) => i % 2 === 1).map((x) => <line key={x} x1={x} y1="0" x2={x} y2="700" stroke="#dcc28e" strokeOpacity="0.32" strokeWidth="1" />)}</g>
    </svg>
  )
}
