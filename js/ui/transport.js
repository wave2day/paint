import { appState }
  from "../state/appState.js";


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

    if (appState.transport.running) {
      return;
    }

    appState.transport.running = true;

    loop(ui, speed);
  };

  stop.onclick = () => {
    stopTransport(ui);
  };
}


export function loop(ui, speedEl) {

  if (!appState.transport.running) {
    return;
  }

  const speed =
    parseFloat(speedEl.value);

  appState.transport.progress += speed;

  if (
    appState.transport.progress > 1
  ) {

    appState.transport.progress = 0;
  }

  ui.engine2.draw(
    appState.transport.progress
  );

  ui.raf =
    requestAnimationFrame(() => {
      loop(ui, speedEl);
    });
}


export function stopTransport(ui) {

  appState.transport.running = false;

  if (ui.raf) {
    cancelAnimationFrame(ui.raf);
  }
}
