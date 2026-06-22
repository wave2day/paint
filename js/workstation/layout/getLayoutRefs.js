export function getLayoutRefs(){

  return {

    workspace:
      document.querySelector(
        ".workspace"
      ),

    toolbar:
      document.querySelector(
        ".toolbar"
      ),

    canvasShell:
      document.querySelector(
        ".canvas-shell"
      ),

    canvasArea:
      document.querySelector(
        ".canvas-area"
      ),

    canvas:
      document.getElementById(
        "canvas"
      ),

    trackX:
      document.querySelector(
        ".scroll-x"
      ),

    trackY:
      document.querySelector(
        ".scroll-y"
      ),

    scrollX:
      document.querySelector(
        ".scroll-x span"
      ),

    scrollY:
      document.querySelector(
        ".scroll-y span"
      ),

    palette:
      document.querySelector(
        ".palette"
      ),

    swatches:
      document.querySelector(
        ".swatches"
      )

  };

}
