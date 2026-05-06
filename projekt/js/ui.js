export class UI {
  constructor(engine) {
    this.engine = engine;

    this.running = false;
    this.raf = null;
    this.progress = 0;

    this.activeTool = "effect";

    this.draggingWindow = false;
    this.draggingX = false;
    this.draggingY = false;

    this.winOffsetX = 0;
    this.winOffsetY = 0;

    this.scrollPosX = 0;
    this.scrollPosY = 0;
  }

init() {
  this.bindLoad();
  this.bindTools();
  this.bindStartStop();
  this.bindExport();
  this.bindPalette();
  this.bindScrollbars();
  this.bindWindowDrag();
  this.bindInputs(); // 🔥 přidáno

  this.engine.clear();
}

  bindLoad() {
    const upload = document.getElementById("upload");
    const pickBtn = document.getElementById("pickBtn");

    pickBtn.onclick = () => upload.click();

    upload.onchange = e => {
      this.stop();

      this.progress = 0;
      this.scrollPosX = 0;
      this.scrollPosY = 0;

      this.engine.load(
        e.target.files,
     msg => {},
        () => {
          this.progress = 0;

          this.resetScrollbars();
          this.updateScrollbars();

          this.engine.draw(0);
        }
      );
    };
  }

bindTools() {
  const tools = document.querySelectorAll(".tool-cell");

  tools.forEach((btn) => {
    btn.onclick = () => {

      tools.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tool = btn.dataset.tool;

      // 🔥 PANEL SWITCH
      const panels = document.querySelectorAll(".panel");
      panels.forEach(p => p.classList.remove("active"));

      if (tool === "fm") {
        document.querySelector('[data-panel="fm"]').classList.add("active");

        this.engine2.mode = "fm";
        this.engine2.draw(this.progress);

      } else {
        document.querySelector('[data-panel="drift"]').classList.add("active");

        this.engine.draw(this.progress);
      }

    };
  });
}

  bindStartStop() {
    const start = document.getElementById("start");
    const stop = document.getElementById("stop");
    const speed = document.getElementById("speed");

    start.onclick = () => {
      if (!this.engine.images.length) {
        return;
      }

      if (this.running) return;

      this.running = true;
      this.loop(speed);
    };

    stop.onclick = () => this.stop();
  }

loop(speedEl) {
  if (!this.running) return;

  const speed = parseFloat(speedEl.value);

  this.progress += speed;
  if (this.progress > 1) this.progress = 0;

  // 🔥 KLÍČOVÝ FIX
  if (this.engine2.mode === "fm") {
    this.engine2.draw(this.progress);
  } else {
    this.engine.draw(this.progress);
  }

  this.raf = requestAnimationFrame(() => this.loop(speedEl));
}

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  bindExport() {
    const record = document.getElementById("record");

    record.onclick = () => {
      if (!this.engine.images.length) return;

      const stream = this.engine.canvas.captureStream(25);
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = "export.webm";
        link.click();
      };

      recorder.start();
      setTimeout(() => recorder.stop(), 10000);
    };
  }

  bindPalette() {
    document.querySelectorAll(".swatches i").forEach(swatch => {
      swatch.onclick = () => {
        const color = getComputedStyle(swatch).backgroundColor;

        document.querySelectorAll(".swatches i").forEach(s => {
          s.classList.remove("active");
        });

        swatch.classList.add("active");
        this.engine.setBackground(color);
      };
    });
  }

  bindScrollbars() {
    const scrollX = document.querySelector(".scroll-x span");
    const scrollY = document.querySelector(".scroll-y span");

    const trackX = document.querySelector(".scroll-x");
    const trackY = document.querySelector(".scroll-y");

    const viewport = document.querySelector(".canvas-area");

    this.updateScrollbars = () => {
      const viewW = viewport.clientWidth;
      const viewH = viewport.clientHeight;

      const contentW = this.engine.drawW;
      const contentH = this.engine.drawH;

      // 🔥 vždy viditelné (Paint chování)
      trackX.style.display = "block";
      trackY.style.display = "block";

      // 🔥 když není obrázek
      if (!contentW || !contentH) {
        scrollX.style.width = "60px";
        scrollY.style.height = "60px";

        scrollX.style.transform = "translateX(0px)";
        scrollY.style.transform = "translateY(0px)";
        return;
      }

      const overflowX = Math.max(0, contentW - viewW);
      const overflowY = Math.max(0, contentH - viewH);

      const trackW = trackX.clientWidth;
      const trackH = trackY.clientHeight;

      const minSize = 20;

      // velikost thumbu
      const thumbW = overflowX > 0
        ? Math.max(minSize, (viewW / contentW) * trackW)
        : trackW;

      const thumbH = overflowY > 0
        ? Math.max(minSize, (viewH / contentH) * trackH)
        : trackH;

      scrollX.style.width = thumbW + "px";
      scrollY.style.height = thumbH + "px";

      // sync pozice
      if (overflowX > 0) {
        const maxX = trackW - thumbW;
        const ratioX = -this.engine.offsetX / overflowX;
        this.scrollPosX = ratioX * maxX;
      } else {
        this.scrollPosX = 0;
      }

      if (overflowY > 0) {
        const maxY = trackH - thumbH;
        const ratioY = -this.engine.offsetY / overflowY;
        this.scrollPosY = ratioY * maxY;
      } else {
        this.scrollPosY = 0;
      }

      scrollX.style.transform = `translateX(${this.scrollPosX}px)`;
      scrollY.style.transform = `translateY(${this.scrollPosY}px)`;
    };

    this.updateScrollbars();

    scrollX.addEventListener("mousedown", e => {
      this.draggingX = true;
      e.preventDefault();
    });

    scrollY.addEventListener("mousedown", e => {
      this.draggingY = true;
      e.preventDefault();
    });

    window.addEventListener("mousemove", e => {
      const viewW = viewport.clientWidth;
      const viewH = viewport.clientHeight;

      const overflowX = Math.max(0, this.engine.drawW - viewW);
      const overflowY = Math.max(0, this.engine.drawH - viewH);

      if (this.draggingX && overflowX > 0) {
        const max = trackX.clientWidth - scrollX.clientWidth;

        this.scrollPosX += e.movementX;
        this.scrollPosX = Math.max(0, Math.min(max, this.scrollPosX));

        scrollX.style.transform = `translateX(${this.scrollPosX}px)`;

        const ratio = this.scrollPosX / max;
        this.engine.offsetX = -(overflowX * ratio);
        this.engine.draw(this.progress);
      }

      if (this.draggingY && overflowY > 0) {
        const max = trackY.clientHeight - scrollY.clientHeight;

        this.scrollPosY += e.movementY;
        this.scrollPosY = Math.max(0, Math.min(max, this.scrollPosY));

        scrollY.style.transform = `translateY(${this.scrollPosY}px)`;

        const ratio = this.scrollPosY / max;
        this.engine.offsetY = -(overflowY * ratio);
        this.engine.draw(this.progress);
      }
    });

    window.addEventListener("mouseup", () => {
      this.draggingX = false;
      this.draggingY = false;
    });
  }

  resetScrollbars() {
    this.scrollPosX = 0;
    this.scrollPosY = 0;
  }

    bindWindowDrag() {
    const win = document.getElementById("window");
    const dragbar = document.getElementById("dragbar");

    dragbar.addEventListener("mousedown", e => {
      this.draggingWindow = true;

      const rect = win.getBoundingClientRect();

      this.winOffsetX = e.clientX - rect.left;
      this.winOffsetY = e.clientY - rect.top;

      win.style.position = "fixed";
      win.style.left = rect.left + "px";
      win.style.top = rect.top + "px";

      e.preventDefault();
    });

    window.addEventListener("mousemove", e => {
      if (!this.draggingWindow) return;

      win.style.left = (e.clientX - this.winOffsetX) + "px";
      win.style.top = (e.clientY - this.winOffsetY) + "px";
    });

    window.addEventListener("mouseup", () => {
      this.draggingWindow = false;
    });
  }

bindInputs() {

  // 🔵 DRIFT slider
  const hue = document.getElementById("hueBias");

  if (hue) {
    hue.oninput = () => {
      this.engine.draw(this.progress);
    };
  }

  // 🔴 FM threshold slider
  const fmThreshold = document.getElementById("fmThreshold");

  if (fmThreshold) {
    fmThreshold.oninput = () => {
      if (!this.engine2 || !this.engine2.fm) return;
      this.engine2.fm.threshold = parseFloat(fmThreshold.value);
      this.engine2.draw(this.progress);
    };
  }
// 🔴 FM smooth slider
const fmSmooth = document.getElementById("fmSmooth");

if (fmSmooth) {
  fmSmooth.oninput = () => {
    if (!this.engine2 || !this.engine2.fm) return;

    this.engine2.fm.smooth = parseFloat(fmSmooth.value);

    this.engine2.draw(this.progress);
  };
}


  // 🔴 KNOBY – OPRAVENÁ VERZE
  let activeKnob = null;

  // každému knobu uložíme vlastní hodnotu
  const valueMap = new WeakMap();

  document.querySelectorAll(".knob").forEach(knob => {

    valueMap.set(knob, 0);

    knob.addEventListener("mousedown", (e) => {
      activeKnob = knob;
      e.preventDefault();
    });

  });

  window.addEventListener("mouseup", () => {
    activeKnob = null;
  });

  window.addEventListener("mousemove", (e) => {
    if (!activeKnob) return;
    if (!this.engine2 || !this.engine2.fm) return;

    let value = valueMap.get(activeKnob);

    value -= e.movementY * 0.005;
    value = Math.max(0, Math.min(1, value));

    valueMap.set(activeKnob, value);

    // 🔄 otočení knobu
    const dial = activeKnob.querySelector(".dial");
    if (dial) {
      dial.style.transform = `rotate(${value * 270 - 135}deg)`;
    }

    // 🔌 napojení na FM
    const type = activeKnob.dataset.knob;

    if (type === "freq") this.engine2.fm.freq = value * 0.1;
    if (type === "depth") this.engine2.fm.depth = value * 80;
    if (type === "angle") this.engine2.fm.angle = value * Math.PI;
if (type === "flow") this.engine2.fm.flow = value;
if (type === "blend") this.engine2.fm.blend = value;
if (type === "colorize") this.engine2.fm.colorize = value;
    this.engine2.draw(this.progress);
  });

}
}