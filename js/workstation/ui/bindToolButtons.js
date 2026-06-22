import { runToolbar }
from "../toolbar/toolbarRuntime.js?v=floating-effect-block-snap-1";



export function bindToolButtons(
  workstation
){

  const buttons =

    document.querySelectorAll(
      ".tool-cell"
    );



  buttons.forEach(button => {

    button.addEventListener(

      "click",

      () => {

        runToolbar(

          workstation,
          button,
          buttons

        );

      }

    );

  });

}
