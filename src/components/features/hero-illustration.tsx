export function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 300 300"
        className="w-full max-w-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="ocean" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#143A5C" />
            <stop offset="100%" stopColor="#0A2540" />
          </radialGradient>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>
            {`
              @keyframes hubPulse {
                0%, 100% { r: 4; opacity: 0.7; }
                50% { r: 6; opacity: 1; }
              }
              @keyframes hubPulseSmall {
                0%, 100% { r: 3; opacity: 0.7; }
                50% { r: 5; opacity: 1; }
              }
              @keyframes flowDot {
                0% { stroke-dashoffset: 200; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { stroke-dashoffset: 0; opacity: 0; }
              }
              @keyframes breathe {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
              }
              .hub-large { animation: hubPulse 3s ease-in-out infinite; transform-origin: center; }
              .hub-small { animation: hubPulseSmall 3s ease-in-out infinite; transform-origin: center; }
              .flow-path { stroke-dasharray: 80 120; animation: flowDot 3s linear infinite; }
              .flow-path-reverse { stroke-dasharray: 80 120; animation: flowDot 3s linear infinite reverse; }
              .globe-breathe { animation: breathe 6s ease-in-out infinite; transform-origin: center; }
            `}
          </style>
        </defs>

        <g className="globe-breathe">
          {/* Ocean base */}
          <circle cx="150" cy="150" r="130" fill="url(#ocean)" stroke="#00D4AA" strokeWidth="0.5" strokeOpacity="0.15" />

        {/* Faint latitude rings */}
        <g stroke="#00D4AA" strokeWidth="0.4" strokeOpacity="0.08" fill="none">
          <ellipse cx="150" cy="150" rx="130" ry="40" />
          <ellipse cx="150" cy="150" rx="130" ry="80" />
        </g>

        {/* North America — dot cluster */}
        <g fill="#00D4AA" fillOpacity="0.7" filter="url(#dotGlow)">
          {([
            [85,75],[90,72],[95,70],[100,68],[105,70],[110,72],[115,75],
            [80,85],[85,82],[90,80],[95,78],[100,76],[105,78],[110,80],[115,82],
            [75,95],[80,92],[85,90],[90,88],[95,86],[100,84],[105,86],[110,88],
            [80,105],[85,102],[90,100],[95,98],[100,96],[105,98],[110,100],
            [85,115],[90,112],[95,110],[100,108],[105,110],
            [90,125],[95,122],[100,120],[105,122],
            [95,130],[100,128],
          ] as [number, number][]).map(([cx, cy]) => (
            <circle key={`na-${cx}-${cy}`} cx={cx} cy={cy} r={cy > 110 ? 1.2 : 1.5} />
          ))}
        </g>

        {/* South America — dot cluster */}
        <g fill="#00D4AA" fillOpacity="0.7" filter="url(#dotGlow)">
          {[
            [118,155],[122,152],[126,155],[130,152],
            [116,165],[120,162],[124,165],[128,162],[132,165],
            [115,175],[119,172],[123,175],[127,172],[131,175],
            [116,185],[120,182],[124,185],[128,182],
            [118,195],[122,192],[126,195],
            [120,205],[124,202],
            [122,215],[126,212],
            [124,225],
            [128,230],[132,228],[136,230],
            [130,215],[134,212],[138,215],
          ].map(([cx, cy]) => (
            <circle key={`sa-${cx}-${cy}`} cx={cx} cy={cy} r={1.2} />
          ))}
        </g>

        {/* Europe — dot cluster */}
        <g fill="#00D4AA" fillOpacity="0.7" filter="url(#dotGlow)">
          {[
            [175,78],[180,75],[185,73],[190,75],
            [170,88],[175,85],[180,82],[185,80],[190,82],[195,85],
            [168,98],[173,95],[178,92],[183,90],[188,92],[193,95],
            [172,108],[177,105],[182,102],[187,105],
            [178,115],[183,112],[188,115],
            [186,120],[191,118],[195,120],
          ].map(([cx, cy]) => (
            <circle key={`eu-${cx}-${cy}`} cx={cx} cy={cy} r={1.5} />
          ))}
        </g>

        {/* Africa — dot cluster */}
        <g fill="#00D4AA" fillOpacity="0.7" filter="url(#dotGlow)">
          {[
            [183,130],[188,128],[193,130],[198,128],
            [180,140],[185,138],[190,135],[195,138],[200,140],
            [178,150],[183,148],[188,145],[193,148],[198,150],
            [180,160],[185,158],[190,155],[195,158],
            [182,170],[187,168],[192,170],
            [184,180],[189,178],[194,180],
            [186,190],[191,188],
            [188,200],[193,198],
            [192,208],[196,206],[200,208],
            [196,195],[200,192],[204,195],
            [192,180],[196,178],[200,180],
          ].map(([cx, cy]) => (
            <circle key={`af-${cx}-${cy}`} cx={cx} cy={cy} r={1.2} />
          ))}
        </g>

        {/* Asia — dot cluster */}
        <g fill="#00D4AA" fillOpacity="0.7" filter="url(#dotGlow)">
          {[
            [200,65],[205,62],[210,60],[215,62],[220,65],[225,62],[230,60],[235,62],[240,65],[245,62],[250,65],
            [195,75],[200,72],[205,70],[210,68],[215,70],[220,72],[225,70],[230,68],[235,70],[240,72],[245,70],[250,72],[255,75],[260,72],
            [190,85],[195,82],[200,80],[205,78],[210,80],[215,82],[220,80],[225,78],[230,80],[235,82],[240,80],[245,78],[250,80],[255,82],
            [195,95],[200,92],[205,90],[210,88],[215,90],[220,92],[225,90],[230,88],[235,90],[240,92],[245,90],[250,88],[255,90],
            [200,105],[205,102],[210,100],[215,98],[220,100],[225,102],[230,100],[235,98],[240,100],[245,102],[250,100],
            [205,115],[210,112],[215,110],[220,108],[225,110],[230,112],[235,110],[240,108],[245,110],
            [210,125],[215,122],[220,120],[225,118],[230,120],[235,122],
            [215,135],[220,132],[225,130],[230,128],
            [220,142],[225,140],[230,138],
            [230,148],[235,146],[240,148],
            [200,115],[205,112],[210,110],
            [230,110],[235,108],[240,110],[245,108],[250,110],
          ].map(([cx, cy]) => (
            <circle key={`as-${cx}-${cy}`} cx={cx} cy={cy} r={1.5} />
          ))}
        </g>

        {/* Australia — dot cluster */}
        <g fill="#00D4AA" fillOpacity="0.7" filter="url(#dotGlow)">
          {[
            [225,188],[230,185],[235,183],[240,185],[245,188],
            [220,198],[225,195],[230,192],[235,190],[240,192],[245,195],[250,198],
            [222,208],[227,205],[232,202],[237,200],[242,202],[247,205],
            [225,218],[230,215],[235,212],[240,215],
            [230,225],[235,222],[240,225],
            [240,218],[245,215],[250,218],
          ].map(([cx, cy]) => (
            <circle key={`au-${cx}-${cy}`} cx={cx} cy={cy} r={1.2} />
          ))}
        </g>

        {/* Arc lines (static) */}
        <g stroke="#00D4AA" strokeWidth="0.8" strokeOpacity="0.25" fill="none" filter="url(#arcGlow)">
          <path d="M105 90 Q140 50 185 85" />
          <path d="M105 90 Q180 20 240 70" />
          <path d="M185 85 Q180 150 225 140" />
          <path d="M185 85 Q200 170 235 200" />
          <path d="M105 90 Q120 190 128 220" />
        </g>

        {/* Flowing particles (duplicate paths with dash animation) */}
        <g stroke="#00D4AA" strokeWidth="1.5" strokeOpacity="0.8" fill="none" filter="url(#arcGlow)">
          <path className="flow-path" d="M105 90 Q140 50 185 85" />
          <path className="flow-path-reverse" style={{ animationDelay: "0.5s" }} d="M105 90 Q180 20 240 70" />
          <path className="flow-path" style={{ animationDelay: "1s" }} d="M185 85 Q180 150 225 140" />
          <path className="flow-path-reverse" style={{ animationDelay: "1.5s" }} d="M185 85 Q200 170 235 200" />
          <path className="flow-path" style={{ animationDelay: "2s" }} d="M105 90 Q120 190 128 220" />
        </g>

        {/* Financial hub pulsing nodes */}
        <g fill="#00D4AA" filter="url(#arcGlow)">
          <circle cx="105" cy="90" r="4" opacity="0.9" style={{ animationDelay: "0s" }} className="hub-large" />  {/* NYC */}
          <circle cx="185" cy="85" r="4" opacity="0.9" style={{ animationDelay: "0.5s" }} className="hub-large" />   {/* London */}
          <circle cx="128" cy="220" r="3" opacity="0.9" style={{ animationDelay: "1s" }} className="hub-small" />  {/* São Paulo */}
          <circle cx="240" cy="70" r="4" opacity="0.9" style={{ animationDelay: "1.5s" }} className="hub-small" />   {/* Tokyo */}
          <circle cx="225" cy="140" r="3" opacity="0.9" style={{ animationDelay: "2s" }} className="hub-small" />  {/* Singapore */}
          <circle cx="235" cy="200" r="3" opacity="0.9" style={{ animationDelay: "2.5s" }} className="hub-small" />  {/* Sydney */}
        </g>
        </g>
      </svg>
    </div>
  );
}
