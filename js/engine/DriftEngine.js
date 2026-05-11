import { driftState }
  from "../effects/drift/driftState.js";

export class DriftEngine {

  constructor() {

    this.state =
      driftState;

    this.KEYS = [
      { b: 1.0, c: 1.0, s: 1.1, h: -10, r: 0.9, g: 1.0, b2: 1.2, gamma: 1.0 },
      { b: 0.9, c: 1.2, s: 0.9, h: 200, r: 0.8, g: 0.9, b2: 1.4, gamma: 1.05 },
      { b: 1.0, c: 1.1, s: 1.2, h: 20,  r: 1.2, g: 0.9, b2: 1.0, gamma: 1.0 },
      { b: 1.0, c: 1.1, s: 1.2, h: 100, r: 0.8, g: 1.2, b2: 0.8, gamma: 1.0 },
      { b: 1.1, c: 1.1, s: 1.1, h: 40,  r: 1.3, g: 1.1, b2: 0.7, gamma: 0.98 },
      { b: 1.0, c: 1.0, s: 1.1, h: -10, r: 0.9, g: 1.0, b2: 1.2, gamma: 1.0 }
    ];
  }

  clamp(x, min, max) {

    return Math.min(
      max,
      Math.max(min, x)
    );
  }

  lerp(a, b, t) {

    return a * (1 - t) + b * t;
  }

  ease(x) {

    return x * x * (3 - 2 * x);
  }

  currentLook(p) {

    const n =
      this.KEYS.length - 1;

    const x = p * n;

    const i =
      Math.min(
        Math.floor(x),
        n - 1
      );

    const f =
      this.ease(x - i);

    const A =
      this.KEYS[i];

    const B =
      this.KEYS[i + 1];

    return {

      b:
        this.lerp(A.b, B.b, f),

      c:
        this.lerp(A.c, B.c, f),

      s:
        this.lerp(A.s, B.s, f),

      h:
        this.lerp(A.h, B.h, f),

      r:
        this.lerp(A.r, B.r, f),

      g:
        this.lerp(A.g, B.g, f),

      b2:
        this.lerp(A.b2, B.b2, f),

      gamma:
        this.lerp(
          A.gamma,
          B.gamma,
          f
        )
    };
  }

  draw(base, progress = 0) {

    base.progress =
      progress;

    base.clear();

    if (!base.images.length) {
      return;
    }

    const smoothEl =
      document.getElementById("smooth");

    const hueEl =
      document.getElementById("hueBias");

    const smooth =
      smoothEl
        ? parseFloat(smoothEl.value)
        : 2;

    const hueBias =
      hueEl
        ? parseFloat(hueEl.value)
        : 0;

    const look =
      this.currentLook(progress);

    const effectAmount =
      this.lerp(
        1.0,
        0.25,
        (smooth - 1) / 4
      );

const frame =
  new ImageData(
    new Uint8ClampedArray(
      base.sourcePixels.data
    ),
    base.drawW,
    base.drawH
  );

    const d = frame.data;

    const {
      b,
      c,
      s,
      h,
      r,
      g,
      b2,
      gamma
    } = look;

    const finalHue =
      h + hueBias;

    const rad =
      finalHue *
      Math.PI /
      180;

    const cos =
      Math.cos(rad);

    const sin =
      Math.sin(rad);

    for (let i = 0; i < d.length; i += 4) {

      const originalR = d[i];
      const originalG = d[i + 1];
      const originalB = d[i + 2];

      let R = originalR;
      let G = originalG;
      let B = originalB;

      R *= b;
      G *= b;
      B *= b;

      const nr =
        (.299 + .701 * cos + .168 * sin) * R +
        (.587 - .587 * cos + .330 * sin) * G +
        (.114 - .114 * cos - .497 * sin) * B;

      const ng =
        (.299 - .299 * cos - .328 * sin) * R +
        (.587 + .413 * cos + .035 * sin) * G +
        (.114 - .114 * cos + .292 * sin) * B;

      const nb =
        (.299 - .300 * cos + 1.250 * sin) * R +
        (.587 - .588 * cos - 1.050 * sin) * G +
        (.114 + .886 * cos - .203 * sin) * B;

      R =
        (nr * r - 128) * c + 128;

      G =
        (ng * g - 128) * c + 128;

      B =
        (nb * b2 - 128) * c + 128;

      const gray =
        (R + G + B) / 3;

      R =
        gray + (R - gray) * s;

      G =
        gray + (G - gray) * s;

      B =
        gray + (B - gray) * s;

      R =
        255 *
        Math.pow(
          this.clamp(R / 255, 0, 1),
          1 / gamma
        );

      G =
        255 *
        Math.pow(
          this.clamp(G / 255, 0, 1),
          1 / gamma
        );

      B =
        255 *
        Math.pow(
          this.clamp(B / 255, 0, 1),
          1 / gamma
        );

      R =
        this.lerp(
          originalR,
          R,
          effectAmount
        );

      G =
        this.lerp(
          originalG,
          G,
          effectAmount
        );

      B =
        this.lerp(
          originalB,
          B,
          effectAmount
        );

      d[i] =
        this.clamp(R, 0, 255);

      d[i + 1] =
        this.clamp(G, 0, 255);

      d[i + 2] =
        this.clamp(B, 0, 255);
    }

    base.tempBuffer.ctx.clearRect(
      0,
      0,
      base.drawW,
      base.drawH
    );

    base.tempBuffer.ctx.putImageData(
      frame,
      0,
      0
    );

    base.tempBuffer.ctx.globalCompositeOperation =
      "overlay";

    base.tempBuffer.ctx.fillStyle =
      this.state.paletteColor;

    base.tempBuffer.ctx.fillRect(
      0,
      0,
      base.drawW,
      base.drawH
    );

    base.tempBuffer.ctx.globalCompositeOperation =
      "source-over";

    base.clampOffsets();

   base.outputs.drift.ctx.clearRect(
  0,
  0,
  base.drawW,
  base.drawH
);

base.outputs.drift.ctx.drawImage(
  base.tempBuffer.canvas,
  0,
  0
);

base.ctx.drawImage(
  base.outputs.drift.canvas,
  base.offsetX,
  base.offsetY
);
  }
}