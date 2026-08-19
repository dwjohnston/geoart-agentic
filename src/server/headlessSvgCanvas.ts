/**
 * A minimal Canvas2D-shaped object that records draw calls as SVG elements
 * instead of touching pixels. Implements only the subset of the API that
 * `src/nodes/render/nodes/*.ts` actually calls (beginPath/moveTo/lineTo/
 * closePath/ellipse/stroke/fill/clearRect/createLinearGradient +
 * strokeStyle/fillStyle/lineWidth) — not a general Canvas2D polyfill.
 *
 * Exists so the graph can be rendered to a static image inside a Cloudflare
 * Worker: native canvas libraries (e.g. @napi-rs/canvas, used by
 * ../common-tooling/test-tooling/replayContext.ts for test snapshots) are
 * N-API binaries that cannot be bundled into a Worker. SVG + a WASM
 * rasterizer (see renderAlgorithmImage.ts) can.
 */

type PathSegment =
  | { kind: 'move'; x: number; y: number }
  | { kind: 'line'; x: number; y: number }
  | { kind: 'close' }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rotationRad: number };

export type LinearGradient = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: Array<{ offset: number; colorCss: string }>;
  addColorStop(offset: number, colorCss: string): void;
};

type StyleValue = string | LinearGradient;

function isLinearGradient(value: StyleValue): value is LinearGradient {
  return typeof value === 'object';
}

/** Splits a `rgba(r, g, b, a)` / `rgb(r, g, b)` string into an SVG colour + opacity. */
function parseCssColor(css: string): { rgb: string; opacity: number } {
  const match = css.match(/rgba?\(\s*([-\d.]+)[,\s]+([-\d.]+)[,\s]+([-\d.]+)(?:[,\s]+([-\d.]+))?\)/);
  if (!match) return { rgb: css, opacity: 1 };
  const clamp255 = (n: string) => Math.max(0, Math.min(255, Math.round(parseFloat(n))));
  const [, r, g, b, a] = match;
  return {
    rgb: `rgb(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)})`,
    opacity: a !== undefined ? Math.max(0, Math.min(1, parseFloat(a))) : 1,
  };
}

function segmentsToPathD(segments: PathSegment[]): string {
  return segments
    .map(seg => {
      if (seg.kind === 'move') return `M ${seg.x} ${seg.y}`;
      if (seg.kind === 'line') return `L ${seg.x} ${seg.y}`;
      if (seg.kind === 'close') return 'Z';
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

export type HeadlessSvgCanvas = {
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number): void;
  stroke(): void;
  fill(): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): LinearGradient;
  strokeStyle: StyleValue;
  fillStyle: StyleValue;
  lineWidth: number;
  getSvgElements(): string[];
};

export function createHeadlessSvgCanvas(): HeadlessSvgCanvas {
  let path: PathSegment[] = [];
  let strokeStyle: StyleValue = 'rgb(0, 0, 0)';
  let fillStyle: StyleValue = 'rgb(0, 0, 0)';
  let lineWidth = 1;
  const elements: string[] = [];

  function styleAttrs(style: StyleValue, kind: 'stroke' | 'fill'): string {
    if (!isLinearGradient(style)) {
      const { rgb, opacity } = parseCssColor(style);
      return `${kind}="${rgb}" ${kind}-opacity="${opacity}"`;
    }
    const id = `g${elements.length}`;
    const stops = style.stops
      .map(s => {
        const { rgb, opacity } = parseCssColor(s.colorCss);
        return `<stop offset="${s.offset}" stop-color="${rgb}" stop-opacity="${opacity}" />`;
      })
      .join('');
    elements.push(
      `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${style.x1}" y1="${style.y1}" x2="${style.x2}" y2="${style.y2}">${stops}</linearGradient>`,
    );
    return `${kind}="url(#${id})"`;
  }

  function emit(kind: 'stroke' | 'fill'): void {
    if (path.length === 0) return;
    const otherAttr = kind === 'stroke' ? 'fill="none"' : 'stroke="none"';
    const widthAttr = kind === 'stroke' ? ` stroke-width="${lineWidth}"` : '';
    const style = kind === 'stroke' ? strokeStyle : fillStyle;

    if (path.length === 1 && path[0].kind === 'ellipse') {
      const e = path[0];
      const attrs = styleAttrs(style, kind);
      const deg = (e.rotationRad * 180) / Math.PI;
      elements.push(
        `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${deg} ${e.cx} ${e.cy})" ${attrs} ${otherAttr}${widthAttr} />`,
      );
      return;
    }

    const d = segmentsToPathD(path);
    const attrs = styleAttrs(style, kind);
    elements.push(`<path d="${d}" ${attrs} ${otherAttr}${widthAttr} />`);
  }

  return {
    beginPath() {
      path = [];
    },
    moveTo(x, y) {
      path.push({ kind: 'move', x, y });
    },
    lineTo(x, y) {
      path.push({ kind: 'line', x, y });
    },
    closePath() {
      path.push({ kind: 'close' });
    },
    ellipse(x, y, radiusX, radiusY, rotation) {
      path.push({ kind: 'ellipse', cx: x, cy: y, rx: radiusX, ry: radiusY, rotationRad: rotation });
    },
    stroke() {
      emit('stroke');
    },
    fill() {
      emit('fill');
    },
    clearRect() {
      elements.length = 0;
    },
    createLinearGradient(x0, y0, x1, y1) {
      const stops: LinearGradient['stops'] = [];
      return {
        x1: x0,
        y1: y0,
        x2: x1,
        y2: y1,
        stops,
        addColorStop(offset, colorCss) {
          stops.push({ offset, colorCss });
        },
      };
    },
    get strokeStyle() {
      return strokeStyle;
    },
    set strokeStyle(v) {
      strokeStyle = v;
    },
    get fillStyle() {
      return fillStyle;
    },
    set fillStyle(v) {
      fillStyle = v;
    },
    get lineWidth() {
      return lineWidth;
    },
    set lineWidth(v) {
      lineWidth = v;
    },
    getSvgElements() {
      return elements;
    },
  };
}
