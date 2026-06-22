import { Renderer }
from "./renderer/renderer.js?v=scrollbar-load-refresh-1";

import { ImageCore }
from "./core/ImageCore.js";

import { EffectRouter }
from "./router/EffectRouter.js?v=ambient-flow-2";

import { buildPalette }
from "./palette/palette.js?v=render-throttle-rgb-1";

import {
  setPaletteColors
}
from "./palette/colors.js";

import { setupUI }
from "./ui/setupUI.js?v=floating-effect-block-snap-1";

import { getLayoutRefs }
from "./layout/getLayoutRefs.js";

import { HistoryManager }
from "./history/HistoryManager.js";



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



    console.log(
      "EFFECT ROUTER:",
      this.effects
    );



    /* =========================
       RENDERER
    ========================== */

    this.renderer =
      new Renderer(
        this
      );



    /* =========================
       HISTORY
    ========================== */

    this.history =

      new HistoryManager(
        this
      );

    this.renderQueued =
      false;



    /* =========================
       PALETTE
    ========================== */

    buildPalette(
      this
    );

    window.addEventListener(
      "palette:apply",
      event => {
        const colors =
          event.detail?.full;

        setPaletteColors(
          colors
        );

        buildPalette(
          this
        );
      }
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



    /* =========================
       DEFAULT TOOL
    ========================== */

    const defaultTool =

      document.querySelector(
        '.tool-cell[data-tool="drift"]'
      );



    if(defaultTool){

      defaultTool.click();

    }

  }



  /* =========================
     RENDER
  ========================== */

  queueRender(){

    if(this.renderQueued){
      return;
    }

    this.renderQueued =
      true;

    requestAnimationFrame(() => {

      this.renderQueued =
        false;

      this.renderNow();

    });

  }



  renderNow(){

    this.effects.draw(
      this.core.progress
    );



    const mode =
      this.effects.mode;



    const output =
      this.core.outputs[mode];



    if(
      output &&
      this.core.drawW &&
      this.core.drawH
    ){

      this.renderer.image =
        output.canvas;



      this.renderer.viewport.imageWidth =
        this.core.drawW;



      this.renderer.viewport.imageHeight =
        this.core.drawH;

    }



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
