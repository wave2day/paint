export class Engine {

  constructor(canvas) {

    this.canvas = canvas;

    this.ctx =
      canvas.getContext(
        "2d",
        { willReadFrequently: true }
      );

    this.images = [];

    this.loadedCount = 0;

    this.bgColor = "#ffffff";

    this.offsetX = 0;
    this.offsetY = 0;

    this.drawW = 0;
    this.drawH = 0;

    this.progress = 0;

    this.sourceCanvas =
      document.createElement("canvas");

    this.sourceCtx =
      this.sourceCanvas.getContext(
        "2d",
        { willReadFrequently: true }
      );

    this.tempCanvas =
      document.createElement("canvas");

    this.tempCtx =
      this.tempCanvas.getContext(
        "2d",
        { willReadFrequently: true }
      );

    this.resizeCanvas();
  }

  resizeCanvas() {

    const view =
      this.canvas.parentElement;

    this.canvas.width =
      view.clientWidth;

    this.canvas.height =
      view.clientHeight;
  }

  clear() {

    this.ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  load(files, onProgress, onDone) {

    this.images = [];

    this.loadedCount = 0;

    this.progress = 0;

    const imageFiles =
      Array.from(files)
        .filter(f =>
          f.type.startsWith("image/")
        );

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

      onProgress("image ready");

      onDone();
    };

    img.src =
      URL.createObjectURL(
        imageFiles[0]
      );
  }

  prepareImageSize(img) {

    const viewW =
      this.canvas.width;

    const viewH =
      this.canvas.height;

    const scale =
      Math.max(
        viewW / img.width,
        viewH / img.height
      );

    this.drawW =
      Math.ceil(img.width * scale);

    this.drawH =
      Math.ceil(img.height * scale);

    this.offsetX =
      (viewW - this.drawW) / 2;

    this.offsetY =
      (viewH - this.drawH) / 2;
  }

  prepareSource(img) {

    this.sourceCanvas.width =
      this.drawW;

    this.sourceCanvas.height =
      this.drawH;

    this.tempCanvas.width =
      this.drawW;

    this.tempCanvas.height =
      this.drawH;

    this.sourceCtx.clearRect(
      0,
      0,
      this.drawW,
      this.drawH
    );

    this.sourceCtx.drawImage(
      img,
      0,
      0,
      this.drawW,
      this.drawH
    );
  }

  setBackground(color) {

    this.bgColor = color;
  }

  clampOffsets() {

    const viewW =
      this.canvas.width;

    const viewH =
      this.canvas.height;

    this.offsetX =
      Math.min(
        0,
        Math.max(
          this.offsetX,
          viewW - this.drawW
        )
      );

    this.offsetY =
      Math.min(
        0,
        Math.max(
          this.offsetY,
          viewH - this.drawH
        )
      );
  }

  moveImage(dx, dy) {

    this.offsetX += dx;

    this.offsetY += dy;

    this.clampOffsets();
  }
}