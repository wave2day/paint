import { bindWindowDrag }
  from "./ui/windowDrag.js";
import { bindScrollbars }
  from "./ui/scrollbars.js";
import { bindLoad }
  from "./ui/loadUI.js";


export class UI {

  constructor(engine) {

    this.engine = engine;
    
    this.running = false;
    this.raf = null;

    this.progress = 0;

    this.draggingWindow = false;
    this.draggingX = false;
    this.draggingY = false;

    this.winOffsetX = 0;
    this.winOffsetY = 0;

    this.scrollPosX = 0;
    this.scrollPosY = 0;
  }

  init() {

    bindLoad(this);
    this.bindTools();
    this.bindStartStop();
    this.bindExport();
    this.bindPalette();
    bindScrollbars(this);
    bindWindowDrag(this);
    this.bindInputs();

    this.engine.clear();
  }


  bindTools() {

    const driftPanel =
      document.querySelector('[data-panel="drift"]');

    const fmPanel =
      document.querySelector('[data-panel="fm"]');

    if (driftPanel) {
      driftPanel.classList.add("active");
    }

    if (fmPanel) {
      fmPanel.classList.remove("active");
    }

    const tools =
      document.querySelectorAll(".tool-cell");

    tools.forEach((btn) => {

      btn.onclick = () => {

        tools.forEach(b => {
          b.classList.remove("active");
        });

        btn.classList.add("active");

        const tool = btn.dataset.tool;

        document
          .querySelectorAll(".panel")
          .forEach(panel => {
            panel.classList.remove("active");
          });

        if (tool === "fm") {

          if (this.engine2) {
            this.engine2.mode = "fm";
          }

          const panel =
            document.querySelector('[data-panel="fm"]');

          if (panel) {
            panel.classList.add("active");
          }

          if (this.engine2) {
            this.engine2.draw(this.progress);
          }

          return;
        }

        if (this.engine2) {
          this.engine2.mode = "drift";
        }

        const panel =
          document.querySelector('[data-panel="drift"]');

        if (panel) {
          panel.classList.add("active");
        }

        this.engine2.draw(this.progress);
      };
    });
  }

  bindStartStop() {

    const start =
      document.getElementById("start");

    const stop =
      document.getElementById("stop");

    const speed =
      document.getElementById("speed");

    if (!start || !stop || !speed) return;

    start.onclick = () => {

      if (!this.engine.images.length) {
        return;
      }

      if (this.running) {
        return;
      }

      this.running = true;

      this.loop(speed);
    };

    stop.onclick = () => {
      this.stop();
    };
  }

  loop(speedEl) {

    if (!this.running) return;

    const speed =
      parseFloat(speedEl.value);

    this.progress += speed;

    if (this.progress > 1) {
      this.progress = 0;
    }

this.engine2.draw(this.progress);

    this.raf =
      requestAnimationFrame(() => {
        this.loop(speedEl);
      });
  }

  stop() {

    this.running = false;

    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
  }

  bindExport() {

    const record =
      document.getElementById("record");

    if (!record) return;

    record.onclick = () => {

      if (!this.engine.images.length) {
        return;
      }

      const stream =
        this.engine.canvas.captureStream(25);

      const recorder =
        new MediaRecorder(stream);

      const chunks = [];

      recorder.ondataavailable = (e) => {

        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {

        const blob =
          new Blob(chunks, {
            type: "video/webm"
          });

        const link =
          document.createElement("a");

        link.href =
          URL.createObjectURL(blob);

        link.download =
          "export.webm";

        link.click();
      };

      recorder.start();

      setTimeout(() => {
        recorder.stop();
      }, 10000);
    };
  }

  bindPalette() {

    document
      .querySelectorAll(".swatches i")
      .forEach(swatch => {

        swatch.onclick = () => {

          const color =
            getComputedStyle(swatch).backgroundColor;

          document
            .querySelectorAll(".swatches i")
            .forEach(s => {
              s.classList.remove("active");
            });

          swatch.classList.add("active");

          if (
  this.engine2 &&
  this.engine2.mode === "drift"
) {
  this.engine.setBackground(color);
}
        };
      });
  }


resetScrollbars() {

    this.scrollPosX = 0;
    this.scrollPosY = 0;
  }


  bindInputs() {

    const hue =
      document.getElementById("hueBias");

    if (hue) {

      hue.oninput = () => {
        this.engine2.draw(this.progress);
      };
    }

    const fmThreshold =
      document.getElementById("fmThreshold");

    if (fmThreshold) {

      fmThreshold.oninput = () => {

        if (!this.engine2?.fm) return;

        this.engine2.fm.threshold =
          parseFloat(fmThreshold.value);

        this.engine2.draw(this.progress);
      };
    }

    const fmSmooth =
      document.getElementById("fmSmooth");

    if (fmSmooth) {

      fmSmooth.oninput = () => {

        if (!this.engine2?.fm) return;

        this.engine2.fm.smooth =
          parseFloat(fmSmooth.value);

        this.engine2.draw(this.progress);
      };
    }

    let activeKnob = null;

    const valueMap =
      new WeakMap();

document
  .querySelectorAll(".knob")
  .forEach(knob => {

    const initial =
      parseFloat(knob.dataset.value || "0.5");

    valueMap.set(knob, initial);

    const dial =
      knob.querySelector(".dial");

    if (dial) {
      dial.style.transform =
        `rotate(${initial * 270 - 135}deg)`;
    }

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
      if (!this.engine2?.fm) return;

      let value =
        valueMap.get(activeKnob);

      value -= e.movementY * 0.005;

      value =
        Math.max(0, Math.min(1, value));

      valueMap.set(activeKnob, value);
      activeKnob.dataset.value = value;
      const dial =
        activeKnob.querySelector(".dial");

      if (dial) {

        dial.style.transform =
          `rotate(${value * 270 - 135}deg)`;
      }

      const type =
        activeKnob.dataset.knob;

      if (type === "freq") {
        this.engine2.fm.freq = value * 0.1;
      }

      if (type === "depth") {
        this.engine2.fm.depth = value * 80;
      }

      if (type === "angle") {
        this.engine2.fm.angle =
          value * Math.PI;
      }

      if (type === "flow") {
        this.engine2.fm.flow = value;
      }

      if (type === "blend") {
        this.engine2.fm.blend = value;
      }

      if (type === "colorize") {
        this.engine2.fm.colorize = value;
      }

      this.engine2.draw(this.progress);
    });
  }
}
