import { FM } from "./FM.js";
import { DriftEngine } from "./DriftEngine.js";

export class Engine2 {

  constructor(base) {

    this.base = base;

    this.fm =
      new FM();

    this.drift =
      new DriftEngine();

    this.modules = {

      drift: this.drift,
      fm: this.fm
    };

    this.mode = "drift";
  }

  draw(progress) {

    const module =
      this.modules[this.mode];

    if (!module) {
      return;
    }

    module.draw(
      this.base,
      progress
    );
  }
}
