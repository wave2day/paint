export function bindPalette(ui) {

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

        ui.engine.setBackground(color);

        if (ui.engine2) {
          ui.queueRender();
        }
      };
    });
}