import { bindOpen }
from "./bindOpen.js";

import { bindScrollbars }
from "./bindScrollbars.js";

import { bindToolButtons }
from "./bindToolButtons.js";

import { bindTransport }
from "./bindTransport.js";

import { bindExport }
from "./bindExport.js";

import { bindKnobs }
from "./bindKnobs.js";

import { bindInputs }
from "./bindInputs.js";



export function setupUI(workstation){

  bindOpen(workstation);

  bindScrollbars(workstation);

  bindToolButtons(workstation);

  bindTransport(workstation);

  bindExport(workstation);

  bindKnobs(workstation);

  bindInputs(workstation);

}
