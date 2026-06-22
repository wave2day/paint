import {
  bindValueKnobs,
  syncValueKnob
} from "./widgets/knob.js?v=value-knob-circular-1";

import {
  bindSlideSwitchers,
  syncSlideSwitcher
}
from "./widgets/switcher.js?v=slide-switcher-wider-stops-1";

import {
  bindValueFaders,
  syncValueFader
} from "./widgets/fader.js?v=widget-fader-redesign-6";



const PALETTE_SIZES = [
  2,
  4,
  8,
  16,
  32,
  64,
  128
];

const PATTERN_SCALES = [
  1,
  2,
  4,
  8
];

const CHANNEL_MODES = [
  "rgb",
  "luma",
  "mono",
  "indexed"
];

const CHANNEL_LABELS = {
  rgb:"RGB",
  luma:"Luma",
  mono:"Mono",
  indexed:"Index"
};

const OPTION_GROUPS = {
  dtAlgorithm:{
    key:"algorithm",
    options:[
      "bayer",
      "blueNoise",
      "floyd",
      "atkinson",
      "random"
    ]
  },
  dtPaletteBias:{
    key:"paletteBias",
    options:[
      "neutral",
      "neon",
      "crt",
      "cmyk",
      "vapor"
    ]
  }
};

const MATRIX_SIZE_OPTIONS = [
  { label:"2", value:"2" },
  { label:"4", value:"4" },
  { label:"8", value:"8" }
];

const DIFFUSION_CURVE_OPTIONS = [
  { label:"Soft", value:"soft" },
  { label:"Std", value:"standard" },
  { label:"Agg", value:"aggressive" }
];

const DT_DEFAULTS = {
  paletteSize:16,
  channelMode:"rgb",
  algorithm:"bayer",
  matrixSize:4,
  strength:100,
  diffusion:100,
  diffusionCurve:"standard",
  noise:0,
  patternScale:2,
  contrast:0,
  gamma:1,
  blackPoint:0,
  whitePoint:255,
  paletteBias:"neutral",
  bypass:false,
  seed:2409,
  presetName:"CRT Matrix"
};

const DT_PRESETS = {
  "LoFi Camera": {
    algorithm:"atkinson",
    paletteSize:32,
    noise:24,
    strength:100,
    paletteBias:"neutral"
  },
  "Neon Dither": {
    algorithm:"floyd",
    paletteSize:8,
    contrast:20,
    paletteBias:"neon",
    strength:100
  },
  "CRT Matrix": {
    algorithm:"bayer",
    paletteSize:16,
    patternScale:2,
    matrixSize:4,
    strength:80,
    paletteBias:"crt"
  },
  "CMYK Damage": {
    algorithm:"random",
    paletteSize:8,
    noise:40,
    paletteBias:"cmyk",
    strength:100
  },
  "Toxic Vapor": {
    algorithm:"floyd",
    paletteSize:8,
    diffusion:130,
    paletteBias:"vapor",
    contrast:18,
    strength:100
  }
};



export function bindDitherControls(workstation){

  const dither =
    workstation.effects.modules.dither;

  if(!dither){
    return;
  }

  const state =
    dither.state;

  hydrateDitherState(state);

  bindDitherSliders(
    workstation,
    state
  );

  bindDitherValueKnobs(
    workstation,
    state
  );

  bindDitherOptionGroups(
    workstation,
    state
  );

  bindDitherMatrixSwitcher(
    workstation,
    state
  );

  bindDitherCurveSwitcher(
    workstation,
    state
  );

  bindDitherPreset(
    workstation,
    state
  );

  bindDitherButtons(
    workstation,
    state
  );

  bindPanelValues(state);
  syncDitherAlgorithmControls(state);

}



function bindDitherSliders(workstation,state){

  bindValueFaders({
    faders:{
      dtGamma:{
        min:0.25,
        max:3,
        step:0.05,
        get:() => state.gamma,
        set:value => {
          setNumericStateValue(
            state,
            "gamma",
            value
          );
        }
      },
      dtBlackPoint:{
        min:0,
        max:254,
        step:1,
        get:() => state.blackPoint,
        set:value => {
          setNumericStateValue(
            state,
            "blackPoint",
            value
          );
        }
      },
      dtWhitePoint:{
        min:1,
        max:255,
        step:1,
        get:() => state.whitePoint,
        set:value => {
          setNumericStateValue(
            state,
            "whitePoint",
            value
          );
        }
      }
    },
    onChange:() => {
      bindPanelValues(state);
      workstation.queueRender();
    }
  });

}



function bindDitherValueKnobs(workstation,state){

  bindValueKnobs({
    knobs:{
      dtPaletteSize:{
        min:0,
        max:PALETTE_SIZES.length - 1,
        step:1,
        get:() => paletteSizeToIndex(state.paletteSize),
        set:value => {
          state.paletteSize =
            PALETTE_SIZES[Math.round(value)] || 16;
        }
      },
      dtChannelMode:{
        min:0,
        max:CHANNEL_MODES.length - 1,
        step:1,
        circular:true,
        get:() => channelModeToIndex(state.channelMode),
        set:value => {
          state.channelMode =
            CHANNEL_MODES[Math.round(value)] || "rgb";
        }
      },
      dtPatternScale:{
        min:0,
        max:PATTERN_SCALES.length - 1,
        step:1,
        circular:true,
        get:() => patternScaleToIndex(state.patternScale),
        set:value => {
          state.patternScale =
            PATTERN_SCALES[Math.round(value)] || 2;
        }
      },
      dtStrength:{
        min:0,
        max:100,
        step:1,
        get:() => state.strength,
        set:value => {
          state.strength = value;
        }
      },
      dtContrast:{
        min:-50,
        max:50,
        step:1,
        get:() => state.contrast,
        set:value => {
          state.contrast = value;
        }
      },
      dtDiffusion:{
        min:0,
        max:150,
        step:1,
        get:() => state.diffusion,
        set:value => {
          state.diffusion = value;
        }
      },
      dtNoise:{
        min:0,
        max:100,
        step:1,
        get:() => state.noise,
        set:value => {
          state.noise = value;
        }
      }
    },
    onChange:() => {
      bindPanelValues(state);
      syncDitherAlgorithmControls(state);
      workstation.queueRender();
    }
  });

}



function bindDitherOptionGroups(workstation,state){

  Object.entries(OPTION_GROUPS).forEach(([id,config]) => {

    const group =
      document.querySelector(
        `[data-dither-options="${id}"]`
      );

    const input =
      document.getElementById(id);

    if(
      !group ||
      !input
    ){
      return;
    }

    group
      .querySelectorAll(".dither-option-button")
      .forEach(button => {

        button.addEventListener("click",() => {

          if(button.disabled){
            return;
          }

          const value =
            button.dataset.value;

          if(value === undefined){
            return;
          }

          const next =
            id === "dtMatrixSize"
              ? parseFloat(value)
              : value;

          state[config.key] =
            next;

          input.value =
            value;

          syncDitherOptionGroups(state);
          syncDitherAlgorithmControls(state);
          workstation.queueRender();

        });

      });

  });

}



function bindDitherMatrixSwitcher(workstation,state){

  bindSlideSwitchers({
    switchers:{
      dtMatrixSize:{
        label:"Matrix",
        options:MATRIX_SIZE_OPTIONS,
        get:() => String(state.matrixSize),
        set:value => {
          state.matrixSize =
            parseFloat(value);
        }
      }
    },
    onChange:() => {
      bindPanelValues(state);
      syncDitherAlgorithmControls(state);
      workstation.queueRender();
    }
  });

}




function bindDitherCurveSwitcher(workstation,state){

  bindSlideSwitchers({
    switchers:{
      dtDiffusionCurve:{
        label:"Curve",
        options:DIFFUSION_CURVE_OPTIONS,
        get:() => state.diffusionCurve,
        set:value => {
          state.diffusionCurve =
            value;
        }
      }
    },
    onChange:() => {
      bindPanelValues(state);
      syncDitherAlgorithmControls(state);
      workstation.queueRender();
    }
  });

}




function bindDitherPreset(workstation,state){

  const preset =
    document.getElementById("dtPreset");

  if(!preset){
    return;
  }

  preset.value =
    state.presetName;

  preset.addEventListener("change",() => {

    Object.assign(
      state,
      DT_PRESETS[preset.value],
      {
        presetName:preset.value
      }
    );

    constrainPoints(state);
    bindPanelValues(state);
    syncDitherAlgorithmControls(state);
    workstation.queueRender();

  });

}



function bindDitherButtons(workstation,state){

  bindButton("dtBypass",() => {
    state.bypass = !state.bypass;
    workstation.queueRender();
  });

  bindButton("dtReseed",() => {
    state.seed =
      randomInt(1,99999);

    bindPanelValues(state);
    workstation.queueRender();
  });

  bindButton("dtRandom",() => {
    Object.assign(state,{
      paletteSize:pick(PALETTE_SIZES.slice(0,6)),
      channelMode:pick([
        "rgb",
        "luma",
        "mono",
        "indexed"
      ]),
      algorithm:pick([
        "bayer",
        "blueNoise",
        "floyd",
        "atkinson",
        "random"
      ]),
      matrixSize:pick([2,4,8]),
      strength:randomInt(55,100),
      diffusion:randomInt(55,150),
      diffusionCurve:pick([
        "standard",
        "soft",
        "aggressive"
      ]),
      noise:randomInt(0,55),
      patternScale:pick(PATTERN_SCALES),
      contrast:randomInt(-12,34),
      gamma:randomStep(0.7,1.6,0.05),
      blackPoint:randomInt(0,32),
      whitePoint:randomInt(208,255),
      paletteBias:pick([
        "neutral",
        "neon",
        "crt",
        "cmyk",
        "vapor"
      ]),
      seed:randomInt(1,99999),
      bypass:false,
      presetName:"CRT Matrix"
    });

    constrainPoints(state);
    bindPanelValues(state);
    syncDitherAlgorithmControls(state);
    workstation.queueRender();
  });

  bindButton("dtReset",() => {
    Object.assign(state,DT_DEFAULTS);
    bindPanelValues(state);
    syncDitherAlgorithmControls(state);
    workstation.queueRender();
  });

}



function hydrateDitherState(state){

  Object.entries(DT_DEFAULTS).forEach(([key,value]) => {

    if(state[key] === undefined){
      state[key] = value;
    }

  });

  constrainPoints(state);

}



function setNumericStateValue(state,key,value){

  state[key] =
    value;

  constrainPoints(
    state,
    key
  );

}



function constrainPoints(state,changedKey = null){

  state.blackPoint =
    clamp(
      state.blackPoint,
      0,
      254
    );

  state.whitePoint =
    clamp(
      state.whitePoint,
      1,
      255
    );

  if(state.blackPoint >= state.whitePoint){

    if(changedKey === "whitePoint"){
      state.blackPoint =
        Math.max(
          0,
          state.whitePoint - 1
        );
    }else{
      state.whitePoint =
        Math.min(
          255,
          state.blackPoint + 1
        );
    }

  }

}



function syncDitherAlgorithmControls(state){

  const isOrdered =
    state.algorithm === "bayer" ||
    state.algorithm === "blueNoise";

  const usesDiffusion =
    state.algorithm === "floyd" ||
    state.algorithm === "atkinson";

  setControlVisible(
    "dtPatternScale",
    isOrdered
  );

  setControlVisible(
    "dtMatrixSize",
    isOrdered
  );

  setControlEnabled(
    "dtPatternScale",
    isOrdered
  );

  setControlEnabled(
    "dtMatrixSize",
    isOrdered
  );

  setControlEnabled(
    "dtDiffusionCurve",
    usesDiffusion
  );

  setControlEnabled(
    "dtDiffusion",
    usesDiffusion
  );

}



function setControlVisible(id,visible){

  const target =
    getControlTarget(id);

  if(!target){
    return;
  }

  target.classList.toggle(
    "dither-control-hidden",
    !visible
  );

}



function setControlEnabled(id,enabled){

  const target =
    getControlTarget(id);

  const input =
    document.getElementById(id);

  if(input){
    input.disabled =
      !enabled;
  }

  if(!target){
    return;
  }

  target.classList.toggle(
    "is-disabled",
    !enabled
  );

  target
    .querySelectorAll("button,input")
    .forEach(control => {
      control.disabled =
        !enabled;
    });

}



function getControlTarget(id){

  const explicit =
    document.querySelector(
      `[data-dither-control="${id}"]`
    );

  if(explicit){
    return explicit;
  }

  const input =
    document.getElementById(id);

  if(!input){
    return null;
  }

  return input.closest(".value-knob") ||
    input;

}



function syncDitherMatrixSwitcher(state){

  syncDitherSlideSwitcher(
    "dtMatrixSize",
    String(state.matrixSize),
    MATRIX_SIZE_OPTIONS
  );

}



function syncDitherCurveSwitcher(state){

  syncDitherSlideSwitcher(
    "dtDiffusionCurve",
    state.diffusionCurve,
    DIFFUSION_CURVE_OPTIONS
  );

}



function syncDitherSlideSwitcher(id,value,options){

  const input =
    document.getElementById(id);

  if(!input){
    return;
  }

  input.value =
    value;

  syncSlideSwitcher(
    input,
    options
  );

}



function syncDitherOptionGroups(state){

  Object.entries(OPTION_GROUPS).forEach(([id,config]) => {

    const group =
      document.querySelector(
        `[data-dither-options="${id}"]`
      );

    const input =
      document.getElementById(id);

    if(
      !group ||
      !input
    ){
      return;
    }

    const value =
      String(state[config.key]);

    input.value =
      value;

    group
      .querySelectorAll(".dither-option-button")
      .forEach(button => {
        button.classList.toggle(
          "is-active",
          button.dataset.value === value
        );
      });

  });

}



function syncDitherValueKnobs(state){

  const values = {
    dtPaletteSize:{
      value:paletteSizeToIndex(state.paletteSize),
      min:0,
      max:PALETTE_SIZES.length - 1
    },
    dtChannelMode:{
      value:channelModeToIndex(state.channelMode),
      min:0,
      max:CHANNEL_MODES.length - 1
    },
    dtPatternScale:{
      value:patternScaleToIndex(state.patternScale),
      min:0,
      max:PATTERN_SCALES.length - 1
    },
    dtStrength:{
      value:state.strength,
      min:0,
      max:100
    },
    dtContrast:{
      value:state.contrast,
      min:-50,
      max:50
    },
    dtDiffusion:{
      value:state.diffusion,
      min:0,
      max:150
    },
    dtNoise:{
      value:state.noise,
      min:0,
      max:100
    }
  };

  Object.entries(values).forEach(([id,config]) => {

    const input =
      document.getElementById(id);

    if(!input){
      return;
    }

    input.value =
      config.value;

    syncValueKnob(
      input,
      config.min,
      config.max
    );

  });

  syncDitherReadouts(state);

}



function syncDitherReadouts(state){

  setKnobReadout(
    "dtPaletteSize",
    `${state.paletteSize} COL`
  );

  setKnobReadout(
    "dtChannelMode",
    CHANNEL_LABELS[state.channelMode] || "RGB"
  );

  setKnobReadout(
    "dtPatternScale",
    `${state.patternScale}x`
  );

  setKnobReadout(
    "dtStrength",
    `${state.strength}%`
  );

  setKnobReadout(
    "dtContrast",
    signed(state.contrast)
  );

  setKnobReadout(
    "dtDiffusion",
    `${state.diffusion}%`
  );

  setKnobReadout(
    "dtNoise",
    `${state.noise}%`
  );

  const seed =
    document.getElementById("dtNoiseSeed");

  const seedReadout =
    document.getElementById("dtNoiseSeedReadout");

  if(seed){
    seed.value =
      state.seed;
  }

  if(seedReadout){
    seedReadout.textContent =
      state.seed;
  }

}



function setKnobReadout(id,value){

  const input =
    document.getElementById(id);

  const knob =
    input && input.closest(".value-knob");

  if(knob){
    knob.dataset.readout =
      value;
  }

}



function bindButton(id,handler){

  const button =
    document.getElementById(id);

  if(button){
    button.addEventListener("click",handler);
  }

}



function randomInt(min,max){

  return Math.round(
    min + Math.random() * (max - min)
  );

}



function randomStep(min,max,step){

  return Math.round(
    randomInt(min / step,max / step)
  ) * step;

}



function pick(values){

  return values[
    Math.floor(Math.random() * values.length)
  ];

}



function paletteSizeToIndex(value){

  const index =
    PALETTE_SIZES.indexOf(
      parseFloat(value)
    );

  return index === -1
    ? 3
    : index;

}



function channelModeToIndex(value){

  const index =
    CHANNEL_MODES.indexOf(value);

  return index === -1
    ? 0
    : index;

}



function patternScaleToIndex(value){

  const index =
    PATTERN_SCALES.indexOf(
      parseFloat(value)
    );

  return index === -1
    ? 1
    : index;

}



function signed(value){

  const number =
    parseFloat(value) || 0;

  return number > 0
    ? `+${number}`
    : `${number}`;

}



function clamp(value,min,max){

  return Math.max(
    min,
    Math.min(max,value)
  );

}



function bindPanelValues(state){

  const fields = {
    dtGamma:state.gamma,
    dtBlackPoint:state.blackPoint,
    dtWhitePoint:state.whitePoint,
    dtPreset:state.presetName
  };

  Object.entries(fields).forEach(([id,value]) => {

    const el =
      document.getElementById(id);

    if(el){
      el.value = value;
    }

  });

  syncDitherFaders(state);
  syncDitherValueKnobs(state);
  syncDitherOptionGroups(state);
  syncDitherMatrixSwitcher(state);
  syncDitherCurveSwitcher(state);

}



function syncDitherFaders(state){

  const values = {
    dtGamma:{
      value:state.gamma,
      min:0.25,
      max:3,
      readout:state.gamma.toFixed(2)
    },
    dtBlackPoint:{
      value:state.blackPoint,
      min:0,
      max:254,
      readout:String(state.blackPoint)
    },
    dtWhitePoint:{
      value:state.whitePoint,
      min:1,
      max:255,
      readout:String(state.whitePoint)
    }
  };

  Object.entries(values).forEach(([id,config]) => {

    const input =
      document.getElementById(id);

    if(!input){
      return;
    }

    input.value =
      config.value;

    syncValueFader(
      input,
      config.min,
      config.max
    );

    const fader =
      input.closest(".value-fader");

    if(fader){
      fader.dataset.readout =
        config.readout;
    }

  });

}
