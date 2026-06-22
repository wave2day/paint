export function createPaletteDock(){

  return {

    root:
      document.querySelector(
        ".palette"
      ),

    swatches:
      document.querySelector(
        ".swatches"
      )

  };

}