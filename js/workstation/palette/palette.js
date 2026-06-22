import {
  getPaletteColors
}
from "./colors.js";



export function buildPalette(ui){

  const swatches =
    document.querySelector(
      ".swatches"
    );

  if(!swatches){
    return;
  }

  swatches.innerHTML = "";



  const colors =
    getPaletteColors();

  ui.paletteColors =
    colors;

  function applyColor(color,swatch){

    const mode =
      ui.effects.mode;

    const module =
      ui.effects.modules[mode];

    if(!module?.state){
      return;
    }

    module.state.paletteColor =
      color;

    if("paletteEditActive" in module.state){
      module.state.paletteEditActive =
        true;
    }

    if(ui.effects.active !== module){
      ui.effects.setMode(mode);
    }

    if(ui.root){

      ui.root.dataset.paletteTarget =
        mode;

      ui.root.dataset.paletteColor =
        color;

    }

    swatches
      .querySelectorAll("i")
      .forEach(item => {

        item.classList.toggle(
          "active",
          item === swatch
        );

      });

    if(typeof ui.renderNow === "function"){
      ui.renderNow();
    }else{
      ui.queueRender();
    }

  }



  swatches.onpointerdown = event => {

    const swatch =
      event.target.closest("i");

    if(
      !swatch ||
      !swatches.contains(swatch)
    ){
      return;
    }

    event.preventDefault();

    applyColor(
      swatch.dataset.color,
      swatch
    );

  };



  colors.forEach(color => {

    const swatch =
      document.createElement(
        "i"
      );



    swatch.style.background =
      color;

    swatch.dataset.color =
      color;



    swatch.addEventListener(
      "click",
      () => {

        applyColor(
          color,
          swatch
        );

      }
    );



    swatches.appendChild(
      swatch
    );

  });

}
