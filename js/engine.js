export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });

    this.images = [];
    this.loadedCount = 0;

    this.bgColor = "#ffffff";

    this.offsetX = 0;
    this.offsetY = 0;

    this.drawW = 0;
    this.drawH = 0;

    this.progress = 0;

    this.sourceCanvas = document.createElement("canvas");
    this.sourceCtx = this.sourceCanvas.getContext("2d", { willReadFrequently: true });

    this.tempCanvas = document.createElement("canvas");
    this.tempCtx = this.tempCanvas.getContext("2d", { willReadFrequently: true });

    this.resizeCanvas();

    this.KEYS = [
      { b: 1.0, c: 1.0, s: 1.1, h: -10, r: 0.9, g: 1.0, b2: 1.2, gamma: 1.0 },
      { b: 0.9, c: 1.2, s: 0.9, h: 200, r: 0.8, g: 0.9, b2: 1.4, gamma: 1.05 },
      { b: 1.0, c: 1.1, s: 1.2, h: 20,  r: 1.2, g: 0.9, b2: 1.0, gamma: 1.0 },
      { b: 1.0, c: 1.1, s: 1.2, h: 100, r: 0.8, g: 1.2, b2: 0.8, gamma: 1.0 },
      { b: 1.1, c: 1.1, s: 1.1, h: 40,  r: 1.3, g: 1.1, b2: 0.7, gamma: 0.98 },
      { b: 1.0, c: 1.0, s: 1.1, h: -10, r: 0.9, g: 1.0, b2: 1.2, gamma: 1.0 }
    ];
  }

  resizeCanvas() {
    const view = this.canvas.parentElement;
    this.canvas.width = view.clientWidth;
    this.canvas.height = view.clientHeight;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  load(files, onProgress, onDone) {
    this.images = [];
    this.loadedCount = 0;
    this.progress = 0;

    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));

    if (!imageFiles.length) {
      this.clear();
      onProgress("no files");
      return;
    }

    const img = new Image();

    img.onload = () => {
      this.resizeCanvas();

      this.images = [img];
      this.loadedCount = 1;

      this.prepareImageSize(img);
      this.prepareSource(img);

      this.draw(0);

      onProgress("image ready");
      onDone();
    };

    img.src = URL.createObjectURL(imageFiles[0]);
  }

  prepareImageSize(img) {
    const viewW = this.canvas.width;
    const viewH = this.canvas.height;

    const scale = Math.max(viewW / img.width, viewH / img.height);

    this.drawW = Math.ceil(img.width * scale);
    this.drawH = Math.ceil(img.height * scale);

    this.offsetX = (viewW - this.drawW) / 2;
    this.offsetY = (viewH - this.drawH) / 2;
  }

  prepareSource(img) {
    this.sourceCanvas.width = this.drawW;
    this.sourceCanvas.height = this.drawH;

    this.tempCanvas.width = this.drawW;
    this.tempCanvas.height = this.drawH;

    this.sourceCtx.clearRect(0, 0, this.drawW, this.drawH);
    this.sourceCtx.drawImage(img, 0, 0, this.drawW, this.drawH);
  }

  getSmoothValue() {
    const smoothEl = document.getElementById("smooth");
    if (!smoothEl) return 2;

    const value = parseFloat(smoothEl.value);
    if (Number.isNaN(value)) return 2;

    return this.clamp(value, 1, 5);
  }

  getHueBias() {
    const hueEl = document.getElementById("hueBias");
    if (!hueEl) return 0;

    const value = parseFloat(hueEl.value);
    if (Number.isNaN(value)) return 0;

    return this.clamp(value, -180, 180);
  }

  clamp(x, min, max) {
    return Math.min(max, Math.max(min, x));
  }

  lerp(a, b, t) {
    return a * (1 - t) + b * t;
  }

  ease(x) {
    return x * x * (3 - 2 * x);
  }

  currentLook(p) {
    const n = this.KEYS.length - 1;
    const x = p * n;
    const i = Math.min(Math.floor(x), n - 1);
    const f = this.ease(x - i);

    const A = this.KEYS[i];
    const B = this.KEYS[i + 1];

    return {
      b: this.lerp(A.b, B.b, f),
      c: this.lerp(A.c, B.c, f),
      s: this.lerp(A.s, B.s, f),
      h: this.lerp(A.h, B.h, f),
      r: this.lerp(A.r, B.r, f),
      g: this.lerp(A.g, B.g, f),
      b2: this.lerp(A.b2, B.b2, f),
      gamma: this.lerp(A.gamma, B.gamma, f)
    };
  }

  draw(progress = this.progress) {
    this.progress = progress;

    this.clear();
    if (!this.images.length) return;

    const look = this.currentLook(progress);
    const smooth = this.getSmoothValue();
    const hueBias = this.getHueBias();

    const effectAmount = this.lerp(1.0, 0.25, (smooth - 1) / 4);

    const frame = this.sourceCtx.getImageData(0, 0, this.drawW, this.drawH);
    const d = frame.data;

    const { b, c, s, h, r, g, b2, gamma } = look;

    const finalHue = h + hueBias;

    const rad = finalHue * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

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

      R = (nr * r - 128) * c + 128;
      G = (ng * g - 128) * c + 128;
      B = (nb * b2 - 128) * c + 128;

      const gray = (R + G + B) / 3;

      R = gray + (R - gray) * s;
      G = gray + (G - gray) * s;
      B = gray + (B - gray) * s;

      R = 255 * Math.pow(this.clamp(R / 255, 0, 1), 1 / gamma);
      G = 255 * Math.pow(this.clamp(G / 255, 0, 1), 1 / gamma);
      B = 255 * Math.pow(this.clamp(B / 255, 0, 1), 1 / gamma);

      R = this.lerp(originalR, R, effectAmount);
      G = this.lerp(originalG, G, effectAmount);
      B = this.lerp(originalB, B, effectAmount);

      d[i] = this.clamp(R, 0, 255);
      d[i + 1] = this.clamp(G, 0, 255);
      d[i + 2] = this.clamp(B, 0, 255);
    }

    this.tempCtx.clearRect(0, 0, this.drawW, this.drawH);
    this.tempCtx.putImageData(frame, 0, 0);

    this.tempCtx.globalCompositeOperation = "overlay";
    this.tempCtx.fillStyle = this.bgColor;
    this.tempCtx.fillRect(0, 0, this.drawW, this.drawH);
    this.tempCtx.globalCompositeOperation = "source-over";

    const viewW = this.canvas.width;
    const viewH = this.canvas.height;

    this.offsetX = Math.min(0, Math.max(this.offsetX, viewW - this.drawW));
    this.offsetY = Math.min(0, Math.max(this.offsetY, viewH - this.drawH));

    this.ctx.drawImage(this.tempCanvas, this.offsetX, this.offsetY);
  }

  setBackground(color) {
    this.bgColor = color;
    this.draw(this.progress);
  }

  moveImage(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;

    const viewW = this.canvas.width;
    const viewH = this.canvas.height;

    this.offsetX = Math.min(0, Math.max(this.offsetX, viewW - this.drawW));
    this.offsetY = Math.min(0, Math.max(this.offsetY, viewH - this.drawH));

    this.draw(this.progress);
  }
}