export function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 500 400"
        className="w-full max-w-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pathGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>
            {`
              @keyframes dashMove {
                to { stroke-dashoffset: -100; }
              }
              @keyframes pulse-dot {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
              }
              @keyframes float-up {
                0%, 100% { transform: translateY(0); opacity: 0.6; }
                50% { transform: translateY(-8px); opacity: 1; }
              }
              .path-anim {
                stroke-dasharray: 6 4;
                animation: dashMove 2s linear infinite;
              }
              .pulse {
                animation: pulse-dot 2s ease-in-out infinite;
                transform-origin: center;
              }
              .float {
                animation: float-up 3s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* Simplified world map outline */}
        <g stroke="white" strokeOpacity="0.15" strokeWidth="1.5" fill="none">
          {/* North America */}
          <path d="M80 100 Q90 85 110 85 Q130 85 140 95 Q150 105 145 120 Q140 135 130 140 Q120 145 110 140 Q100 135 95 125 Q85 115 80 100Z" />
          {/* South America */}
          <path d="M120 180 Q130 175 135 185 Q140 200 135 220 Q130 235 120 240 Q110 235 105 220 Q100 205 105 195 Q110 185 120 180Z" />
          {/* Europe */}
          <path d="M210 90 Q220 85 235 85 Q250 85 255 95 Q260 105 255 115 Q250 120 240 120 Q230 120 220 115 Q210 105 210 90Z" />
          {/* Africa */}
          <path d="M225 140 Q235 135 245 140 Q255 150 255 165 Q255 180 245 190 Q235 195 225 190 Q215 180 215 165 Q215 150 225 140Z" />
          {/* Asia */}
          <path d="M280 85 Q300 75 330 75 Q360 75 380 85 Q400 95 405 110 Q410 125 400 130 Q390 135 370 130 Q350 125 330 125 Q310 125 290 120 Q275 110 280 85Z" />
          {/* Australia */}
          <path d="M350 200 Q365 195 380 200 Q390 210 385 220 Q375 230 360 225 Q345 215 350 200Z" />
        </g>

        {/* Grid dots for "connected world" feel */}
        <g fill="white" fillOpacity="0.05">
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 12 }).map((_, col) => (
              <circle key={`d-${row}-${col}`} cx={40 + col * 38} cy={30 + row * 45} r="1.5" />
            ))
          )}
        </g>

        {/* Connection paths (Teal dashed lines) */}
        <g stroke="#00D4AA" strokeWidth="2" filter="url(#glow)">
          {/* NA → EU */}
          <path className="path-anim" d="M130 110 Q180 80 230 100" />
          {/* NA → SA */}
          <path className="path-anim" d="M120 140 Q125 160 125 180" />
          {/* EU → AF */}
          <path className="path-anim" d="M240 120 Q240 130 235 140" />
          {/* EU → AS */}
          <path className="path-anim" d="M260 100 Q280 90 300 90" />
          {/* NA → AS */}
          <path className="path-anim" d="M140 105 Q220 60 310 90" />
          {/* AS → AU */}
          <path className="path-anim" d="M340 130 Q360 170 370 200" />
        </g>

        {/* Pulsing origin/destination dots */}
        <g fill="#00D4AA" filter="url(#glow)">
          <circle className="pulse" cx="130" cy="110" r="5" style={{ animationDelay: "0s" }} />
          <circle className="pulse" cx="230" cy="100" r="4" style={{ animationDelay: "0.5s" }} />
          <circle className="pulse" cx="125" cy="180" r="4" style={{ animationDelay: "1s" }} />
          <circle className="pulse" cx="235" cy="140" r="4" style={{ animationDelay: "0.3s" }} />
          <circle className="pulse" cx="300" cy="90" r="5" style={{ animationDelay: "0.7s" }} />
          <circle className="pulse" cx="370" cy="200" r="4" style={{ animationDelay: "1.2s" }} />
        </g>

        {/* Floating currency symbols */}
        <g fill="#00D4AA" fillOpacity="0.6" className="float" style={{ animationDelay: "0s" }}>
          <text x="160" y="85" fontSize="14" fontWeight="bold" fontFamily="sans-serif">$</text>
        </g>
        <g fill="#00D4AA" fillOpacity="0.6" className="float" style={{ animationDelay: "1s" }}>
          <text x="270" y="110" fontSize="12" fontWeight="bold" fontFamily="sans-serif">€</text>
        </g>
        <g fill="#00D4AA" fillOpacity="0.6" className="float" style={{ animationDelay: "0.5s" }}>
          <text x="340" y="100" fontSize="12" fontWeight="bold" fontFamily="sans-serif">£</text>
        </g>
        <g fill="#00D4AA" fillOpacity="0.6" className="float" style={{ animationDelay: "1.5s" }}>
          <text x="180" y="165" fontSize="11" fontWeight="bold" fontFamily="sans-serif">¥</text>
        </g>

        {/* Central globe glow */}
        <circle cx="250" cy="180" r="80" fill="url(#pathGlow)" opacity="0.3" />
      </svg>
    </div>
  );
}
