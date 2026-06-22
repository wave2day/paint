import { Renderer }
from "./renderer/renderer.js";

import { ImageCore }
from "./core/ImageCore.js";

import { EffectRouter }
from "./router/EffectRouter.js?v=fx-line-color-typography-1";

import { buildPalette }
from "./palette/palette.js";

import { setupUI }
from "./ui/setupUI.js";

import { getLayoutRefs }
from "./layout/getLayoutRefs.js";



export class Workstation{

  constructor(){

    console.log(
      "WORKSTATION RUNNING"
    );



    /* =========================
       ROOT
    ========================== */

    this.root =
      document.getElementById(
        "workstation"
      );



    /* =========================
       LAYOUT REFS
    ========================== */

    Object.assign(

      this,

      getLayoutRefs()

    );



    /* =========================
       SCROLL STATE
    ========================== */

    this.draggingX =
      false;

    this.draggingY =
      false;

    this.scrollPosX =
      0;

    this.scrollPosY =
      0;



    /* =========================
       CORE
    ========================== */

    this.core =
      new ImageCore(
        this.canvas
      );



    /* =========================
       EFFECT ROUTER
    ========================== */

    this.effects =
      new EffectRouter(
        this.core
      );



    /* =========================
       RENDERER
    ========================== */

    this.renderer =
      new Renderer(
        this
      );



    /* =========================
       PALETTE
    ========================== */

    buildPalette(
      this
    );



    /* =========================
       UI
    ========================== */

    setupUI(
      this
    );



    /* =========================
       INIT
    ========================== */

    this.core.clear();

  }



  /* =========================
     RENDER
  ========================== */

  queueRender(){

    this.renderer.render();

  }

}



/* =========================
   BOOTSTRAP
========================= */

const workstationRoot =

  document.getElementById(
    "workstation"
  );



if(workstationRoot){

  new Workstation();

}
