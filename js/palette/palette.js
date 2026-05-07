import { COLORS } from "./colors.js";

export function buildPalette(engine){

  const swatches = document.querySelector(".swatches");

  if(!swatches) return;

  swatches.innerHTML = "";

  COLORS.forEach(color => {

    const swatch = document.createElement("i");

    swatch.style.background = color;

    swatch.addEventListener("click", () => {
      engine.setBackground(color);
    });

    swatches.appendChild(swatch);

  });

}
