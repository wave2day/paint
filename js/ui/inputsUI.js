export function bindInputs(ui) {

  const hue =
    document.getElementById("hueBias");

  if (hue) {

    hue.oninput = () => {
      ui.queueRender();
    };
  }

  const fmThreshold =
    document.getElementById("fmThreshold");

  if (fmThreshold) {

    fmThreshold.oninput = () => {

      if (!ui.engine2?.fm) return;

      ui.engine2.fm.threshold =
        parseFloat(fmThreshold.value);

      ui.queueRender();
    };
  }

  const fmSmooth =
    document.getElementById("fmSmooth");

  if (fmSmooth) {

    fmSmooth.oninput = () => {

      if (!ui.engine2?.fm) return;

      ui.engine2.fm.smooth =
        parseFloat(fmSmooth.value);

      ui.queueRender();
    };
  }
}