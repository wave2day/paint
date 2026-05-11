export function bindTransport(ui) {

  const start =
    document.getElementById("start");

  const stop =
    document.getElementById("stop");

  const speed =
    document.getElementById("speed");

  if (!start || !stop || !speed) return;

  start.onclick = () => {

    if (!ui.engine.images.length) {
      return;
    }

    if (ui.running) {
      return;
    }

    ui.running = true;

    loop(ui, speed);
  };

  stop.onclick = () => {
    stopTransport(ui);
  };
}

export function loop(ui, speedEl) {

  if (!ui.running) return;

  const speed =
    parseFloat(speedEl.value);

  ui.progress += speed;

  if (ui.progress > 1) {
    ui.progress = 0;
  }

  ui.engine2.draw(ui.progress);

  ui.raf =
    requestAnimationFrame(() => {
      loop(ui, speedEl);
    });
}

export function stopTransport(ui) {

  ui.running = false;

  if (ui.raf) {
    cancelAnimationFrame(ui.raf);
  }
}
