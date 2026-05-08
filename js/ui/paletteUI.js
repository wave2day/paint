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

        if (
          ui.engine2 &&
          ui.engine2.mode === "drift"
        ) {

          ui.engine.setBackground(color);

          ui.engine2.draw(ui.progress);
        }
      };
    });
}
