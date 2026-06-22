import { bindOpen }
from "./bindOpen.js?v=gallery-open-workstation-1";

import { bindToolButtons }
from "./bindToolButtons.js?v=floating-effect-block-snap-1";

import { bindScrollbars }
from "./bindScrollbars.js";

import { bindExport }
from "./bindExport.js?v=transport-panel-1";

import { bindCanvasContextMenu }
from "./bindCanvasContextMenu.js?v=workstation-crop-1";

import { bindWorkstationHelp }
from "./bindWorkstationHelp.js";



export function setupUI(workstation){

  /* =========================
     TOOLBAR
  ========================== */

  bindToolButtons(
    workstation
  );



  /* =========================
     SCROLLBARS
  ========================== */

  bindScrollbars(
    workstation
  );



  /* =========================
     OPEN
  ========================== */

  bindOpen(
    workstation
  );



  /* =========================
     EXPORT
  ========================== */

  bindExport(
    workstation
  );



  /* =========================
     CANVAS CONTEXT MENU
  ========================== */

  bindCanvasContextMenu(
    workstation
  );



  /* =========================
     HELP
  ========================== */

  bindWorkstationHelp();

}
