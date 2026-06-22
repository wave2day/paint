export function createSlideSwitcher({

  id = "",
  label = "",
  options = [],
  value = "",
  className = ""

} = {}){

  const items =
    options.length
      ? options
      : [
          { label:"A", value:"a" },
          { label:"B", value:"b" },
          { label:"C", value:"c" }
        ];

  const selectedIndex =
    Math.max(
      0,
      items.findIndex(
        option => option.value === value
      )
    );

  const classes =
    `slide-switcher${className ? ` ${className}` : ""}`;

  const initialX =
    initialSwitcherX(
      selectedIndex,
      items.length
    );

  return `

    <div
      class="${classes}"
      data-slide-switcher="${id}"
      data-state="${selectedIndex}"
      style="--slide-switcher-x:${initialX}%"
    >

      ${label ? `<span class="slide-switcher__title">${label}</span>` : ""}

      <div class="slide-switcher__shell">
        <div class="slide-switcher__rail"></div>

        <button
          class="slide-switcher__thumb"
          type="button"
          aria-label="${label || id}: ${items[selectedIndex].label}"
        >
          <span class="slide-switcher__grip"></span>
        </button>
      </div>

      <div class="slide-switcher__marks">
        ${items
          .map(option => `
            <span class="slide-switcher__mark">
              <span class="slide-switcher__dot"></span>
              <span class="slide-switcher__label">${option.label}</span>
            </span>
          `)
          .join("")}
      </div>

      <input
        class="slide-switcher__input"
        type="hidden"
        id="${id}"
        value="${value || items[selectedIndex].value}"
      >

    </div>

  `;

}



function initialSwitcherX(index, count){

  return switcherStopPercent(
    index,
    count
  );

}



export function bindSlideSwitchers({

  root = document,
  switchers = {},
  onChange = null

} = {}){

  Object
    .entries(switchers)
    .forEach(([id, config]) => {

      const input =
        root.querySelector(`#${id}`);

      if(!input){
        return;
      }

      const switcher =
        input.closest(".slide-switcher");

      if(!switcher){
        return;
      }

      const shell =
        switcher.querySelector(
          ".slide-switcher__shell"
        );

      const thumb =
        switcher.querySelector(
          ".slide-switcher__thumb"
        );

      if(
        !shell ||
        !thumb
      ){
        return;
      }

      const options =
        normalizeOptions(
          config.options
        );

      if(typeof config.get === "function"){
        input.value =
          config.get();
      }

      let state =
        valueToIndex(
          input.value,
          options
        );

      let dragging =
        false;

      let dragOffset =
        0;

      const commit = (
        nextIndex,
        emit = true
      ) => {

        state =
          clamp(
            Math.round(nextIndex),
            0,
            options.length - 1
          );

        const option =
          options[state];

        input.value =
          option.value;

        switcher.dataset.state =
          String(state);

        thumb.setAttribute(
          "aria-label",
          `${config.label || id}: ${option.label}`
        );

        syncSlideSwitcher(
          input,
          options
        );

        if(typeof config.set === "function"){
          config.set(
            option.value,
            state
          );
        }

        if(!emit){
          return;
        }

        input.dispatchEvent(
          new Event(
            "input",
            { bubbles:true }
          )
        );

        input.dispatchEvent(
          new Event(
            "change",
            { bubbles:true }
          )
        );

        if(typeof config.onChange === "function"){
          config.onChange(
            option.value,
            state
          );
        }

        if(typeof onChange === "function"){
          onChange(
            id,
            option.value,
            state
          );
        }

      };

      function localX(pointerEvent){

        const rect =
          shell.getBoundingClientRect();

        return pointerEvent.clientX - rect.left;

      }

      function currentThumbX(){

        const shellRect =
          shell.getBoundingClientRect();

        const thumbRect =
          thumb.getBoundingClientRect();

        return (
          thumbRect.left +
          thumbRect.width / 2 -
          shellRect.left
        );

      }

      function updateFromPointer(pointerEvent){

        pointerEvent.preventDefault();

        const stops =
          getStops(
            shell,
            thumb,
            options.length
          );

        const x =
          clamp(
            localX(pointerEvent) - dragOffset,
            stops[0],
            stops[stops.length - 1]
          );

        setThumbX(
          switcher,
          shell,
          x
        );

      }

      function finish(pointerEvent){

        switcher.classList.remove(
          "dragging"
        );

        dragging =
          false;

        const stops =
          getStops(
            shell,
            thumb,
            options.length
          );

        const x =
          pointerEvent
            ? clamp(
                localX(pointerEvent) - dragOffset,
                stops[0],
                stops[stops.length - 1]
              )
            : stops[state];

        commit(
          nearestStopIndex(
            x,
            stops
          )
        );

        window.removeEventListener(
          "pointermove",
          move
        );

        window.removeEventListener(
          "pointerup",
          finish
        );

        window.removeEventListener(
          "pointercancel",
          cancel
        );

        window.removeEventListener(
          "blur",
          cancel
        );

      }

      function cancel(){

        switcher.classList.remove(
          "dragging"
        );

        dragging =
          false;

        syncSlideSwitcher(
          input,
          options
        );

        window.removeEventListener(
          "pointermove",
          move
        );

        window.removeEventListener(
          "pointerup",
          finish
        );

        window.removeEventListener(
          "pointercancel",
          cancel
        );

        window.removeEventListener(
          "blur",
          cancel
        );

      }

      function move(pointerEvent){

        if(!dragging){
          return;
        }

        updateFromPointer(
          pointerEvent
        );

      }

      thumb.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          dragging =
            true;

          dragOffset =
            localX(event) -
            currentThumbX();

          switcher.classList.add(
            "dragging"
          );

          updateFromPointer(
            event
          );

          window.addEventListener(
            "pointermove",
            move
          );

          window.addEventListener(
            "pointerup",
            finish
          );

          window.addEventListener(
            "pointercancel",
            cancel
          );

          window.addEventListener(
            "blur",
            cancel
          );

        }
      );

      thumb.addEventListener(
        "keydown",
        event => {

          if(event.key === "ArrowLeft"){
            event.preventDefault();
            commit(state - 1);
          }

          if(event.key === "ArrowRight"){
            event.preventDefault();
            commit(state + 1);
          }

          if(event.key === "Home"){
            event.preventDefault();
            commit(0);
          }

          if(event.key === "End"){
            event.preventDefault();
            commit(options.length - 1);
          }

        }
      );

      commit(
        state,
        false
      );

      window.addEventListener(
        "resize",
        () => {
          syncSlideSwitcher(
            input,
            options
          );
        }
      );

    });

}



export function syncSlideSwitcher(input, options = []){

  const switcher =
    input.closest(".slide-switcher");

  if(!switcher){
    return;
  }

  const shell =
    switcher.querySelector(
      ".slide-switcher__shell"
    );

  const thumb =
    switcher.querySelector(
      ".slide-switcher__thumb"
    );

  if(
    !shell ||
    !thumb
  ){
    return;
  }

  const items =
    normalizeOptions(options);

  const index =
    valueToIndex(
      input.value,
      items
    );

  switcher.dataset.state =
    String(index);

  setThumbPercent(
    switcher,
    switcherStopPercent(
      index,
      items.length
    )
  );

}

function switcherStopPercent(index, count){

  if(count <= 1){
    return 50;
  }

  const safeStart =
    25;

  const safeEnd =
    75;

  const safeIndex =
    clamp(
      index,
      0,
      count - 1
    );

  return (
    safeStart +
    (safeEnd - safeStart) *
    (safeIndex / (count - 1))
  );

}



function getStops(shell, thumb, count){

  const rect =
    shell.getBoundingClientRect();

  const thumbWidth =
    thumb.getBoundingClientRect().width;

  const stopGap =
    cssNumber(
      shell,
      "--slide-switcher-stop-gap",
      5
    );

  const edge =
    thumbWidth / 2 + stopGap;

  if(count <= 1){
    return [
      rect.width / 2
    ];
  }

  const start =
    edge;

  const end =
    rect.width - edge;

  return Array
    .from(
      { length:count },
      (_, index) => (
        start +
        (end - start) *
        (index / (count - 1))
      )
    );

}



function setThumbX(switcher, shell, x){

  const rect =
    shell.getBoundingClientRect();

  if(rect.width <= 0){
    return;
  }

  setThumbPercent(
    switcher,
    (x / rect.width) * 100
  );

}



function setThumbPercent(switcher, percent){

  switcher.style.setProperty(
    "--slide-switcher-x",
    `${clamp(percent, 0, 100)}%`
  );

}



function nearestStopIndex(x, stops){

  let index =
    0;

  let distance =
    Infinity;

  stops.forEach((stop, stopIndex) => {

    const nextDistance =
      Math.abs(
        x - stop
      );

    if(nextDistance < distance){
      distance =
        nextDistance;
      index =
        stopIndex;
    }

  });

  return index;

}



function valueToIndex(value, options){

  const index =
    options.findIndex(
      option => option.value === value
    );

  return Math.max(
    0,
    index
  );

}



function normalizeOptions(options = []){

  return options.length
    ? options
    : [
        { label:"A", value:"a" },
        { label:"B", value:"b" },
        { label:"C", value:"c" }
      ];

}



function clamp(value, min, max){

  return Math.max(
    min,
    Math.min(max, value)
  );

}



function cssNumber(element, name, fallback){

  const value =
    parseFloat(
      getComputedStyle(element)
        .getPropertyValue(name)
    );

  return Number.isFinite(value)
    ? value
    : fallback;

}



export function createVerticalSwitcher({

  id = "",
  label = "",
  options = [],
  value = "",
  className = ""

} = {}){

  const items =
    normalizeToggleOptions(
      options
    );

  const selectedIndex =
    valueToIndex(
      value || items[0].value,
      items
    );

  const classes =
    `vertical-switcher${className ? ` ${className}` : ""}`;

  return `

    <div
      class="${classes}"
      data-vertical-switcher="${id}"
      data-state="${selectedIndex}"
      style="--vertical-switcher-y:${verticalSwitcherStopPercent(selectedIndex, items.length)}%"
    >

      ${label ? `<span class="vertical-switcher__title">${label}</span>` : ""}

      <div class="vertical-switcher__body">
        <div class="vertical-switcher__shell">
          <div class="vertical-switcher__rail"></div>

          <button
            class="vertical-switcher__thumb"
            type="button"
            aria-label="${label || id}: ${items[selectedIndex].label}"
          >
            <span class="vertical-switcher__grip"></span>
          </button>
        </div>

        <div class="vertical-switcher__marks">
          ${items
            .map(option => `
              <span class="vertical-switcher__mark">
                <span class="vertical-switcher__dot"></span>
                <span class="vertical-switcher__label">${option.label}</span>
              </span>
            `)
            .join("")}
        </div>
      </div>

      <input
        class="vertical-switcher__input"
        type="hidden"
        id="${id}"
        value="${value || items[selectedIndex].value}"
      >

    </div>

  `;

}



export function bindVerticalSwitchers({

  root = document,
  switchers = {},
  onChange = null

} = {}){

  Object
    .entries(switchers)
    .forEach(([id, config]) => {

      const input =
        root.querySelector(`#${id}`);

      if(!input){
        return;
      }

      const switcher =
        input.closest(".vertical-switcher");

      if(!switcher){
        return;
      }

      const shell =
        switcher.querySelector(
          ".vertical-switcher__shell"
        );

      const thumb =
        switcher.querySelector(
          ".vertical-switcher__thumb"
        );

      if(
        !shell ||
        !thumb
      ){
        return;
      }

      const options =
        normalizeToggleOptions(
          config.options
        );

      if(typeof config.get === "function"){
        input.value =
          config.get();
      }

      let state =
        valueToIndex(
          input.value,
          options
        );

      let dragging =
        false;

      let dragOffset =
        0;

      const commit = (
        nextIndex,
        emit = true
      ) => {

        state =
          clamp(
            Math.round(nextIndex),
            0,
            options.length - 1
          );

        const option =
          options[state];

        input.value =
          option.value;

        switcher.dataset.state =
          String(state);

        thumb.setAttribute(
          "aria-label",
          `${config.label || id}: ${option.label}`
        );

        syncVerticalSwitcher(
          input,
          options
        );

        if(typeof config.set === "function"){
          config.set(
            option.value,
            state
          );
        }

        if(!emit){
          return;
        }

        input.dispatchEvent(
          new Event(
            "input",
            { bubbles:true }
          )
        );

        input.dispatchEvent(
          new Event(
            "change",
            { bubbles:true }
          )
        );

        if(typeof config.onChange === "function"){
          config.onChange(
            option.value,
            state
          );
        }

        if(typeof onChange === "function"){
          onChange(
            id,
            option.value,
            state
          );
        }

      };

      function localY(pointerEvent){

        const rect =
          shell.getBoundingClientRect();

        return pointerEvent.clientY - rect.top;

      }

      function currentThumbY(){

        const shellRect =
          shell.getBoundingClientRect();

        const thumbRect =
          thumb.getBoundingClientRect();

        return (
          thumbRect.top +
          thumbRect.height / 2 -
          shellRect.top
        );

      }

      function updateFromPointer(pointerEvent){

        pointerEvent.preventDefault();

        const stops =
          getVerticalStops(
            shell,
            thumb,
            options.length
          );

        const y =
          clamp(
            localY(pointerEvent) - dragOffset,
            stops[0],
            stops[stops.length - 1]
          );

        setThumbY(
          switcher,
          shell,
          y
        );

      }

      function finish(pointerEvent){

        switcher.classList.remove(
          "dragging"
        );

        dragging =
          false;

        const stops =
          getVerticalStops(
            shell,
            thumb,
            options.length
          );

        const y =
          pointerEvent
            ? clamp(
                localY(pointerEvent) - dragOffset,
                stops[0],
                stops[stops.length - 1]
              )
            : stops[state];

        commit(
          nearestStopIndex(
            y,
            stops
          )
        );

        window.removeEventListener(
          "pointermove",
          move
        );

        window.removeEventListener(
          "pointerup",
          finish
        );

        window.removeEventListener(
          "pointercancel",
          cancel
        );

        window.removeEventListener(
          "blur",
          cancel
        );

      }

      function cancel(){

        switcher.classList.remove(
          "dragging"
        );

        dragging =
          false;

        syncVerticalSwitcher(
          input,
          options
        );

        window.removeEventListener(
          "pointermove",
          move
        );

        window.removeEventListener(
          "pointerup",
          finish
        );

        window.removeEventListener(
          "pointercancel",
          cancel
        );

        window.removeEventListener(
          "blur",
          cancel
        );

      }

      function move(pointerEvent){

        if(!dragging){
          return;
        }

        updateFromPointer(
          pointerEvent
        );

      }

      thumb.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          dragging =
            true;

          dragOffset =
            localY(event) -
            currentThumbY();

          switcher.classList.add(
            "dragging"
          );

          updateFromPointer(
            event
          );

          window.addEventListener(
            "pointermove",
            move
          );

          window.addEventListener(
            "pointerup",
            finish
          );

          window.addEventListener(
            "pointercancel",
            cancel
          );

          window.addEventListener(
            "blur",
            cancel
          );

        }
      );

      thumb.addEventListener(
        "keydown",
        event => {

          if(event.key === "ArrowUp"){
            event.preventDefault();
            commit(state - 1);
          }

          if(event.key === "ArrowDown"){
            event.preventDefault();
            commit(state + 1);
          }

          if(event.key === "Home"){
            event.preventDefault();
            commit(0);
          }

          if(event.key === "End"){
            event.preventDefault();
            commit(options.length - 1);
          }

        }
      );

      commit(
        state,
        false
      );

      window.addEventListener(
        "resize",
        () => {
          syncVerticalSwitcher(
            input,
            options
          );
        }
      );

    });

}



export function syncVerticalSwitcher(input, options = []){

  const switcher =
    input.closest(".vertical-switcher");

  if(!switcher){
    return;
  }

  const items =
    normalizeToggleOptions(options);

  const index =
    valueToIndex(
      input.value,
      items
    );

  switcher.dataset.state =
    String(index);

  switcher.style.setProperty(
    "--vertical-switcher-y",
    `${verticalSwitcherStopPercent(index, items.length)}%`
  );

}



function verticalSwitcherStopPercent(index, count){

  if(count <= 1){
    return 50;
  }

  const safeStart =
    30;

  const safeEnd =
    70;

  const safeIndex =
    clamp(
      index,
      0,
      count - 1
    );

  return (
    safeStart +
    (safeEnd - safeStart) *
    (safeIndex / (count - 1))
  );

}



function getVerticalStops(shell, thumb, count){

  const rect =
    shell.getBoundingClientRect();

  const thumbHeight =
    thumb.getBoundingClientRect().height;

  const stopGap =
    cssNumber(
      shell,
      "--vertical-switcher-stop-gap",
      3
    );

  const edge =
    thumbHeight / 2 + stopGap;

  if(count <= 1){
    return [
      rect.height / 2
    ];
  }

  const start =
    edge;

  const end =
    rect.height - edge;

  return Array
    .from(
      { length:count },
      (_, index) => (
        start +
        (end - start) *
        (index / (count - 1))
      )
    );

}



function setThumbY(switcher, shell, y){

  const rect =
    shell.getBoundingClientRect();

  if(rect.height <= 0){
    return;
  }

  switcher.style.setProperty(
    "--vertical-switcher-y",
    `${clamp((y / rect.height) * 100, 0, 100)}%`
  );

}



function normalizeToggleOptions(options = []){

  const items =
    options.length
      ? options.slice(0, 2)
      : [
          { label:"On", value:"on" },
          { label:"Off", value:"off" }
        ];

  return items.length === 1
    ? [
        items[0],
        { label:"Off", value:"off" }
      ]
    : items;

}
