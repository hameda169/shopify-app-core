interface HsbColor {
  hue: number;
  saturation: number;
  brightness: number;
  alpha?: number;
}

export function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 0, g: 128, b: 96 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((v) => {
      const h = v.toString(16);
      return h.length === 1 ? '0' + h : h;
    })
    .join('')}`;
}

export function rgbToHsb(r: number, g: number, b: number): HsbColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / d + 2) * 60;
        break;
      default:
        h = ((rn - gn) / d + 4) * 60;
    }
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { hue: h, saturation: s, brightness: v };
}

export function hsbToRgb({ hue, saturation, brightness }: HsbColor) {
  const c = brightness * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = brightness - c;
  let rp = 0,
    gp = 0,
    bp = 0;
  if (hue < 60) {
    rp = c;
    gp = x;
  } else if (hue < 120) {
    rp = x;
    gp = c;
  } else if (hue < 180) {
    gp = c;
    bp = x;
  } else if (hue < 240) {
    gp = x;
    bp = c;
  } else if (hue < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  const r = Math.round((rp + m) * 255);
  const g = Math.round((gp + m) * 255);
  const b = Math.round((bp + m) * 255);
  return { r, g, b };
}

export function hexToHsb(hex: string): HsbColor {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsb(r, g, b);
}

export function hsbToHex(c: HsbColor): string {
  const { r, g, b } = hsbToRgb(c);
  return rgbToHex(r, g, b);
}
