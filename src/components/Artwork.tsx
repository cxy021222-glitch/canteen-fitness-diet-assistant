import { cn } from '@/lib/utils';

type Variant = 'cover' | 'scene';

interface Spec {
  paper: string;
  sky: string;
  sky2: string;
  far: string;
  mid: string;
  near: string;
  ink: string;
  accent: string;
  blur: number;
  stroke: number;
  grain: number;
  vignette: number;
  hatch?: boolean;
  dots?: boolean;
  misreg?: number;
  grayscale?: boolean;
  wash?: boolean;
}

const SPECS: Record<string, Spec> = {
  woodcut: {
    paper: '#efe5cf',
    sky: '#e8dcc0',
    sky2: '#dfd0ae',
    far: '#c8b593',
    mid: '#3a3027',
    near: '#1b1712',
    ink: '#1b1712',
    accent: '#a6392b',
    blur: 0,
    stroke: 3,
    grain: 0.1,
    vignette: 0.16,
    hatch: true,
  },
  watercolor: {
    paper: '#f4eddd',
    sky: '#dee6da',
    sky2: '#e9dfc9',
    far: '#c2cec1',
    mid: '#94a795',
    near: '#5d6b58',
    ink: '#3f463c',
    accent: '#b9793f',
    blur: 6,
    stroke: 0,
    grain: 0.14,
    vignette: 0.1,
    wash: true,
  },
  film: {
    paper: '#ded7c7',
    sky: '#cfcabe',
    sky2: '#bdb8ac',
    far: '#a5a196',
    mid: '#615d55',
    near: '#2c2a26',
    ink: '#1b1a18',
    accent: '#8b8375',
    blur: 1,
    stroke: 1,
    grain: 0.34,
    vignette: 0.34,
    grayscale: true,
  },
  ink: {
    paper: '#f8f3e6',
    sky: '#f3ecdc',
    sky2: '#eee6d4',
    far: '#d3d6cc',
    mid: '#98a096',
    near: '#454b45',
    ink: '#1f2421',
    accent: '#6f7a72',
    blur: 2,
    stroke: 2,
    grain: 0.1,
    vignette: 0.08,
    wash: true,
  },
  risograph: {
    paper: '#efe6d2',
    sky: '#e7d9bd',
    sky2: '#e2d2b2',
    far: '#c8735a',
    mid: '#2f4a56',
    near: '#22333c',
    ink: '#22333c',
    accent: '#c05a3e',
    blur: 0,
    stroke: 1.5,
    grain: 0.12,
    vignette: 0.16,
    dots: true,
    misreg: 5,
  },
  oil: {
    paper: '#33291f',
    sky: '#7b5136',
    sky2: '#c08a52',
    far: '#9a6a45',
    mid: '#523a29',
    near: '#241b14',
    ink: '#1a130e',
    accent: '#d3903f',
    blur: 3,
    stroke: 1,
    grain: 0.2,
    vignette: 0.4,
  },
};

function mountains(y: number, amp: number, offset: number, fill: string, opacity = 1) {
  const points: string[] = [`0,${y + 40}`];
  const spans = 6;
  for (let i = 0; i <= spans; i += 1) {
    const x = (1200 / spans) * i;
    const peak = y - amp * (0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + offset)));
    points.push(`${x.toFixed(0)},${peak.toFixed(0)}`);
  }
  points.push(`1200,${y + 40}`);
  return `<polygon points="${points.join(' ')}" fill="${fill}" opacity="${opacity}" />`;
}

function figure(x: number, baseY: number, height: number, fill: string) {
  const head = height * 0.14;
  return `<g fill="${fill}">
    <circle cx="${x}" cy="${baseY - height + head}" r="${head * 0.7}" />
    <path d="M${x - head * 0.75} ${baseY - height + head * 0.9}
      q${head * 0.75} ${-head * 0.5} ${head * 1.5} 0
      l${head * 0.32} ${height * 0.55} l${-head * 0.3} 0 l${-head * 0.2} ${height * 0.42}
      l${-head * 0.14} 0 l${-head * 0.06} ${-height * 0.36}
      l${-head * 0.5} 0 l${-head * 0.06} ${height * 0.36}
      l${-head * 0.14} 0 l${-head * 0.2} ${-height * 0.42} l${-head * 0.3} 0 Z" />
  </g>`;
}

function steam(x: number, y: number, color: string) {
  return `<g fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="0.5">
    <path d="M${x} ${y} c -18 -26 20 -40 2 -66 c -14 -20 12 -30 0 -50" />
    <path d="M${x + 26} ${y + 6} c -12 -20 16 -32 4 -52 c -10 -16 9 -26 2 -42" opacity="0.6" />
  </g>`;
}

function subjectCover(s: Spec) {
  const { mid, near, ink, accent, paper } = s;
  return `
  <g opacity="0.9">
    <path d="M0 470 C 240 505, 520 415, 900 470" fill="none" stroke="${ink}" stroke-width="1.4" opacity="0.5" />
    <path d="M0 432 C 260 470, 560 388, 900 436" fill="none" stroke="${ink}" stroke-width="1" opacity="0.4" />
    ${[120, 430, 760].map((x) => `<line x1="${x}" y1="${x === 120 ? 436 : x === 430 ? 452 : 440}" x2="${x}" y2="880" stroke="${ink}" stroke-width="4" opacity="0.75" />`).join('')}
  </g>
  <g fill="${mid}">
    <path d="M470 900 L482 470 L590 470 L610 900 Z" />
    <path d="M596 900 L604 520 L668 520 L692 900 Z" />
    <rect x="470" y="452" width="220" height="20" />
  </g>
  <g fill="${near}">
    <path d="M468 900 L480 480 L592 480 L612 900 Z" opacity="0.82" />
    <rect x="452" y="438" width="160" height="16" />
    <rect x="438" y="398" width="120" height="40" opacity="0.9" />
    <path d="M606 900 L614 536 L662 536 L686 900 Z" opacity="0.9" />
  </g>
  <g stroke="${ink}" stroke-width="4" fill="none" opacity="0.7">
    <path d="M300 900 L300 610 L356 610 L356 900" />
    <path d="M300 660 L356 660" />
    <path d="M690 560 C 760 600, 800 700, 806 900" />
  </g>
  <g opacity="0.32" fill="${paper}">
    <ellipse cx="640" cy="700" rx="330" ry="42" />
    <ellipse cx="520" cy="762" rx="300" ry="34" />
    <ellipse cx="720" cy="640" rx="240" ry="26" />
  </g>
  ${figure(330, 900, 132, near)}
  ${figure(372, 900, 78, near)}
  ${s.accent === '#8b8375' ? '' : `<circle cx="700" cy="560" r="52" fill="${accent}" opacity="0.85" />`}
  <g opacity="0.55">
    ${Array.from({ length: 18 }).map((_, i) => {
      const x = 560 + ((i * 71) % 260);
      const y = 500 - ((i * 43) % 200);
      return `<circle cx="${x}" cy="${y}" r="${1.6 + (i % 3)}" fill="${accent}" />`;
    }).join('')}
  </g>`;
}

function subjectScene(index: number, s: Spec) {
  const { mid, near, ink, accent, paper } = s;
  switch (index) {
    case 1:
      return `
      <g stroke="${ink}" stroke-width="4" fill="none" opacity="0.8">
        <path d="M120 720 L190 402 L260 720" />
        <path d="M136 660 L244 660 M152 600 L228 600 M166 540 L214 540" />
        <path d="M120 720 L260 402 M260 720 L120 402" opacity="0.35" />
      </g>
      <g fill="${near}">
        <rect x="520" y="520" width="262" height="200" />
        <polygon points="492,522 651,414 812,522" />
        <rect x="764" y="438" width="24" height="70" />
      </g>
      <rect x="596" y="576" width="62" height="58" fill="${accent}" opacity="0.85" />
      <rect x="702" y="616" width="54" height="104" fill="${ink}" opacity="0.85" />
      <rect x="372" y="648" width="96" height="72" rx="6" fill="${mid}" />
      <ellipse cx="420" cy="644" rx="38" ry="10" fill="${near}" />
      ${steam(424, 616, ink)}
      ${figure(340, 720, 150, near)}
      ${figure(400, 720, 92, near)}
      <rect x="0" y="712" width="1200" height="188" fill="${near}" opacity="0.9" />
      <path d="M0 716 H1200" stroke="${paper}" stroke-width="2" opacity="0.25" />`;
    case 2:
      return `
      <g fill="${mid}" opacity="0.92">
        <rect x="0" y="646" width="1200" height="76" />
        ${Array.from({ length: 6 }).map((_, i) => `<path d="M${40 + i * 200} 722 a 62 62 0 0 0 124 0 Z" fill="${paper}" opacity="0.5" />`).join('')}
      </g>
      <g fill="${near}">
        <rect x="230" y="512" width="700" height="134" rx="10" />
        <path d="M930 512 L1020 540 L1020 646 L930 646 Z" />
        <rect x="1004" y="560" width="26" height="60" rx="4" />
        <rect x="268" y="470" width="86" height="44" rx="6" />
      </g>
      <g fill="${paper}" opacity="0.9">
        ${Array.from({ length: 9 }).map((_, i) => `<rect x="${268 + i * 72}" y="552" width="44" height="40" rx="3" />`).join('')}
      </g>
      <g fill="${ink}" opacity="0.7">
        ${Array.from({ length: 6 }).map((_, i) => `<circle cx="${180 - i * 26}" cy="${470 - i * 46}" r="${18 + i * 6}" opacity="${0.5 - i * 0.06}" />`).join('')}
      </g>
      <rect x="0" y="722" width="1200" height="178" fill="${near}" opacity="0.92" />
      <g stroke="${paper}" stroke-width="3" opacity="0.35">
        <path d="M0 748 H1200" />
        <path d="M0 762 H1200" />
      </g>`;
    case 3:
      return `
      <ellipse cx="700" cy="700" rx="300" ry="90" fill="${accent}" opacity="0.35" />
      <g fill="${near}">
        <path d="M588 720 L616 300 L694 300 L760 720 Z" />
        <rect x="596" y="266" width="112" height="38" />
        <rect x="560" y="404" width="248" height="16" />
        <path d="M760 470 L850 470 L850 720 L760 720 Z" opacity="0.85" />
      </g>
      <g stroke="${ink}" stroke-width="5" fill="none" opacity="0.85">
        <path d="M470 720 L470 520 L560 520" />
        <path d="M880 620 L980 620 L980 720" />
        <path d="M640 300 L640 190" />
      </g>
      <g fill="${accent}">
        ${Array.from({ length: 26 }).map((_, i) => `<circle cx="${520 + ((i * 83) % 380)}" cy="${300 - ((i * 57) % 210)}" r="${2 + (i % 3)}" opacity="${0.4 + (i % 4) * 0.15}" />`).join('')}
      </g>
      ${[300, 350, 402, 452].map((x, i) => figure(x, 700, 118 - i * 8, near)).join('')}
      <rect x="0" y="700" width="1200" height="200" fill="${near}" opacity="0.94" />`;
    case 4:
      return `
      <rect x="96" y="120" width="1008" height="620" fill="${mid}" opacity="0.35" />
      <g fill="${near}">
        <rect x="700" y="200" width="300" height="280" />
      </g>
      <g stroke="${paper}" stroke-width="4" opacity="0.9">
        <path d="M850 200 V480 M700 340 H1000" />
      </g>
      <rect x="716" y="216" width="268" height="248" fill="${accent}" opacity="0.55" />
      <polygon points="700,480 470,720 1000,720" fill="${paper}" opacity="0.18" />
      <g fill="${near}">
        <rect x="110" y="560" width="230" height="150" />
        <rect x="96" y="540" width="258" height="24" />
        <rect x="150" y="586" width="150" height="10" fill="${paper}" opacity="0.35" />
      </g>
      <g fill="${mid}">
        <rect x="392" y="588" width="196" height="16" />
        <rect x="404" y="604" width="16" height="106" />
        <rect x="560" y="604" width="16" height="106" />
      </g>
      <g stroke="${ink}" stroke-width="5" fill="none">
        <circle cx="700" cy="632" r="58" />
        <circle cx="884" cy="632" r="58" />
        <path d="M700 632 L776 566 L852 632 M776 566 L806 632 M700 632 L776 632" />
      </g>
      <g stroke="${ink}" stroke-width="2" opacity="0.8">
        <path d="M360 120 C 356 200, 372 256, 366 320" fill="none" />
        ${Array.from({ length: 5 }).map((_, i) => `<path d="M${352 + i * 6} ${168 + i * 28} q -10 22 2 36" stroke="${accent}" stroke-width="7" stroke-linecap="round" fill="none" />`).join('')}
      </g>
      <rect x="0" y="712" width="1200" height="188" fill="${near}" opacity="0.95" />
      <path d="M0 712 H1200" stroke="${paper}" stroke-width="3" opacity="0.3" />`;
    default:
      return `
      <g fill="${mid}" opacity="0.75">
        <path d="M150 620 L164 430 L214 430 L232 620 Z" />
        <rect x="146" y="408" width="82" height="24" />
      </g>
      <g fill="${near}" opacity="0.9">
        <path d="M148 620 L162 442 L216 442 L230 620 Z" opacity="0.5" />
      </g>
      <rect x="0" y="612" width="1200" height="90" fill="${accent}" opacity="0.4" />
      <g stroke="${paper}" stroke-width="2" opacity="0.4">
        <path d="M0 640 C 300 656, 800 624, 1200 648" fill="none" />
        <path d="M0 672 C 340 690, 760 656, 1200 682" fill="none" />
      </g>
      <g fill="${near}">
        ${[980, 1050, 1110].map((x, i) => `<circle cx="${x}" cy="${520 - i * 14}" r="${46 - i * 6}" />`).join('')}
        ${[980, 1050, 1110].map((x, i) => `<rect x="${x - 5}" y="${540 - i * 14}" width="10" height="${78 + i * 8}" />`).join('')}
      </g>
      ${figure(800, 700, 150, near)}
      ${figure(856, 700, 96, near)}
      <rect x="0" y="700" width="1200" height="200" fill="${near}" opacity="0.94" />`;
  }
}

function texture(s: Spec, uid: string) {
  return `
  <rect width="100%" height="100%" fill="url(#grain-${uid})" opacity="${s.grain}" />
  ${s.hatch ? `<rect width="100%" height="100%" fill="url(#hatch-${uid})" opacity="0.22" />` : ''}
  ${s.dots ? `<rect width="100%" height="100%" fill="url(#dots-${uid})" opacity="0.28" />` : ''}
  <rect width="100%" height="100%" fill="url(#vig-${uid})" opacity="${s.vignette}" />`;
}

export function artworkSvg(variant: Variant, styleId: string, index = 1, seed = 0) {
  const s = SPECS[styleId] ?? SPECS.woodcut;
  const uid = `${styleId}-${variant}-${index}-${seed}`;
  const isCover = variant === 'cover';
  const w = isCover ? 900 : 1200;
  const h = isCover ? 1200 : 900;

  const sky = `
    <defs>
      <linearGradient id="sky-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${s.sky2}" />
        <stop offset="0.62" stop-color="${s.sky}" />
        <stop offset="1" stop-color="${s.paper}" />
      </linearGradient>
      <filter id="soft-${uid}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="${s.blur}" />
      </filter>
      <filter id="grain-${uid}" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed + 7}" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <pattern id="hatch-${uid}" width="9" height="9" patternTransform="rotate(26)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="9" stroke="${s.ink}" stroke-width="1.6" />
      </pattern>
      <pattern id="dots-${uid}" width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.7" fill="${s.ink}" />
      </pattern>
      <radialGradient id="vig-${uid}" cx="50%" cy="46%" r="72%">
        <stop offset="55%" stop-color="#000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000" stop-opacity="1" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="${s.paper}" />
    <rect width="100%" height="100%" fill="url(#sky-${uid})" />`;

  const base = isCover
    ? `<g filter="url(#soft-${uid})">
        ${mountains(820, 260, 1.2 + seed * 0.1, s.far, 0.85)}
        ${mountains(860, 170, 2.4 + seed * 0.1, s.mid, 0.55)}
      </g>
      <circle cx="640" cy="300" r="${isCover && s.accent === '#8b8375' ? 46 : 62}" fill="${s.accent}" opacity="${s.wash ? 0.45 : 0.75}" filter="url(#soft-${uid})" />
      ${subjectCover(s)}`
    : `<g filter="url(#soft-${uid})">
        ${mountains(600, 230, 1.1 + seed * 0.17, s.far, 0.9)}
        ${mountains(636, 150, 2.6 + seed * 0.17, s.mid, 0.6)}
      </g>
      <circle cx="930" cy="190" r="58" fill="${s.accent}" opacity="${s.wash ? 0.4 : 0.7}" filter="url(#soft-${uid})" />
      ${subjectScene(index, s)}`;

  const misreg = s.misreg
    ? `<g transform="translate(${s.misreg} -${Math.round(s.misreg / 2)})" opacity="0.42" style="mix-blend-mode:multiply">${base}</g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="回忆录插图">
    ${sky}
    <g ${s.grayscale ? 'filter="url(#soft-' + uid + ')" style="filter:grayscale(1) contrast(1.08)"' : ''}>
      ${base}
    </g>
    ${misreg}
    ${texture(s, uid)}
  </svg>`;
}

export function Artwork({
  variant,
  styleId,
  index = 1,
  seed = 0,
  className,
}: {
  variant: Variant;
  styleId: string;
  index?: number;
  seed?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('size-full [&>svg]:size-full [&>svg]:object-cover', className)}
      dangerouslySetInnerHTML={{ __html: artworkSvg(variant, styleId, index, seed) }}
    />
  );
}
