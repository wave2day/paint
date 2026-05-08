import { Engine } from "./engine.js";
import { Engine2 } from "./engine/engine2.js";
import { UI } from "./ui.js";

import { buildPalette } from "./palette/palette.js";

import { createDriftPanel } from "./effects/drift/driftPanel.js";
import { createFMPanel } from "./effects/fm/fmPanel.js";

const canvas = document.getElementById("canvas");

// MAIN ENGINE
const engine = new Engine(canvas);

// EFFECT ROUTER
const engine2 = new Engine2(engine);

// UI
const ui = new UI(engine);

// CONNECT EFFECT ROUTER
ui.engine2 = engine2;

// INSERT PANELS FIRST
document.querySelector(".tool-options").innerHTML =
  createDriftPanel() +
  createFMPanel();

// BUILD PALETTE BEFORE UI INIT
buildPalette(engine);

// INIT UI AFTER DOM ELEMENTS EXIST
ui.init();
