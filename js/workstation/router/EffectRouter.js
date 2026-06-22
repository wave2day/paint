import { FM }
from "../effects/fm/FM.js?v=fx-line-color-typography-1";

import { DriftEngine }
from "../effects/drift/DriftEngine.js?v=ambient-flow-2";

import { RgbSplit }
from "../effects/rgb/RgbSplit.js?v=render-throttle-rgb-1";

import { DitherEngine }
from "../effects/dither/DitherEngine.js";

import { FeedbackEngine }
from "../effects/feedback/FeedbackEngine.js?v=feedback-transform-direct-2-noise-modes-2";

import { ArtifactEngine }
from "../effects/artifact/ArtifactEngine.js?v=artifact-engine-mvp-1";



class PassthroughEffect{

  constructor(outputKey){

    this.outputKey =
      outputKey;

    this.state =
      {};

  }

  draw(core){

    const output =
      core.outputs[
        this.outputKey
      ];

    const w =
      core.drawW;

    const h =
      core.drawH;

    if(!output || !w || !h){
      return;
    }

    output.ctx.clearRect(
      0,
      0,
      w,
      h
    );

    if(core.sourcePixels){

      output.ctx.putImageData(
        core.sourcePixels,
        0,
        0
      );

    }

  }

  serialize(){

    return {
      type:this.outputKey
    };

  }

  deserialize(){}

}



export class EffectRouter{

  constructor(core){

    this.core =
      core;



    /* =========================
       MODULES
    ========================== */

    this.modules = {

      drift:
        new DriftEngine(),

	      fm:
	        new PassthroughEffect(
	          "fm"
	        ),
	
	      ar:
	        new ArtifactEngine(),
	
	      fx:
	        new FM({
          outputKey:"fx"
        }),

      rgb:
        new RgbSplit(),

      dither:
        new DitherEngine(),

      feedback:
        new FeedbackEngine()


    };



    /* =========================
       ACTIVE
    ========================== */

    this.mode =
      "drift";

  }



  /* =========================
     ACTIVE MODULE
  ========================== */

  get active(){

    return this.modules[
      this.mode
    ];

  }



  /* =========================
     SET MODE
  ========================== */

  setMode(mode){

    if(
      !this.modules[mode]
    ){
      return;
    }

    this.mode =
      mode;

  }



  /* =========================
     DRAW
  ========================== */

  draw(progress = 0){

    const module =
      this.active;

    if(!module){
      return;
    }

    module.draw(

      this.core,
      progress

    );

  }

}
