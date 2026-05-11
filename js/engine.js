import { createBuffer }
  from "./engine/buffers/createBuffer.js";

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
    this.sourcePixels = null;

    this.sourceBuffer =
      createBuffer();

    this.tempBuffer =
      createBuffer();

      this.outputs = {

  drift:
    createBuffer(),

  fm:
    createBuffer()
};

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

    this.sourceBuffer.canvas.width =
      this.drawW;

    this.sourceBuffer.canvas.height =
      this.drawH;

    this.tempBuffer.canvas.width =
  this.drawW;

this.tempBuffer.canvas.height =
  this.drawH;

this.outputs.drift.canvas.width =
  this.drawW;

this.outputs.drift.canvas.height =
  this.drawH;

this.outputs.fm.canvas.width =
  this.drawW;

this.outputs.fm.canvas.height =
  this.drawH;

    this.sourceBuffer.ctx.clearRect(
      0,
      0,
      this.drawW,
      this.drawH
    );

    this.sourceBuffer.ctx.drawImage(
      img,
      0,
      0,
      this.drawW,
      this.drawH
    );
            
    this.sourcePixels =
  this.sourceBuffer.ctx.getImageData(
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