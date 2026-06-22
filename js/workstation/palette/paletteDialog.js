import {
  openDialogWindow,
  closeDialogWindow
}
from "../../window/dialogWindow.js";

import {
  createPaletteBuilder
}
from "./paletteBuilder.js";



export function initPaletteDialog(){
  const trigger =
    document.getElementById("openPalette");

  if(!trigger) return;

  trigger.addEventListener("click", () => {
    const content =
      createPaletteBuilder({
        onApply(){
          closeDialogWindow("palette-builder");
        },
        onCancel(){
          closeDialogWindow("palette-builder");
        }
      });

    openDialogWindow({
      id:"palette-builder",
      title:"Palette Builder",
      content,
      left:230,
      top:130
    });
  });
}
