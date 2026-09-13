// Realistic SVG-based screenshots matching the user's uploaded proof requirements

export const BLOCKBUSTER_EXAMPLE_1 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" fill="none">
  <rect width="600" height="420" rx="16" fill="#FBF3E8"/>
  <!-- Top decorative pattern -->
  <rect x="20" y="20" width="560" height="380" rx="14" fill="#FFFDF9" stroke="#E6DAC8" stroke-width="2"/>
  
  <!-- Row 1: Age -->
  <g transform="translate(40, 50)">
    <rect width="520" height="60" rx="12" fill="#FCEBD6" stroke="#E8D1B5" stroke-width="1.5"/>
    <text x="30" y="37" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#7C4B18">Age</text>
    <text x="460" y="37" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#2C2C2C">30 ▶</text>
    <!-- Red indicator arrow -->
    <path d="M120 30 L420 30" stroke="#E53935" stroke-width="4" stroke-linecap="round"/>
    <polygon points="420,23 440,30 420,37" fill="#E53935"/>
  </g>

  <!-- Row 2: ID Number -->
  <g transform="translate(40, 140)">
    <rect width="520" height="60" rx="12" fill="#FCEBD6" stroke="#E8D1B5" stroke-width="1.5"/>
    <text x="30" y="37" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#7C4B18">ID</text>
    <rect x="360" y="15" width="130" height="32" rx="6" fill="#F0DCBF"/>
    <text x="370" y="36" font-family="monospace" font-weight="700" font-size="15" fill="#3D3020">29091926</text>
    <rect x="445" y="18" width="40" height="26" rx="4" fill="#D29955"/>
    <text x="450" y="35" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">Copy</text>
    <!-- Red indicator arrow -->
    <path d="M100 30 L330 30" stroke="#E53935" stroke-width="4" stroke-linecap="round"/>
    <polygon points="330,23 350,30 330,37" fill="#E53935"/>
  </g>

  <!-- Row 3: Nickname -->
  <g transform="translate(40, 230)">
    <rect width="520" height="60" rx="12" fill="#FCEBD6" stroke="#E8D1B5" stroke-width="1.5"/>
    <text x="30" y="37" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#7C4B18">Nickname</text>
    <text x="375" y="37" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#3D3020">Blue Friend3350 ▶</text>
    <!-- Red indicator arrow -->
    <path d="M150 30 L345 30" stroke="#E53935" stroke-width="4" stroke-linecap="round"/>
    <polygon points="345,23 365,30 345,37" fill="#E53935"/>
  </g>

  <!-- Row 4: Gender -->
  <g transform="translate(40, 320)">
    <rect width="520" height="60" rx="12" fill="#FCEBD6" stroke="#E8D1B5" stroke-width="1.5"/>
    <text x="30" y="37" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#7C4B18">Gender</text>
    <text x="445" y="37" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#2C2C2C">Male ▶</text>
  </g>
</svg>
`)}`;

export const BLOCKBUSTER_EXAMPLE_2 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" fill="none">
  <rect width="600" height="420" rx="16" fill="#3A4D62"/>
  <rect x="20" y="20" width="560" height="380" rx="14" fill="#2E3F52" stroke="#485F78" stroke-width="2"/>

  <!-- Row 1: Email -->
  <g transform="translate(40, 60)">
    <rect width="520" height="65" rx="12" fill="#F5EFE6" stroke="#E2D4C3" stroke-width="1.5"/>
    <text x="30" y="40" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#8C5C26">Email</text>
    <rect x="230" y="16" width="260" height="34" rx="8" fill="#EADCCB"/>
    <text x="245" y="39" font-family="monospace" font-weight="700" font-size="14" fill="#423525">UMAR****UB01@GMAIL.COM ▶</text>
    <!-- Red pointer -->
    <path d="M120 70 L250 45" stroke="#E53935" stroke-width="4" stroke-linecap="round"/>
    <polygon points="248,37 268,45 252,53" fill="#E53935"/>
  </g>

  <!-- Row 2: Device Bound -->
  <g transform="translate(40, 160)">
    <rect width="520" height="65" rx="12" fill="#F5EFE6" stroke="#E2D4C3" stroke-width="1.5"/>
    <text x="30" y="40" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#8C5C26">Device Bound</text>
    <rect x="360" y="16" width="130" height="34" rx="8" fill="#34A853"/>
    <text x="382" y="38" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="#FFFFFF">Bound ✓</text>
  </g>

  <!-- Bottom stars decoration -->
  <g fill="#455B74" opacity="0.6">
    <polygon points="100,280 106,298 125,298 110,310 115,328 100,316 85,328 90,310 75,298 94,298"/>
    <polygon points="480,270 486,288 505,288 490,300 495,318 480,306 465,318 470,300 455,288 474,288"/>
  </g>
</svg>
`)}`;

export const BLOCKBUSTER_EXAMPLE_3 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" fill="none">
  <rect width="600" height="420" rx="16" fill="#18231E"/>
  <rect x="20" y="20" width="560" height="380" rx="14" fill="#0D1714" stroke="#223930" stroke-width="2"/>

  <!-- Top wallet tabs -->
  <g transform="translate(40, 40)">
    <rect width="250" height="90" rx="14" fill="#1D9E74" stroke="#2ED19C" stroke-width="2"/>
    <text x="25" y="35" font-family="system-ui, sans-serif" font-weight="700" font-size="15" fill="#C5F5E4">My wallet</text>
    <text x="25" y="68" font-family="system-ui, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF">$ 0 ~ $50.00</text>
  </g>

  <g transform="translate(310, 40)">
    <rect width="250" height="90" rx="14" fill="#F49D1A" stroke="#FFC043" stroke-width="2"/>
    <text x="25" y="35" font-family="system-ui, sans-serif" font-weight="700" font-size="15" fill="#FFE8BE">Friend signs up</text>
    <text x="25" y="68" font-family="system-ui, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF">302K = $0.6</text>
  </g>

  <!-- Profile & links section -->
  <g transform="translate(40, 160)">
    <rect width="520" height="60" rx="12" fill="#162520" stroke="#2C483D" stroke-width="1.5"/>
    <circle cx="45" cy="30" r="16" fill="#1D9E74"/>
    <text x="80" y="28" font-family="system-ui, sans-serif" font-weight="700" font-size="15" fill="#E0F2EB">Profile</text>
    <text x="80" y="47" font-family="monospace" font-size="11" fill="#7FA999">https://playreb.in/u/29091...</text>
    <rect x="440" y="16" width="60" height="28" rx="6" fill="#2E7D63"/>
    <text x="455" y="35" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#FFFFFF">Copy</text>
  </g>

  <!-- Block list -->
  <g transform="translate(40, 240)">
    <rect width="520" height="60" rx="12" fill="#162520" stroke="#2C483D" stroke-width="1.5"/>
    <circle cx="45" cy="30" r="16" fill="#E65100"/>
    <text x="80" y="36" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#E0F2EB">Block List</text>
  </g>
</svg>
`)}`;
