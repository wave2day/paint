import { FM } from "./FM.js";

export class engine2 {
  constructor(baseEngine) {
    this.base = baseEngine;

    this.fm = new FM();

    this.modules = {
      fm: this.fm
    };

    this.mode = "drift";
  }

  draw(progress) {
    if (this.mode === "fm") {
      this.fm.draw(this.base);
      return;
    }

    this.base.draw(progress);
  }
}
