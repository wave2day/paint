export class FM {

  constructor() {
    this.freq = 0.02;
    this.depth = 25;
    this.angle = 0;

    this.smooth = 1;
    this.threshold = 128;

    this.flow = 0;
    this.blend = 1;
    this.colorize = 0;
  }

  draw(engine) {

    const w = engine.drawW;
    const h = engine.drawH;

    if (!w || !h) return;

    const src = engine.sourceCtx.getImageData(0, 0, w, h);
    const dst = engine.ctx.createImageData(w, h);

    const d = src.data;
    const out = dst.data;

    const freq = this.freq;
    const depth = this.depth;
    const angle = this.angle;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {

        const i = (y * w + x) * 4;

        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];

        const brightness = (r + g + b) / 3 / 255;

        // 🔥 FLOW FIELD
        const flowOffset =
          Math.sin(
            y * 0.01 +
            brightness * 4
          ) *
          this.flow *
          120;

        const sampleX =
          (x + flowOffset) * cos +
          y * sin;

        // 🔥 FM SIGNAL
        const v = Math.sin(
          sampleX * freq +
          brightness * depth
        );

        const c = (v * 0.5 + 0.5) * 255;

        // 🔥 SMOOTH THRESHOLD
        const edge = c - this.threshold;

        const smoothWidth = this.smooth * 120;

    let final =
  128 + (edge / smoothWidth) * 255;

// 🔥 nonlinear edge compression
final = Math.pow(final / 255, 1.8) * 255;

// clamp
final = Math.max(
  0,
  Math.min(255, final)
);

// 🔥 COLORIZE
let fr = final;
let fg = final;
let fb = final;

if (this.colorize > 0) {

  const tint = {
    r: 255,
    g: 0,
    b: 255
  };

  fr =
    final * (1 - this.colorize) +
    tint.r * this.colorize;

  fg =
    final * (1 - this.colorize) +
    tint.g * this.colorize;

  fb =
    final * (1 - this.colorize) +
    tint.b * this.colorize;
}

// 🔥 BLEND
const blend = this.blend;

out[i] =
  r * (1 - blend) +
  fr * blend;

out[i + 1] =
  g * (1 - blend) +
  fg * blend;

out[i + 2] =
  b * (1 - blend) +
  fb * blend;

out[i + 3] = 255;
      }
    }

    // 🔥 vykreslení AŽ NA KONCI
    engine.ctx.putImageData(
      dst,
      engine.offsetX,
      engine.offsetY
    );
  }
}