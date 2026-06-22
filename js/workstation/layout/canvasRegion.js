export function createCanvasRegion(){

  return {

    shell:
      document.querySelector(
        ".canvas-shell"
      ),

    area:
      document.querySelector(
        ".canvas-area"
      ),

    canvas:
      document.getElementById(
        "canvas"
      ),

    scrollX:
      document.querySelector(
        ".scroll-x"
      ),

    scrollY:
      document.querySelector(
        ".scroll-y"
      ),

    thumbX:
      document.querySelector(
        ".scroll-x span"
      ),

    thumbY:
      document.querySelector(
        ".scroll-y span"
      ),

    corner:
      document.querySelector(
        ".scroll-corner"
      )

  };

}