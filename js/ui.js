import { bindWindowDrag }
  from "./ui/windowDrag.js";
import { bindScrollbars }
  from "./ui/scrollbars.js";
import { bindLoad }
  from "./ui/loadUI.js";
import {
  bindTransport,
  stopTransport
} from "./ui/transport.js";
import { bindPalette }
  from "./ui/paletteUI.js";
import { bindExport }
  from "./ui/exportUI.js";
import { bindTools }
  from "./ui/toolsUI.js";
import { bindInputs }
  from "./ui/inputsUI.js";
import { bindKnobs }
  from "./ui/knobs.js";

export class UI {

  constructor(engine) {

    this.engine = engine;
    
    this.running = false;
    this.raf = null;

    this.progress = 0;

    this.draggingWindow = false;
    this.draggingX = false;
    this.draggingY = false;

    this.winOffsetX = 0;
    this.winOffsetY = 0;

    this.scrollPosX = 0;
    this.scrollPosY = 0;
  }

  init() {

    bindLoad(this);
    bindTools(this);
    bindTransport(this);
    bindExport(this);
    bindPalette(this);
    bindScrollbars(this);
    bindWindowDrag(this);
    bindInputs(this);
    bindKnobs(this);

    this.engine.clear();
  }



resetScrollbars() {

    this.scrollPosX = 0;
    this.scrollPosY = 0;
  }



