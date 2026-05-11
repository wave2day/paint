import { COLORS } from "./colors.js";

export function buildPalette(engine){

  const swatches = document.querySelector(".swatches");

  if(!swatches) return;

  swatches.innerHTML = "";

  COLORS.forEach(color => {

    const swatch = document.createElement("i");

    swatch.style.background = color;

 swatch.addEventListener("click", () => {

  const mode =
    engine.engine2.mode;

  const module =
    engine.engine2.modules[mode];

  if (!module?.state) return;

  module.state.paletteColor =
    color;

  engine.engine2.draw(0);
});

    swatches.appendChild(swatch);

  });

}
