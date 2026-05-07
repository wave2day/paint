import { Engine } from "./engine.js";
import { Engine2 } from "./engine/engine2.js";
import { UI } from "./ui.js";

import { buildPalette } from "./palette/palette.js";

import { createDriftPanel } from "./effects/drift/driftPanel.js";

const canvas = document.getElementById("canvas");

// 🔥 MAIN ENGINE
const engine = new Engine(canvas);

// 🔥 EFFECT ROUTER
const engine2 = new Engine2(engine);

// 🔥 UI
const ui = new UI(engine);

// 🔥 CONNECT FM
ui.engine2 = engine2;

// 🔥 INSERT DRIFT PANEL
document
  .querySelector(".tool-options")
  .insertAdjacentHTML(
    "afterbegin",
    createDriftPanel()
  );

// 🔥 INIT UI
ui.init();

// 🔥 BUILD PALETTE
buildPalette(engine);
