export function createKnob(

  label = "",
  knob = ""

){

  return `

    <div
      class="knob"
      data-knob="${knob}"
    >

      <div class="dial"></div>

      <span>${label}</span>

    </div>

  `;

}



export function createValueKnob({

  id = "",
  label = "",
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  variant = "mini",
  className = ""

} = {}){

  const kind =
    variant === "main"
      ? "main"
      : "mini";

  const classes =
    `value-knob value-knob--${kind}` +
    (className ? ` ${className}` : "");

  return `

    <label
      class="${classes}"
      data-value-knob="${id}"
    >

      <span class="value-knob__dial"></span>
      <span class="value-knob__markers" aria-hidden="true">
        <i style="--marker-angle:-135deg"></i>
        <i style="--marker-angle:-45deg"></i>
        <i style="--marker-angle:45deg"></i>
        <i style="--marker-angle:135deg"></i>
      </span>

      <span class="value-knob__label">${label}</span>

      <input
        class="value-knob__input"
        type="range"
        id="${id}"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
      >

    </label>

  `;

}



export function bindValueKnobs({

  root = document,
  knobs = {},
  onChange = null

} = {}){

  Object
    .entries(knobs)
    .forEach(([id, config]) => {

      const input =
        root.querySelector(`#${id}`);

      if(!input){
        return;
      }

      const knob =
        input.closest(".value-knob");

      if(!knob){
        return;
      }

      const min =
        numberOr(
          config.min,
          parseFloat(input.min),
          0
        );

      const max =
        numberOr(
          config.max,
          parseFloat(input.max),
          100
        );

      const step =
        numberOr(
          config.step,
          parseFloat(input.step),
          1
        );

      const circular =
        !!config.circular ||
        knob.classList.contains("value-knob--circular") ||
        knob.classList.contains("value-knob--full");

      if(typeof config.get === "function"){
        input.value =
          config.get();
      }

      syncValueKnob(
        input,
        min,
        max,
        { circular }
      );

      const commit = value => {

        const next =
          snapValue(
            value,
            min,
            max,
            step,
            circular
          );

        input.value =
          next;

        if(typeof config.set === "function"){
          config.set(next);
        }

        syncValueKnob(
          input,
          min,
          max,
          { circular }
        );

        if(typeof config.onChange === "function"){
          config.onChange(next);
        }

        if(typeof onChange === "function"){
          onChange(
            id,
            next
          );
        }

      };

      input.addEventListener(
        "input",
        () => {
          commit(
            parseFloat(input.value)
          );
        }
      );

      input.addEventListener(
        "change",
        () => {
          commit(
            parseFloat(input.value)
          );
        }
      );

      knob.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          knob.classList.add(
            "dragging"
          );

          if(knob.setPointerCapture){
            knob.setPointerCapture(
              event.pointerId
            );
          }

          const startY =
            event.clientY;

          const startValue =
            parseFloat(input.value);

          const dragScale =
            (max - min) / 120;

          function move(moveEvent){

            moveEvent.preventDefault();

            const delta =
              startY - moveEvent.clientY;

            commit(
              startValue +
              delta * dragScale
            );

          }

          function up(upEvent){

            knob.classList.remove(
              "dragging"
            );

            if(
              upEvent &&
              Number.isFinite(upEvent.pointerId) &&
              knob.releasePointerCapture &&
              knob.hasPointerCapture &&
              knob.hasPointerCapture(upEvent.pointerId)
            ){
              knob.releasePointerCapture(
                upEvent.pointerId
              );
            }

            window.removeEventListener(
              "pointermove",
              move
            );

            window.removeEventListener(
              "pointerup",
              up
            );

            window.removeEventListener(
              "pointercancel",
              up
            );

            window.removeEventListener(
              "blur",
              up
            );

          }

          window.addEventListener(
            "pointermove",
            move
          );

          window.addEventListener(
            "pointerup",
            up
          );

          window.addEventListener(
            "pointercancel",
            up
          );

          window.addEventListener(
            "blur",
            up
          );

        }
      );

    });

}



export function syncValueKnob(
  input,
  min = 0,
  max = 100,
  options = {}
){

  const knob =
    input.closest(".value-knob");

  if(!knob){
    return;
  }

  const value =
    parseFloat(input.value);

  const circular =
    !!options.circular ||
    knob.classList.contains("value-knob--circular") ||
    knob.classList.contains("value-knob--full");

  if(circular){

    const step =
      numberOr(
        parseFloat(input.step),
        1
      );

    const span =
      circularSpan(
        min,
        max,
        step
      );

    const norm =
      wrap(
        value - min,
        span
      ) / span;

    knob.style.setProperty(
      "--value-knob-turn",
      `${norm * 360}deg`
    );

    return;

  }

  const norm =
    (value - min) /
    (max - min);

  knob.style.setProperty(
    "--value-knob-turn",
    `${clamp(norm, 0, 1) * 270 - 135}deg`
  );

}



function snapValue(
  value,
  min,
  max,
  step,
  circular = false
){

  if(circular){

    const span =
      circularSpan(
        min,
        max,
        step
      );

    const wrapped =
      min +
      wrap(
        value - min,
        span
      );

    if(!step){
      return wrapped;
    }

    const snapped =
      Math.round(
        (wrapped - min) / step
      ) * step + min;

    const decimals =
      getDecimals(step);

    const normalized =
      snapped > max
        ? min
        : snapped;

    return Number(
      normalized.toFixed(decimals)
    );

  }

  const clamped =
    clamp(
      value,
      min,
      max
    );

  if(!step){
    return clamped;
  }

  const snapped =
    Math.round(
      (clamped - min) / step
    ) * step + min;

  const decimals =
    getDecimals(step);

  return Number(
    snapped.toFixed(decimals)
  );

}



function circularSpan(min, max, step){

  const range =
    max - min;

  const steps =
    step
      ? range / step
      : range;

  return (
    Number.isInteger(steps) &&
    steps > 0 &&
    steps <= 12
  )
    ? range + step
    : range;

}



function wrap(value, span){

  if(!span){
    return 0;
  }

  return (
    (value % span) +
    span
  ) % span;

}



function numberOr(...values){

  for(const value of values){
    if(Number.isFinite(value)){
      return value;
    }
  }

  return 0;

}



function getDecimals(value){

  const text =
    String(value);

  const dot =
    text.indexOf(".");

  return dot === -1
    ? 0
    : text.length - dot - 1;

}



function clamp(value, min, max){

  return Math.max(
    min,
    Math.min(max, value)
  );

}
