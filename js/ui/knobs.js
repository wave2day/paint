export function bindKnobs(ui) {

  let activeKnob = null;

  const valueMap =
    new WeakMap();

  document
    .querySelectorAll(".knob")
    .forEach(knob => {

      const initial =
        parseFloat(knob.dataset.value || "0.5");

      valueMap.set(knob, initial);

      const dial =
        knob.querySelector(".dial");

      if (dial) {

        dial.style.transform =
          `rotate(${initial * 270 - 135}deg)`;
      }

      knob.addEventListener("mousedown", (e) => {

        activeKnob = knob;

        e.preventDefault();
      });
    });

  window.addEventListener("mouseup", () => {

    activeKnob = null;
  });

  window.addEventListener("mousemove", (e) => {

    if (!activeKnob) return;
    if (!ui.engine2?.fm) return;

    let value =
      valueMap.get(activeKnob);

    value -= e.movementY * 0.005;

    value =
      Math.max(0, Math.min(1, value));

    valueMap.set(activeKnob, value);

    activeKnob.dataset.value = value;

    const dial =
      activeKnob.querySelector(".dial");

    if (dial) {

      dial.style.transform =
        `rotate(${value * 270 - 135}deg)`;
    }

    const type =
      activeKnob.dataset.knob;

    if (type === "freq") {
      ui.engine2.fm.freq = value * 0.1;
    }

    if (type === "depth") {
      ui.engine2.fm.depth = value * 80;
    }

    if (type === "angle") {
      ui.engine2.fm.angle =
        value * Math.PI;
    }

    if (type === "flow") {
      ui.engine2.fm.flow = value;
    }

    if (type === "blend") {
      ui.engine2.fm.blend = value;
    }

    if (type === "colorize") {
      ui.engine2.fm.colorize = value;
    }

    ui.engine2.draw(ui.progress);
  });
}
