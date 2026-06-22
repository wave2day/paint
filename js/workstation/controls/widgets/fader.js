export function createValueFader({

  id = "",
  label = "",
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  className = ""

} = {}){

  const classes =
    `value-fader${className ? ` ${className}` : ""}`;

  return `

    <label
      class="${classes}"
      data-value-fader="${id}"
    >

      <span class="value-fader__slot">
        <span class="value-fader__handle"></span>
      </span>

      <span class="value-fader__label">${label}</span>

      <input
        class="value-fader__input"
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



export function bindValueFaders({

  root = document,
  faders = {},
  onChange = null

} = {}){

  Object
    .entries(faders)
    .forEach(([id, config]) => {

      const input =
        root.querySelector(`#${id}`);

      if(!input){
        return;
      }

      const fader =
        input.closest(".value-fader");

      if(!fader){
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

      if(typeof config.get === "function"){
        input.value =
          config.get();
      }

      syncValueFader(
        input,
        min,
        max
      );

      const commit = value => {

        const next =
          snapValue(
            value,
            min,
            max,
            step
          );

        input.value =
          next;

        if(typeof config.set === "function"){
          config.set(next);
        }

        syncValueFader(
          input,
          min,
          max
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

      fader.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          fader.classList.add(
            "dragging"
          );

          if(fader.setPointerCapture){
            fader.setPointerCapture(
              event.pointerId
            );
          }

          function updateFromPointer(pointerEvent){

            pointerEvent.preventDefault();

            const slot =
              fader.querySelector(
                ".value-fader__slot"
              );

            if(!slot){
              return;
            }

            const rect =
              slot.getBoundingClientRect();

            const y =
              clamp(
                pointerEvent.clientY,
                rect.top,
                rect.bottom
              );

            const norm =
              1 -
              (
                (y - rect.top) /
                rect.height
              );

            commit(
              min +
              norm * (max - min)
            );

          }

          function move(moveEvent){

            updateFromPointer(
              moveEvent
            );

          }

          function up(upEvent){

            fader.classList.remove(
              "dragging"
            );

            if(
              upEvent &&
              Number.isFinite(upEvent.pointerId) &&
              fader.releasePointerCapture &&
              fader.hasPointerCapture &&
              fader.hasPointerCapture(upEvent.pointerId)
            ){
              fader.releasePointerCapture(
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

          updateFromPointer(
            event
          );

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



export function syncValueFader(input, min = 0, max = 100){

  const fader =
    input.closest(".value-fader");

  if(!fader){
    return;
  }

  const value =
    parseFloat(input.value);

  const norm =
    (value - min) /
    (max - min);

  fader.style.setProperty(
    "--value-fader-pos",
    `${100 - clamp(norm, 0, 1) * 100}%`
  );

}



function snapValue(value, min, max, step){

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
