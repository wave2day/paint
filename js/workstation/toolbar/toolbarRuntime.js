import { createDriftPanel }
from "../effects/drift/driftPanel.js?v=drift-v2-circular-knobs-1-switcher-wide-1";

import { createFMPanel }
from "../effects/fm/fmPanel.js?v=fx-line-color-typography-1-switcher-wide-1-title-1";

import { createRgbPanel }
from "../effects/rgb/rgbPanel.js?v=rgb-circular-knobs-1-switcher-wide-1";

import { createDitherPanel }
from "../effects/dither/ditherPanel.js?v=dither-circular-knobs-1-switcher-wide-1";

import { createFeedbackPanel }
from "../effects/feedback/feedbackPanel.js?v=feedback-primary-preset-bottom-1";

import { createArtifactPanel }
from "../effects/artifact/artifactPanel.js?v=artifact-panel-mvp-1";

import { bindDriftControls }
from "../controls/bindDriftControls.js?v=drift-v2-circular-knobs-1-switcher-wide-1";

import { bindFMControls }
from "../controls/bindFMControls.js?v=fx-line-color-typography-1-switcher-wide-1";

import { bindRgbControls }
from "../controls/bindRgbControls.js?v=rgb-circular-knobs-1-switcher-wide-1";

import { bindDitherControls }
from "../controls/bindDitherControls.js?v=dither-circular-knobs-1-switcher-wide-1";

import { bindFeedbackControls }
from "../controls/bindFeedbackControls.js?v=feedback-circular-knobs-1-switcher-wide-1";

import { bindArtifactControls }
from "../controls/bindArtifactControls.js?v=artifact-controls-mvp-1";

import { bindKnobs }
from "../controls/bindKnobs.js";

import { bindTransport }
from "../controls/bindTransport.js";

import { bindFloatingEffectBlocks }
from "../ui/bindFloatingEffectBlocks.js?v=floating-effect-block-snap-1";



function createFMRebuildPanel(){

  return `

    <div class="panel active"
         data-panel="fm">

      <div class="effect-panel-layout fm-panel">

        <div class="fm-section">
          <h3 class="section-title">FM</h3>
        </div>

      </div>

    </div>

  `;

}



function retagFMPanelAsFX(toolOptions){

  toolOptions
    .querySelectorAll("[data-effect-block]")
    .forEach(block => {

      const id =
        block.dataset.effectBlock;

      if(id?.startsWith("fm-")){
        block.dataset.effectBlock =
          id.replace(/^fm-/, "fx-");
      }

    });

  const panel =
    toolOptions.querySelector(
      '[data-panel="fm"]'
    );

  if(panel){
    panel.dataset.panel =
      "fx";
  }

}



export function runToolbar(

  workstation,
  button,
  buttons

){

  const tool =

    button.dataset.tool;



  const toolOptions =

    document.querySelector(
      ".tool-options"
    );



  if(
    !toolOptions
  ){
    return;
  }



  /* =========================
     ACTIVE BUTTON
  ========================== */

  buttons.forEach(btn => {

    btn.classList.remove(
      "active"
    );

  });



  button.classList.add(
    "active"
  );



  /* =========================
     MODE
  ========================== */

  workstation.effects.setMode(
    tool
  );



  /* =========================
     RESET
  ========================== */

  toolOptions.innerHTML = "";



  /* =========================
     DRIFT
  ========================== */

  if(tool === "drift"){

    toolOptions.innerHTML =

      createDriftPanel();



    bindDriftControls(
      workstation
    );



    bindTransport(
      workstation
    );

  }



  /* =========================
     FM
  ========================== */

	  if(tool === "fm"){
	
	    toolOptions.innerHTML =
	
	      createFMRebuildPanel();
	
	  }
	
	
	
	  /* =========================
	     ARTIFACT
	  ========================== */
	
	  if(tool === "ar"){
	
	    toolOptions.innerHTML =
	
	      createArtifactPanel();
	
	
	
	    bindArtifactControls(
	      workstation
	    );
	
	  }
	
	
	
	  /* =========================
	     FX
	  ========================== */

  if(tool === "fx"){

    toolOptions.innerHTML =

      createFMPanel();



    retagFMPanelAsFX(
      toolOptions
    );



    toolOptions
      .querySelector(".panel")
      ?.classList.add("active");



    bindFMControls(
      workstation,
      "fx"
    );



    bindKnobs(
      workstation
    );



    bindTransport(
      workstation
    );

  }



  /* =========================
     RGB SPLIT
  ========================== */

  if(tool === "rgb"){

    toolOptions.innerHTML =

      createRgbPanel();



    bindRgbControls(
      workstation
    );

  }



  /* =========================
     DITHER
  ========================== */

  if(tool === "dither"){

    toolOptions.innerHTML =

      createDitherPanel();



    bindDitherControls(
      workstation
    );

  }



  /* =========================
     FEEDBACK
  ========================== */

  if(tool === "feedback"){

    toolOptions.innerHTML =

      createFeedbackPanel();



    bindFeedbackControls(
      workstation
    );



    bindTransport(
      workstation
    );

  }

  bindFloatingEffectBlocks(
    workstation,
    toolOptions,
    tool
  );



  /* =========================
     REDRAW
  ========================== */

  workstation.queueRender();

}
