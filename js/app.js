import { Engine } from "./engine.js";
import { Engine2 } from "./engine/engine2.js";
import { UI } from "./ui.js";

const canvas = document.getElementById("canvas");

// 🔥 HLAVNÍ (funkční) engine
const engine = new Engine(canvas);

// 🔥 NOVÝ systém modulů
const engine2 = new Engine2(engine);

// 🔥 UI
const ui = new UI(engine);

// 🔥 připojení FM systému
ui.engine2 = engine2;

ui.init();
