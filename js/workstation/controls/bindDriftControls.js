import {
  bindValueKnobs,
  syncValueKnob
}
from "./widgets/knob.js?v=value-knob-circular-1";

import {
  bindValueFaders,
  syncValueFader
}
from "./widgets/fader.js";

import {
  bindSlideSwitchers,
  syncSlideSwitcher
}
from "./widgets/switcher.js?v=slide-switcher-wider-stops-1";

import {
  driftKeyframes,
  driftPresets
}
from "../effects/drift/driftState.js";



const DRIFT_DEFAULTS = {
  version:2,
  speed:0.004,
  phase:0,
  progress:0,
  direction:1,
  loopMode:"pingpong",
  bypass:false,
  amount:65,
  morphSmooth:"smoothstep",
  hueBias:0,
  saturationBias:0,
  contrastBias:0,
  gammaBias:1,
  brightnessBias:0,
  jitter:0,
  momentum:0,
  driftNoise:0,
  paletteAmount:30,
  paletteBlend:"overlay",
  paletteColor:"#ffffff",
  paletteEditActive:false,
  seed:2409,
  presetName:"Custom",
  selectedKeyframe:0,
  keyframes:driftKeyframes.map(keyframe => ({ ...keyframe }))
};



export function bindDriftControls(
  workstation
){

  const drift =
    workstation.effects.modules
      .drift;

  const panel =
    document.querySelector(
      '[data-panel="drift"]'
    );

  if(
    !drift ||
    !panel
  ){
    return;
  }

  const render =
    () => {
      workstation.queueRender();
    };

  hydrateDriftState(
    drift.state
  );

  bindSlideSwitchers({
    root:panel,
    switchers:{
      "drift-loop-mode":{
        options:[
          { label:"FWD", value:"forward" },
          { label:"PING", value:"pingpong" },
          { label:"RND", value:"random" }
        ],
        get:() => drift.state.loopMode,
        set:value => {
          drift.state.loopMode =
            value;
        }
      }
    },
    onChange:render
  });

  bindValueKnobs({
    root:panel,
    knobs:{
      "drift-speed":{
        min:0,
        max:100,
        step:1,
        get:() => speedToUi(
          drift.state.speed
        ),
        set:value => {
          drift.state.speed =
            uiToSpeed(value);
        }
      },
      "drift-amount":{
        min:0,
        max:100,
        step:1,
        get:() => drift.state.amount,
        set:value => {
          drift.state.amount =
            value;
        }
      },
      "drift-hue-bias":{
        min:-180,
        max:180,
        step:1,
        circular:true,
        get:() => drift.state.hueBias,
        set:value => {
          drift.state.hueBias =
            value;
        }
      }
    },
    onChange:render
  });

  bindValueFaders({
    root:panel,
    faders:{
      "drift-phase":{
        min:0,
        max:100,
        step:1,
        get:() => drift.state.phase * 100,
        set:value => {
          drift.state.phase =
            clamp(
              value / 100,
              0,
              1
            );
        }
      },
      "drift-saturation-bias":{
        min:-100,
        max:200,
        step:1,
        get:() => drift.state.saturationBias,
        set:value => {
          drift.state.saturationBias =
            value;
        }
      },
      "drift-contrast-bias":{
        min:-100,
        max:200,
        step:1,
        get:() => drift.state.contrastBias,
        set:value => {
          drift.state.contrastBias =
            value;
        }
      },
      "drift-gamma-bias":{
        min:0.5,
        max:2.5,
        step:0.01,
        get:() => drift.state.gammaBias,
        set:value => {
          drift.state.gammaBias =
            value;
        }
      },
      "drift-brightness-bias":{
        min:-100,
        max:100,
        step:1,
        get:() => drift.state.brightnessBias,
        set:value => {
          drift.state.brightnessBias =
            value;
        }
      }
    },
    onChange:render
  });

  bindRange({
    panel,
    id:"drift-jitter",
    get:() => drift.state.jitter,
    set:value => {
      drift.state.jitter =
        value;
    },
    onChange:render
  });

  bindRange({
    panel,
    id:"drift-momentum",
    get:() => drift.state.momentum,
    set:value => {
      drift.state.momentum =
        value;
    },
    onChange:render
  });

  bindRange({
    panel,
    id:"drift-noise",
    get:() => drift.state.driftNoise,
    set:value => {
      drift.state.driftNoise =
        value;
    },
    onChange:render
  });

  bindRange({
    panel,
    id:"drift-palette-amount",
    get:() => drift.state.paletteAmount,
    set:value => {
      drift.state.paletteAmount =
        value;

      drift.state.paletteEditActive =
        true;
    },
    onChange:render
  });

  bindRange({
    panel,
    id:"drift-key-duration",
    get:() => currentDriftKeyframe(drift.state)?.duration || 1,
    set:value => {
      const keyframe =
        currentDriftKeyframe(
          drift.state
        );

      if(!keyframe){
        return;
      }

      keyframe.duration =
        Math.max(
          0.1,
          value
        );

      applyDurationPositions(
        drift.state.keyframes
      );

      drift.state.presetName =
        "Custom";
    },
    onChange:() => {
      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  });

  bindSelect({
    panel,
    id:"drift-morph-smooth",
    get:() => drift.state.morphSmooth,
    set:value => {
      drift.state.morphSmooth =
        value;
    },
    onChange:render
  });

  bindSelect({
    panel,
    id:"drift-palette-blend",
    get:() => drift.state.paletteBlend,
    set:value => {
      drift.state.paletteBlend =
        value;

      drift.state.paletteEditActive =
        true;
    },
    onChange:render
  });

  bindSelect({
    panel,
    id:"drift-preset",
    get:() => drift.state.presetName,
    set:value => {
      applyDriftPreset(
        drift,
        value
      );
    },
    onChange:() => {
      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  });

  bindSelect({
    panel,
    id:"drift-keyframe-select",
    get:() => String(
      drift.state.selectedKeyframe || 0
    ),
    set:value => {
      drift.state.selectedKeyframe =
        clampKeyframeIndex(
          drift.state,
          parseInt(value, 10) || 0
        );

      focusSelectedDriftKeyframe(
        workstation,
        drift
      );
    },
    onChange:() => {
      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  });

  bindButton(
    panel,
    "driftBypass",
    () => {
      drift.state.bypass =
        !drift.state.bypass;

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

  bindButton(
    panel,
    "driftKeyAdd",
    () => {
      addCurrentDriftKeyframe(
        workstation,
        drift
      );

      bakeDriftBiasControls(
        drift
      );

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

  bindButton(
    panel,
    "driftKeySnapshot",
    () => {
      snapshotCurrentDriftKeyframe(
        workstation,
        drift
      );

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

  bindButton(
    panel,
    "driftKeyDelete",
    () => {
      deleteCurrentDriftKeyframe(
        drift
      );

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

  bindButton(
    panel,
    "driftKeyPrev",
    () => {
      selectAdjacentDriftKeyframe(
        workstation,
        drift,
        -1
      );

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

  bindButton(
    panel,
    "driftKeyNext",
    () => {
      selectAdjacentDriftKeyframe(
        workstation,
        drift,
        1
      );

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

  bindButton(
    panel,
    "driftReseed",
    () => {
      drift.state.seed =
        rand(1, 99999);

      if(typeof drift.resetMotion === "function"){
        drift.resetMotion();
      }

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

  bindButton(
    panel,
    "driftRandom",
    () => {
      randomizeDrift(
        drift
      );

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

  bindButton(
    panel,
    "driftReset",
    () => {
      Object.assign(
        drift.state,
        cloneDriftDefaults()
      );

      workstation.core.progress =
        0;

      if(typeof drift.resetMotion === "function"){
        drift.resetMotion();
      }

      syncDriftPanel(
        panel,
        drift
      );

      render();
    }
  );

}



export function uiToSpeed(value){

  const min =
    0.0001;

  const max =
    0.05;

  const norm =
    Math.pow(
      clamp(value / 100, 0, 1),
      3
    );

  return (
    min +
    (max - min) * norm
  );

}



export function speedToUi(speed){

  const min =
    0.0001;

  const max =
    0.05;

  const norm =
    (speed - min) /
    (max - min);

  return Math.round(
    Math.cbrt(
      clamp(norm, 0, 1)
    ) * 100
  );

}



function bindSelect({
  panel,
  id,
  get,
  set,
  onChange
}){

  const select =
    panel.querySelector(
      `#${id}`
    );

  if(!select){
    return;
  }

  select.value =
    get();

  select.addEventListener(
    "input",
    () => {
      set(select.value);
      onChange();
    }
  );

  select.addEventListener(
    "change",
    () => {
      set(select.value);
      onChange();
    }
  );

}



function bindRange({
  panel,
  id,
  get,
  set,
  onChange
}){

  const input =
    panel.querySelector(
      `#${id}`
    );

  if(!input){
    return;
  }

  input.value =
    get();

  const commit =
    () => {
      set(
        parseFloat(
          input.value
        )
      );

      onChange();
    };

  input.addEventListener(
    "input",
    commit
  );

  input.addEventListener(
    "change",
    commit
  );

}



function bindButton(
  panel,
  id,
  handler
){

  const button =
    panel.querySelector(
      `#${id}`
    );

  if(!button){
    return;
  }

  button.addEventListener(
    "click",
    handler
  );

}



function randomizeDrift(drift){

  Object.assign(
    drift.state,
    {
      speed:uiToSpeed(rand(12, 72)),
      phase:Math.random(),
      loopMode:pick([
        "forward",
        "pingpong",
        "random"
      ]),
      amount:rand(35, 100),
      morphSmooth:pick([
        "linear",
        "smoothstep",
        "sine",
        "exponential"
      ]),
      hueBias:rand(-120, 120),
      saturationBias:rand(-35, 135),
      contrastBias:rand(-35, 120),
      gammaBias:round(
        rand(70, 165) / 100,
        2
      ),
      brightnessBias:rand(-35, 35),
      jitter:rand(0, 70),
      momentum:rand(0, 75),
      driftNoise:rand(0, 80),
      paletteAmount:rand(0, 80),
      paletteBlend:pick([
        "overlay",
        "soft-light",
        "multiply",
        "screen",
        "color"
      ]),
      seed:rand(1, 99999),
      bypass:false,
      presetName:"Custom",
      selectedKeyframe:0,
      paletteEditActive:false
    }
  );

  applyPaletteDefaultsToKeyframes(
    drift.state,
    drift.state.paletteAmount,
    drift.state.paletteBlend,
    drift.state.paletteColor
  );

  if(typeof drift.resetMotion === "function"){
    drift.resetMotion();
  }

}



function syncDriftPanel(
  panel,
  drift
){

  panel =
    currentDriftPanel(
      panel
    );

  if(!panel){
    return;
  }

  setInput(
    panel,
    "drift-speed",
    speedToUi(drift.state.speed),
    syncValueKnob
  );

  setInput(
    panel,
    "drift-phase",
    drift.state.phase * 100,
    syncValueFader
  );

  setInput(
    panel,
    "drift-amount",
    drift.state.amount,
    syncValueKnob
  );

  setInput(
    panel,
    "drift-hue-bias",
    drift.state.hueBias,
    syncValueKnob
  );

  setInput(
    panel,
    "drift-saturation-bias",
    drift.state.saturationBias,
    syncValueFader
  );

  setInput(
    panel,
    "drift-contrast-bias",
    drift.state.contrastBias,
    syncValueFader
  );

  setInput(
    panel,
    "drift-gamma-bias",
    drift.state.gammaBias,
    syncValueFader
  );

  setInput(
    panel,
    "drift-brightness-bias",
    drift.state.brightnessBias,
    syncValueFader
  );

  setInput(
    panel,
    "drift-jitter",
    drift.state.jitter
  );

  setInput(
    panel,
    "drift-momentum",
    drift.state.momentum
  );

  setInput(
    panel,
    "drift-noise",
    drift.state.driftNoise
  );

  setInput(
    panel,
    "drift-palette-amount",
    displayDriftPaletteAmount(
      drift
    )
  );

  setInput(
    panel,
    "drift-key-duration",
    currentDriftKeyframe(drift.state)?.duration || 1
  );

  setInput(
    panel,
    "driftSeed",
    drift.state.seed
  );

  const seedReadout =
    panel.querySelector(
      "#driftSeedReadout"
    );

  if(seedReadout){
    seedReadout.textContent =
      drift.state.seed;
  }

  setSelect(
    panel,
    "drift-loop-mode",
    drift.state.loopMode,
    input => {
      syncSlideSwitcher(
        input,
        [
          { label:"FWD", value:"forward" },
          { label:"PING", value:"pingpong" },
          { label:"RND", value:"random" }
        ]
      );
    }
  );

  setSelect(
    panel,
    "drift-morph-smooth",
    drift.state.morphSmooth
  );

  setSelect(
    panel,
    "drift-palette-blend",
    displayDriftPaletteBlend(
      drift
    )
  );

  setSelect(
    panel,
    "drift-preset",
    driftPresets[drift.state.presetName]
      ? drift.state.presetName
      : "Custom"
  );

  syncKeyframeEditor(
    panel,
    drift.state
  );

}



function applyDriftPreset(
  drift,
  name
){

  if(name === "Custom"){
    drift.state.presetName =
      "Custom";

    return;
  }

  const preset =
    driftPresets[name];

  if(!preset){
    return;
  }

  Object.assign(
    drift.state,
    clonePreset(
      preset
    ),
    {
      bypass:false,
      presetName:name,
      selectedKeyframe:0
    }
  );

  hydrateKeyframes(
    drift.state
  );

  applyPaletteDefaultsToKeyframes(
    drift.state,
    preset.paletteAmount,
    preset.paletteBlend,
    drift.state.paletteColor
  );

  drift.state.paletteEditActive =
    false;

  if(typeof drift.resetMotion === "function"){
    drift.resetMotion();
  }

}



function clonePreset(preset){

  return JSON.parse(
    JSON.stringify(
      preset
    )
  );

}



function hydrateDriftState(state){

  Object
    .entries(DRIFT_DEFAULTS)
    .forEach(([key,value]) => {

      if(state[key] !== undefined){
        return;
      }

      state[key] =
        Array.isArray(value)
          ? value.map(item => ({ ...item }))
          : value;

    });

  if(
    !Array.isArray(state.keyframes) ||
    !state.keyframes.length
  ){
    state.keyframes =
      driftKeyframes.map(keyframe => ({ ...keyframe }));
  }

  hydrateKeyframes(
    state
  );

}



function hydrateKeyframes(state){

  const sourceKeyframes =
    state.keyframes || [];

  const hasStoredPositions =
    sourceKeyframes.length > 1 &&
    sourceKeyframes.every(keyframe => Number.isFinite(keyframe.position));

  const hasMissingDurations =
    sourceKeyframes.some(keyframe => !Number.isFinite(keyframe.duration));

  state.keyframes =
    sourceKeyframes
      .map((keyframe, index) => ({
        position:Number.isFinite(keyframe.position)
          ? clamp(keyframe.position, 0, 1)
          : index,
        duration:Number.isFinite(keyframe.duration)
          ? Math.max(0.1, keyframe.duration)
          : 1,
        brightness:Number.isFinite(keyframe.brightness) ? keyframe.brightness : 1,
        contrast:Number.isFinite(keyframe.contrast) ? keyframe.contrast : 1,
        saturation:Number.isFinite(keyframe.saturation) ? keyframe.saturation : 1,
        hue:Number.isFinite(keyframe.hue) ? keyframe.hue : 0,
        redGain:Number.isFinite(keyframe.redGain) ? keyframe.redGain : 1,
        greenGain:Number.isFinite(keyframe.greenGain) ? keyframe.greenGain : 1,
        blueGain:Number.isFinite(keyframe.blueGain) ? keyframe.blueGain : 1,
        gamma:Number.isFinite(keyframe.gamma) ? keyframe.gamma : 1,
        paletteAmount:Number.isFinite(keyframe.paletteAmount)
          ? keyframe.paletteAmount
          : 0,
        paletteBlend:typeof keyframe.paletteBlend === "string"
          ? keyframe.paletteBlend
          : "overlay",
        paletteColor:typeof keyframe.paletteColor === "string"
          ? keyframe.paletteColor
          : "#ffffff"
      }));

  if(
    state.keyframes.length &&
    state.keyframes.some(keyframe => keyframe.position > 1)
  ){
      applyDurationPositions(
        state.keyframes
      );
  }

  if(
    hasStoredPositions &&
    hasMissingDurations
  ){
    applyPositionDurations(
      state.keyframes
    );
  }

  state.selectedKeyframe =
    clampKeyframeIndex(
      state,
      state.selectedKeyframe || 0
    );

}



function applyPositionDurations(keyframes){

  if(keyframes.length <= 1){
    if(keyframes[0]){
      keyframes[0].duration =
        1;
    }

    return;
  }

  const scale =
    Math.max(
      1,
      keyframes.length - 1
    );

  keyframes
    .forEach((keyframe, index) => {
      if(index >= keyframes.length - 1){
        keyframe.duration =
          Number.isFinite(keyframe.duration)
            ? keyframe.duration
            : 1;

        return;
      }

      const next =
        keyframes[index + 1];

      keyframe.duration =
        Math.max(
          0.1,
          (
            (next.position || 0) -
            (keyframe.position || 0)
          ) * scale
        );
    });

}



function applyPaletteDefaultsToKeyframes(
  state,
  amount = 0,
  blend = "overlay",
  color = "#ffffff"
){

  const paletteAmount =
    Number.isFinite(amount)
      ? amount
      : 0;

  const paletteBlend =
    typeof blend === "string"
      ? blend
      : "overlay";

  const paletteColor =
    typeof color === "string"
      ? color
      : "#ffffff";

  (state.keyframes || [])
    .forEach(keyframe => {
      keyframe.paletteAmount =
        Number.isFinite(keyframe.paletteAmount) &&
        keyframe.paletteAmount !== 0
          ? keyframe.paletteAmount
          : paletteAmount;

      keyframe.paletteBlend =
        keyframe.paletteBlend || paletteBlend;

      keyframe.paletteColor =
        keyframe.paletteColor || paletteColor;
    });

}



function currentDriftKeyframe(state){

  hydrateKeyframes(
    state
  );

  return state.keyframes[
    clampKeyframeIndex(
      state,
      state.selectedKeyframe || 0
    )
  ];

}



function displayDriftPaletteAmount(drift){

  if(drift.state.paletteEditActive === true){
    return drift.state.paletteAmount;
  }

  return currentDriftKeyframe(
    drift.state
  )?.paletteAmount ?? drift.state.paletteAmount;

}



function displayDriftPaletteBlend(drift){

  if(drift.state.paletteEditActive === true){
    return drift.state.paletteBlend;
  }

  return currentDriftKeyframe(
    drift.state
  )?.paletteBlend ?? drift.state.paletteBlend;

}



function addCurrentDriftKeyframe(
  workstation,
  drift
){

  hydrateKeyframes(
    drift.state
  );

  const position =
    sampledProgress(
      workstation,
      drift
    );

  const keyframe = {
    ...currentVisibleDriftLook(
      drift,
      position
    ),
    position,
    duration:1
  };

  drift.state.keyframes
    .push(keyframe);

  drift.state.keyframes
    .sort((a, b) => a.position - b.position);

  drift.state.selectedKeyframe =
    drift.state.keyframes
      .indexOf(keyframe);

  normalizePositions(
    drift.state.keyframes
  );

  drift.state.presetName =
    "Custom";

  if(typeof drift.resetMotion === "function"){
    drift.resetMotion();
  }

}



function snapshotCurrentDriftKeyframe(
  workstation,
  drift
){

  hydrateKeyframes(
    drift.state
  );

  if(drift.state.keyframes.length <= 1){
    const look =
      currentVisibleDriftLook(
        drift,
        sampledProgress(
          workstation,
          drift
        )
      );

    drift.state.keyframes = [
      {
        ...look,
        position:0,
        duration:1
      },
      {
        ...look,
        position:1,
        duration:1
      }
    ];

    drift.state.selectedKeyframe =
      1;

    drift.state.phase =
      1;

    workstation.core.progress =
      0;

    drift.state.presetName =
      "Custom";

    if(typeof drift.resetMotion === "function"){
      drift.resetMotion();
    }

    bakeDriftBiasControls(
      drift
    );


    return;
  }

  const index =
    clampKeyframeIndex(
      drift.state,
      drift.state.selectedKeyframe || 0
    );

  const position =
    drift.state.keyframes[index]?.position ??
    sampledProgress(
      workstation,
      drift
    );

  const duration =
    drift.state.keyframes[index]?.duration || 1;

  drift.state.keyframes[index] = {
    ...currentVisibleDriftLook(
      drift,
      position
    ),
    position,
    duration
  };

  drift.state.selectedKeyframe =
    index;

  drift.state.phase =
    position;

  drift.state.presetName =
    "Custom";

  bakeDriftBiasControls(
    drift
  );

  if(typeof drift.resetMotion === "function"){
    drift.resetMotion();
  }

}



function deleteCurrentDriftKeyframe(drift){

  hydrateKeyframes(
    drift.state
  );

  if(drift.state.keyframes.length <= 1){
    return;
  }

  drift.state.keyframes
    .splice(
      clampKeyframeIndex(
        drift.state,
        drift.state.selectedKeyframe || 0
      ),
      1
    );

  drift.state.selectedKeyframe =
    clampKeyframeIndex(
      drift.state,
      drift.state.selectedKeyframe || 0
    );

  normalizePositions(
    drift.state.keyframes
  );

  drift.state.presetName =
    "Custom";

}



function selectAdjacentDriftKeyframe(
  workstation,
  drift,
  direction
){

  hydrateKeyframes(
    drift.state
  );

  drift.state.selectedKeyframe =
    clampKeyframeIndex(
      drift.state,
      (drift.state.selectedKeyframe || 0) +
      direction
    );

  focusSelectedDriftKeyframe(
    workstation,
    drift
  );

}



function focusSelectedDriftKeyframe(
  workstation,
  drift
){

  const keyframe =
    currentDriftKeyframe(
      drift.state
    );

  if(!keyframe){
    return;
  }

  workstation.core.progress =
    0;

  drift.state.progress =
    0;

  drift.state.phase =
    normalize01(
      keyframe.position || 0
    );

  drift.state.paletteAmount =
    Number.isFinite(keyframe.paletteAmount)
      ? keyframe.paletteAmount
      : 0;

  drift.state.paletteBlend =
    keyframe.paletteBlend || "overlay";

  drift.state.paletteColor =
    keyframe.paletteColor || "#ffffff";

  bakeDriftBiasControls(
    drift
  );

  if(typeof drift.resetMotion === "function"){
    drift.resetMotion();
  }

}



function moveCurrentDriftKeyframe(
  drift,
  direction
){

  hydrateKeyframes(
    drift.state
  );

  const index =
    clampKeyframeIndex(
      drift.state,
      drift.state.selectedKeyframe || 0
    );

  const next =
    clamp(
      index + direction,
      0,
      drift.state.keyframes.length - 1
    );

  if(next === index){
    return;
  }

  const keyframes =
    drift.state.keyframes;

  [
    keyframes[index],
    keyframes[next]
  ] = [
    keyframes[next],
    keyframes[index]
  ];

  drift.state.selectedKeyframe =
    next;

  normalizePositions(
    keyframes
  );

  drift.state.presetName =
    "Custom";

}



function currentVisibleDriftLook(
  drift,
  position
){

  const baseLook =
    drift.currentLook(
      position
    );

  const biasedLook =
    drift.applyBias(
      baseLook,
      position
    );

  return {
    ...biasedLook,
    ...currentVisibleDriftPalette(
      drift,
      biasedLook
    )
  };

}



function currentVisibleDriftPalette(
  drift,
  look
){

  const liveAmount =
    Number.isFinite(drift.state.paletteAmount)
      ? drift.state.paletteAmount
      : 0;

  if(drift.state.paletteEditActive === true){
    return {
      paletteAmount:liveAmount,
      paletteBlend:drift.state.paletteBlend || "overlay",
      paletteColor:drift.state.paletteColor || "#ffffff"
    };
  }

  return {
    paletteAmount:Number.isFinite(look.paletteAmount)
      ? look.paletteAmount
      : 0,
    paletteBlend:look.paletteBlend || "overlay",
    paletteColor:look.paletteColor || "#ffffff"
  };

}



function bakeDriftBiasControls(drift){

  drift.state.hueBias =
    0;

  drift.state.saturationBias =
    0;

  drift.state.contrastBias =
    0;

  drift.state.gammaBias =
    1;

  drift.state.brightnessBias =
    0;

  drift.state.paletteAmount =
    drift.state.paletteAmount || 0;

  drift.state.paletteEditActive =
    false;

}



function sampledProgress(
  workstation,
  drift
){

  if(drift.state.speed <= 0.0001){
    return normalize01(
      drift.state.phase || 0
    );
  }

  return normalize01(
    (workstation.core.progress || 0) +
    (drift.state.phase || 0)
  );

}



function applyDurationPositions(keyframes){

  if(keyframes.length <= 1){
    if(keyframes[0]){
      keyframes[0].position =
        0;
    }

    return;
  }

  const total =
    keyframes
      .slice(0, -1)
      .reduce(
        (sum, keyframe) => sum + Math.max(0.1, keyframe.duration || 1),
        0
      ) || 1;

  let cursor =
    0;

  keyframes
    .forEach((keyframe, index) => {
      if(index === 0){
        keyframe.position =
          0;

        return;
      }

      if(index === keyframes.length - 1){
        keyframe.position =
          1;

        return;
      }

      cursor +=
        Math.max(
          0.1,
          keyframes[index - 1].duration || 1
        );

      keyframe.position =
        clamp(
          cursor / total,
          0,
          1
        );
    });

}



function normalizePositions(keyframes){

  if(keyframes.length <= 1){
    if(keyframes[0]){
      keyframes[0].position =
        0;
    }

    return;
  }

  keyframes
    .forEach((keyframe, index) => {
      keyframe.position =
        index / (keyframes.length - 1);
    });

}



function clampKeyframeIndex(state, index){

  return Math.round(
    clamp(
      index,
      0,
      Math.max(
        0,
        (state.keyframes || []).length - 1
      )
    )
  );

}



function syncKeyframeEditor(panel, state){

  panel =
    currentDriftPanel(
      panel
    );

  if(!panel){
    return;
  }

  hydrateKeyframes(
    state
  );

  const select =
    panel.querySelector(
      "#drift-keyframe-select"
    );

  if(select){
    const options =
      state.keyframes
        .map((keyframe, index) => new Option(
          keyframeLabel(
            keyframe,
            index
          ),
          String(index)
        ));

    select.replaceChildren(
      ...options
    );

    select.value =
      String(
        state.selectedKeyframe || 0
      );
  }

  const count =
    panel.querySelector(
      "#drift-keyframe-count"
    );

  if(count){
    count.textContent =
      `${state.keyframes.length} ${
        state.keyframes.length === 1
          ? "Key"
          : "Keys"
      }`;
  }

  const duration =
    panel.querySelector(
      "#drift-key-duration"
    );

  if(duration){
    duration.value =
      currentDriftKeyframe(state)?.duration || 1;
  }

}



function currentDriftPanel(panel){

  return (
    document.querySelector('[data-panel="drift"]') ||
    panel
  );

}



function keyframeLabel(
  keyframe,
  index
){

  return `Key ${index + 1} @ ${Math.round((keyframe.position || 0) * 100)}%`;

}



function cloneDriftDefaults(){

  return {
    ...DRIFT_DEFAULTS,
    keyframes:DRIFT_DEFAULTS.keyframes
      .map(keyframe => ({ ...keyframe }))
  };

}



function setInput(
  panel,
  id,
  value,
  sync
){

  const input =
    findControl(
      panel,
      id
    );

  if(!input){
    return;
  }

  input.value =
    value;

  if(typeof sync === "function"){
    sync(input);
  }

}



function setSelect(
  panel,
  id,
  value,
  sync
){

  const input =
    findControl(
      panel,
      id
    );

  if(!input){
    return;
  }

  input.value =
    value;

  if(typeof sync === "function"){
    sync(input);
  }

}



function findControl(
  panel,
  id
){

  return (
    document.getElementById(id) ||
    panel.querySelector(`#${id}`)
  );

}



function pick(values){

  return values[
    Math.floor(
      Math.random() *
      values.length
    )
  ];

}



function rand(min, max){

  return Math.round(
    min +
    Math.random() *
    (max - min)
  );

}



function round(value, decimals){

  return Number(
    value.toFixed(decimals)
  );

}



function normalize01(value){

  return (
    (value % 1) +
    1
  ) % 1;

}



function clamp(value, min, max){

  return Math.max(
    min,
    Math.min(max, value)
  );

}
