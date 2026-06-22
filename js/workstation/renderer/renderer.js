import { Viewport }
from "./viewport.js";

import { renderCanvas }
from "./canvas.js";

import { updateScrollbars }
from "./scrollbars.js";



export class Renderer{

  constructor(workstation){

    this.workstation =
      workstation;



    this.canvas =
      workstation.canvas;

    this.ctx =
      this.canvas.getContext(
        "2d"
      );



    this.viewport =
      new Viewport();



    this.image = null;



    this.resize();



    this.observer =
      new ResizeObserver(() => {

        this.resize();

      });



    this.observer.observe(
      workstation.canvasShell
    );

  }



  resize(){

    const rect =
      this.workstation.canvasArea
      .getBoundingClientRect();



    this.canvas.width =
      rect.width;

    this.canvas.height =
      rect.height;



    this.viewport.viewportWidth =
      rect.width;

    this.viewport.viewportHeight =
      rect.height;



    renderCanvas(this);

    updateScrollbars(this);

  }



  render(){

    renderCanvas(this);

    updateScrollbars(this);

  }

}
