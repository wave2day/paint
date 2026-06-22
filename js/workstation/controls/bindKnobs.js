export function bindKnobs(workstation){

  let activeKnob = null;

  const valueMap =
    new WeakMap();

  const fm =
    workstation.effects.modules.fm;

  document
    .querySelectorAll(".knob")
    .forEach(knob => {

      const type =
        knob.dataset.knob;

      const initial =
        knobValueFromFM(
          type,
          fm,
          parseFloat(knob.dataset.value || "0.5")
        );

      valueMap.set(
        knob,
        initial
      );

      const dial =
        knob.querySelector(".dial");

      if(dial){

        dial.style.transform =
          `rotate(${initial * 270 - 135}deg)`;

      }

      knob.addEventListener(
        "mousedown",
        event => {

          activeKnob =
            knob;

          event.preventDefault();

        }
      );

    });

  window.addEventListener(
    "mouseup",
    () => {

      activeKnob =
        null;

    }
  );

  window.addEventListener(
    "mousemove",
    event => {

      if(!activeKnob){
        return;
      }

      let value =
        valueMap.get(activeKnob);

      value -=
        event.movementY * 0.005;

      value =
        Math.max(
          0,
          Math.min(1,value)
        );

      valueMap.set(
        activeKnob,
        value
      );

      activeKnob.dataset.value =
        value;

      const dial =
        activeKnob.querySelector(".dial");

      if(dial){

        dial.style.transform =
          `rotate(${value * 270 - 135}deg)`;

      }

      const type =
        activeKnob.dataset.knob;

      applyFMKnobValue(
        type,
        fm,
        value
      );

      workstation.queueRender();

    }
  );

}

function knobValueFromFM(type,fm,fallback){

  if(!fm){
    return fallback;
  }

  if(type === "freq"){
    return clamp01(fm.freq / 0.1);
  }

  if(type === "depth"){
    return clamp01(fm.depth / 80);
  }

  if(type === "angle"){
    return clamp01(fm.angle / Math.PI);
  }

  if(type === "flow"){
    return clamp01(fm.flow);
  }

  if(type === "blend"){
    return clamp01(fm.blend);
  }

  if(type === "colorize"){
    return clamp01(fm.colorize);
  }

  return fallback;

}



function applyFMKnobValue(type,fm,value){

  if(!fm){
    return;
  }

  if(type === "freq"){
    fm.freq = value * 0.1;
  }

  if(type === "depth"){
    fm.depth = value * 80;
  }

  if(type === "angle"){
    fm.angle = value * Math.PI;
  }

  if(type === "flow"){
    fm.flow = value;
  }

  if(type === "blend"){
    fm.blend = value;
  }

  if(type === "colorize"){
    fm.colorize = value;
  }

}



function clamp01(value){

  return Math.max(
    0,
    Math.min(1,value)
  );

}
