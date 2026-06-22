import {
  bindValueKnobs,
  syncValueKnob
}
from "./widgets/knob.js?v=value-knob-circular-1";

import {
  bindValueFaders,
  syncValueFader
}
from "./widgets/fader.js?v=widget-fader-redesign-6";

import {
  bindSlideSwitchers,
  bindVerticalSwitchers,
  syncSlideSwitcher,
  syncVerticalSwitcher
}
from "./widgets/switcher.js?v=slide-switcher-wider-stops-1";


const FM_SOURCE_MODES = [
  { label:"Lum", value:"luminance" },
  { label:"R", value:"red" },
  { label:"G", value:"green" },
  { label:"B", value:"blue" },
  { label:"Sat", value:"saturation" },
  { label:"Edge", value:"edge" }
];

const FM_MODES = [
  { label:"Clsc", value:"classic" },
  { label:"Cont", value:"contour" }
];

const FM_LINE_MODES = [
  { label:"Solid", value:"solid" },
  { label:"Dot", value:"dotted" },
  { label:"Break", value:"broken" }
];

const FM_FLOW_MODES = [
  { label:"Vert", value:"vertical" },
  { label:"Horz", value:"horizontal" },
  { label:"Rad", value:"radial" },
  { label:"Noise", value:"noise" },
  { label:"Curl", value:"curl" }
];

const FM_DEFAULTS = {
  freq:0.02,
  depth:25,
  angle:0,
  smooth:1,
  threshold:128,
  lineWidth:50,
  contourDensity:0,
  dotBreakup:0,
  noiseAmount:0,
  signalTear:0,
  fmMode:"classic",
  lineMode:"solid",
  linePolarity:"light",
  flow:0,
  flowMode:"vertical",
  warp:0,
  blend:1,
  blendMode:"full",
  colorize:0,
  colorSpread:0,
  glow:0,
  phaseDrift:0,
  motionAmount:100,
  motionProgress:0,
  motionVelocity:0,
  sourceMode:"luminance",
  presetName:"Classic",
  bypass:false
};

const FM_PRESETS = {
  Classic:{
    freq:0.02,
    depth:25,
    angle:0,
    smooth:1,
    threshold:128,
    lineWidth:50,
    contourDensity:0,
    dotBreakup:0,
    noiseAmount:0,
    signalTear:0,
    fmMode:"classic",
    lineMode:"solid",
    linePolarity:"light",
    flow:0,
    flowMode:"vertical",
    warp:0,
    blend:1,
    blendMode:"full",
    colorize:0,
    colorSpread:0,
    glow:0,
    phaseDrift:0,
    motionAmount:100,
    motionProgress:0,
    motionVelocity:0,
    sourceMode:"luminance"
  },
  Topographic:{
    freq:0.036,
    depth:48,
    angle:28 / 180 * Math.PI,
    smooth:0.72,
    threshold:126,
    lineWidth:36,
    contourDensity:82,
    dotBreakup:12,
    noiseAmount:8,
    signalTear:4,
    fmMode:"contour",
    lineMode:"solid",
    linePolarity:"light",
    flow:0.34,
    flowMode:"radial",
    warp:48,
    blend:0.94,
    blendMode:"full",
    colorize:0.18,
    colorSpread:22,
    glow:18,
    phaseDrift:8,
    motionAmount:82,
    motionProgress:0,
    motionVelocity:0,
    sourceMode:"edge"
  },
  "Line Trace":{
    freq:0.056,
    depth:46,
    angle:0,
    smooth:0.38,
    threshold:150,
    lineWidth:24,
    contourDensity:74,
    dotBreakup:28,
    noiseAmount:10,
    signalTear:34,
    fmMode:"contour",
    lineMode:"broken",
    linePolarity:"light",
    flow:0.32,
    flowMode:"horizontal",
    warp:18,
    blend:1,
    blendMode:"line",
    colorize:0,
    colorSpread:8,
    glow:6,
    phaseDrift:0,
    motionAmount:72,
    motionProgress:0,
    motionVelocity:0,
    sourceMode:"edge"
  },
  Dotted:{
    freq:0.052,
    depth:56,
    angle:64 / 180 * Math.PI,
    smooth:0.58,
    threshold:138,
    lineWidth:28,
    contourDensity:68,
    dotBreakup:62,
    noiseAmount:36,
    signalTear:10,
    fmMode:"contour",
    lineMode:"dotted",
    linePolarity:"light",
    flow:0.24,
    flowMode:"noise",
    warp:36,
    blend:0.9,
    blendMode:"line",
    colorize:0.26,
    colorSpread:18,
    glow:14,
    phaseDrift:12,
    motionAmount:76,
    motionProgress:0,
    motionVelocity:0,
    sourceMode:"luminance"
  },
  "CRT Signal":{
    freq:0.072,
    depth:34,
    angle:0,
    smooth:0.46,
    threshold:118,
    lineWidth:42,
    contourDensity:16,
    dotBreakup:18,
    noiseAmount:28,
    signalTear:48,
    fmMode:"classic",
    lineMode:"broken",
    linePolarity:"light",
    flow:0.52,
    flowMode:"horizontal",
    warp:18,
    blend:1,
    blendMode:"full",
    colorize:0.34,
    colorSpread:44,
    glow:38,
    phaseDrift:42,
    motionAmount:100,
    motionProgress:0,
    motionVelocity:0,
    sourceMode:"luminance"
  }
};


export function bindFMControls(
  workstation,
  moduleKey = "fm"
){

  const fm =
    workstation.effects.modules[
      moduleKey
    ];

  if(!fm){
    return;
  }

  bindVerticalSwitchers({
    switchers:{
      fmMode:{
        label:"FM",
        options:FM_MODES,
        get:() => fm.state.fmMode || "classic",
        set:value => {
          fm.state.fmMode = value;
          workstation.queueRender();
        }
      }
    }
  });

  bindSlideSwitchers({
    switchers:{
      fmLineMode:{
        label:"Line",
        options:FM_LINE_MODES,
        get:() => fm.state.lineMode || "solid",
        set:value => {
          fm.state.lineMode = value;
          workstation.queueRender();
        }
      }
    }
  });

  bindFMLinePolarityButton(
    workstation,
    fm
  );

  bindFMPreset(
    workstation,
    fm
  );

  bindFMBreakupFaders(
    workstation,
    fm
  );

  bindFMBlendSlider(
    workstation,
    fm
  );

  bindFMBlendModeButton(
    workstation,
    fm
  );

  bindFMSourceKnob(
    workstation,
    fm
  );

  bindValueKnobs({
    knobs:{
      fmSourceModeIndex:{
        min:0,
        max:5,
        step:1,
        circular:true,
        get:() => sourceModeToIndex(
          fm.state.sourceMode || "luminance"
        ),
        set:value => {
          fm.state.sourceMode =
            sourceModeFromIndex(value);

          syncFMSourceKnob(
            fm.state.sourceMode
          );

          workstation.queueRender();
        }
      },
      fmFlowModeIndex:{
        min:0,
        max:4,
        step:1,
        circular:true,
        get:() => flowModeToIndex(
          fm.state.flowMode || "vertical"
        ),
        set:value => {
          fm.state.flowMode =
            flowModeFromIndex(value);

          syncFMFlowModeKnob(
            fm.state.flowMode
          );

          workstation.queueRender();
        }
      },
      fmFreq:{
        min:0,
        max:200,
        step:1,
        get:() => fm.freq * 1000,
        set:value => {
          fm.freq = value / 1000;
          workstation.queueRender();
        }
      },
      fmDepth:{
        min:0,
        max:100,
        step:1,
        get:() => fm.depth / 80 * 100,
        set:value => {
          fm.depth = value / 100 * 80;
          workstation.queueRender();
        }
      },
      fmAngle:{
        min:0,
        max:180,
        step:1,
        circular:true,
        get:() => fm.angle / Math.PI * 180,
        set:value => {
          fm.angle = value / 180 * Math.PI;
          workstation.queueRender();
        }
      },
      fmFlow:{
        min:0,
        max:100,
        step:1,
        get:() => fm.flow * 100,
        set:value => {
          fm.flow = value / 100;
          workstation.queueRender();
        }
      },
      fmWarp:{
        min:0,
        max:100,
        step:1,
        get:() => fm.warp,
        set:value => {
          fm.warp = value;
          workstation.queueRender();
        }
      },
      fmSmooth:{
        min:0,
        max:100,
        step:1,
        get:() => fm.smooth * 100,
        set:value => {
          fm.smooth = value / 100;
          workstation.queueRender();
        }
      },
      fmThreshold:{
        min:0,
        max:255,
        step:1,
        get:() => fm.threshold,
        set:value => {
          fm.threshold = value;
          workstation.queueRender();
        }
      },
      fmLineWidth:{
        min:0,
        max:100,
        step:1,
        get:() => fm.lineWidth,
        set:value => {
          fm.lineWidth = value;
          workstation.queueRender();
        }
      },
      fmContourDensity:{
        min:0,
        max:100,
        step:1,
        get:() => fm.contourDensity,
        set:value => {
          fm.contourDensity = value;
          workstation.queueRender();
        }
      },
      fmColorize:{
        min:0,
        max:100,
        step:1,
        get:() => fm.colorize * 100,
        set:value => {
          fm.colorize = value / 100;
          workstation.queueRender();
        }
      },
      fmColorSpread:{
        min:0,
        max:100,
        step:1,
        get:() => fm.colorSpread,
        set:value => {
          fm.colorSpread = value;
          workstation.queueRender();
        }
      },
      fmGlow:{
        min:0,
        max:100,
        step:1,
        get:() => fm.glow,
        set:value => {
          fm.glow = value;
          workstation.queueRender();
        }
      },
      fmPhaseDrift:{
        min:0,
        max:100,
        step:1,
        get:() => fm.phaseDrift,
        set:value => {
          fm.phaseDrift = value;
          workstation.queueRender();
        }
      },
      fmMotionAmount:{
        min:0,
        max:100,
        step:1,
        get:() => fm.motionAmount,
        set:value => {
          fm.motionAmount = value;
          workstation.queueRender();
        }
      }
    }
  });

  bindFMButtons(
    workstation,
    fm
  );

  syncFMPanel(
    fm
  );

}



function bindFMPreset(workstation,fm){

  const preset =
    document.getElementById("fmPreset");

  if(!preset){
    return;
  }

  preset.value =
    fm.state.presetName || "Classic";

  preset.addEventListener("change",() => {
    applyFMPreset(
      fm,
      preset.value
    );

    syncFMPanel(
      fm
    );

    workstation.queueRender();
  });

}



function applyFMPreset(fm,name){

  const preset =
    FM_PRESETS[name];

  if(!preset){
    return;
  }

  Object.assign(
    fm.state,
    preset,
    {
      presetName:name
    }
  );

}



function bindFMButtons(workstation,fm){

  bindButton("fmBypass",() => {
    fm.state.bypass =
      !fm.state.bypass;

    syncFMBypassButton(
      fm
    );

    workstation.queueRender();
  });

  bindButton("fmRandom",() => {
    Object.assign(fm.state,{
      freq:randomInt(4,160) / 1000,
      depth:randomInt(4,80),
      angle:randomInt(0,180) / 180 * Math.PI,
      smooth:randomInt(12,100) / 100,
      threshold:randomInt(70,190),
      lineWidth:randomInt(20,95),
      contourDensity:randomInt(0,100),
      dotBreakup:randomInt(0,100),
      noiseAmount:randomInt(0,65),
      signalTear:randomInt(0,58),
      lineMode:randomItem([
        "solid",
        "dotted",
        "broken"
      ]),
      linePolarity:randomItem([
        "light",
        "dark"
      ]),
      flow:randomInt(0,100) / 100,
      flowMode:randomItem([
        "vertical",
        "horizontal",
        "radial",
        "noise",
        "curl"
      ]),
      warp:randomInt(0,72),
      blend:randomInt(55,100) / 100,
      blendMode:randomItem([
        "full",
        "line"
      ]),
      colorize:randomInt(0,100) / 100,
      colorSpread:randomInt(0,65),
      glow:randomInt(0,52),
      phaseDrift:randomInt(0,100),
      motionAmount:randomInt(35,100),
      motionProgress:0,
      motionVelocity:0,
      sourceMode:randomItem([
        "luminance",
        "red",
        "green",
        "blue",
        "edge",
        "saturation"
      ]),
      fmMode:randomItem([
        "classic",
        "contour"
      ]),
      presetName:"Classic",
      bypass:false
    });

    syncFMPanel(
      fm
    );

    workstation.queueRender();
  });

  bindButton("fmReset",() => {
    Object.assign(
      fm.state,
      FM_DEFAULTS
    );

    syncFMPanel(
      fm
    );

    workstation.queueRender();
  });

}



function syncFMPanel(fm){

  syncFMKnob("fmFreq",fm.freq * 1000,0,200);
  syncFMKnob("fmDepth",fm.depth / 80 * 100,0,100);
  syncFMKnob("fmAngle",fm.angle / Math.PI * 180,0,180);
  syncFMKnob("fmFlow",fm.flow * 100,0,100);
  syncFMFlowModeKnob(fm.state.flowMode || "vertical");
  syncFMKnob("fmWarp",fm.warp,0,100);
  syncFMKnob("fmSmooth",fm.smooth * 100,0,100);
  syncFMKnob("fmThreshold",fm.threshold,0,255);
  syncFMKnob("fmLineWidth",fm.lineWidth,0,100);
  syncFMKnob("fmContourDensity",fm.contourDensity,0,100);
  syncFMFader("fmDotBreakup",fm.dotBreakup,0,100);
  syncFMFader("fmNoiseAmount",fm.noiseAmount,0,100);
  syncFMFader("fmSignalTear",fm.signalTear,0,100);
  syncFMRange("fmBlend",fm.blend * 100);
  syncFMKnob("fmColorize",fm.colorize * 100,0,100);
  syncFMKnob("fmColorSpread",fm.colorSpread,0,100);
  syncFMKnob("fmGlow",fm.glow,0,100);
  syncFMKnob("fmPhaseDrift",fm.phaseDrift,0,100);
  syncFMKnob("fmMotionAmount",fm.motionAmount,0,100);

  syncFMVerticalSwitcher(
    "fmMode",
    fm.state.fmMode || "classic",
    FM_MODES
  );

  syncFMSourceKnob(
    fm.state.sourceMode || "luminance"
  );

  syncFMSwitcher(
    "fmLineMode",
    fm.state.lineMode || "solid",
    FM_LINE_MODES
  );

  syncFMLinePolarityButton(
    fm
  );

  syncFMBlendModeButton(
    fm
  );

  syncFMBypassButton(
    fm
  );

  syncFMPreset(
    fm
  );

}

function bindFMLinePolarityButton(workstation,fm){

  const button =
    document.getElementById("fmLinePolarity");

  if(!button){
    return;
  }

  syncFMLinePolarityButton(
    fm
  );

  button.addEventListener("click",() => {
    fm.state.linePolarity =
      (fm.state.linePolarity || "light") === "dark"
        ? "light"
        : "dark";

    syncFMLinePolarityButton(
      fm
    );

    workstation.queueRender();
  });

}

function syncFMLinePolarityButton(fm){

  const button =
    document.getElementById("fmLinePolarity");

  if(!button){
    return;
  }

  const mode =
    fm.state.linePolarity || "light";

  const isDark =
    mode === "dark";

  const label =
    isDark
      ? "Dark"
      : "Light";

  const readout =
    document.getElementById("fmLinePolarityReadout");

  if(readout){
    readout.textContent =
      label;
  }

  button.dataset.mode =
    isDark
      ? "dark"
      : "light";

  button.setAttribute(
    "aria-label",
    `Line tone ${label}`
  );

  button.setAttribute(
    "aria-pressed",
    isDark ? "true" : "false"
  );

  button.classList.toggle(
    "active",
    isDark
  );

}

function syncFMPreset(fm){

  const preset =
    document.getElementById("fmPreset");

  if(!preset){
    return;
  }

  preset.value =
    FM_PRESETS[fm.state.presetName]
      ? fm.state.presetName
      : "Classic";

}



function bindFMSourceKnob(workstation,fm){

  const input =
    document.getElementById("fmSourceModeIndex");

  if(!input){
    return;
  }

  input.value =
    sourceModeToIndex(
      fm.state.sourceMode || "luminance"
    );

  input.addEventListener("input",() => {
    fm.state.sourceMode =
      sourceModeFromIndex(
        input.value
      );

    syncFMSourceKnob(
      fm.state.sourceMode
    );

    workstation.queueRender();
  });

}



function bindFMBreakupFaders(workstation,fm){

  bindValueFaders({
    faders:{
      fmDotBreakup:{
        min:0,
        max:100,
        step:1,
        get:() => fm.dotBreakup,
        set:value => {
          fm.dotBreakup = value;
        }
      },
      fmSignalTear:{
        min:0,
        max:100,
        step:1,
        get:() => fm.signalTear,
        set:value => {
          fm.signalTear = value;
        }
      },
      fmNoiseAmount:{
        min:0,
        max:100,
        step:1,
        get:() => fm.noiseAmount,
        set:value => {
          fm.noiseAmount = value;
        }
      }
    },
    onChange:() => {
      workstation.queueRender();
    }
  });

}



function bindFMBlendSlider(workstation,fm){

  const input =
    document.getElementById("fmBlend");

  if(!input){
    return;
  }

  input.value =
    fm.blend * 100;

  input.addEventListener("input",() => {
    fm.blend =
      Number(input.value) / 100;

    workstation.queueRender();
  });

}



function bindFMBlendModeButton(workstation,fm){

  const button =
    document.getElementById("fmBlendMode");

  if(!button){
    return;
  }

  syncFMBlendModeButton(
    fm
  );

  button.addEventListener("click",() => {
    fm.state.blendMode =
      (fm.state.blendMode || "full") === "line"
        ? "full"
        : "line";

    syncFMBlendModeButton(
      fm
    );

    workstation.queueRender();
  });

}



function syncFMFader(id,value,min,max){

  const input =
    document.getElementById(id);

  if(!input){
    return;
  }

  input.value =
    value;

  syncValueFader(
    input,
    min,
    max
  );

}



function syncFMKnob(id,value,min,max){

  const input =
    document.getElementById(id);

  if(!input){
    return;
  }

  input.value =
    value;

  syncValueKnob(
    input,
    min,
    max
  );

}



function syncFMRange(id,value){

  const input =
    document.getElementById(id);

  if(!input){
    return;
  }

  input.value =
    value;

}



function syncFMSourceKnob(value){

  const input =
    document.getElementById("fmSourceModeIndex");

  if(!input){
    return;
  }

  const index =
    sourceModeToIndex(value);

  input.value =
    index;

  syncValueKnob(
    input,
    0,
    5
  );

  const readout =
    document.getElementById("fmSourceModeReadout");

  if(readout){
    readout.textContent =
      FM_SOURCE_MODES[index].label;
  }

}



function syncFMFlowModeKnob(value){

  const input =
    document.getElementById("fmFlowModeIndex");

  if(!input){
    return;
  }

  const index =
    flowModeToIndex(value);

  input.value =
    index;

  syncValueKnob(
    input,
    0,
    4
  );

  const readout =
    document.getElementById("fmFlowModeReadout");

  if(readout){
    readout.textContent =
      FM_FLOW_MODES[index].label;
  }

}



function syncFMSwitcher(id,value,options){

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



function syncFMVerticalSwitcher(id,value,options){

  const input =
    document.getElementById(id);

  if(!input){
    return;
  }

  input.value =
    value;

  syncVerticalSwitcher(
    input,
    options
  );

}



function syncFMBlendModeButton(fm){

  const button =
    document.getElementById("fmBlendMode");

  if(!button){
    return;
  }

  const mode =
    fm.state.blendMode || "full";

  const isLine =
    mode === "line";

  const label =
    isLine
      ? "Line"
      : "Full";

  const readout =
    document.getElementById("fmBlendModeReadout");

  if(readout){
    readout.textContent =
      label;
  }

  button.dataset.mode =
    isLine
      ? "line"
      : "full";

  button.setAttribute(
    "aria-label",
    `Blend mode ${label}`
  );

  button.setAttribute(
    "aria-pressed",
    isLine ? "true" : "false"
  );

  button.classList.toggle(
    "active",
    isLine
  );

}



function syncFMBypassButton(fm){

  const button =
    document.getElementById("fmBypass");

  if(!button){
    return;
  }

  button.classList.toggle(
    "active",
    Boolean(fm.state.bypass)
  );

}



function bindButton(id,handler){

  const button =
    document.getElementById(id);

  if(!button){
    return;
  }

  button.addEventListener(
    "click",
    handler
  );

}



function randomInt(min,max){

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;

}



function randomItem(items){

  return items[
    randomInt(
      0,
      items.length - 1
    )
  ];

}



function sourceModeToIndex(value){

  const index =
    FM_SOURCE_MODES.findIndex(
      option => option.value === value
    );

  return index < 0
    ? 0
    : index;

}



function sourceModeFromIndex(value){

  const index =
    Math.max(
      0,
      Math.min(
        FM_SOURCE_MODES.length - 1,
        Math.round(
          Number(value) || 0
        )
      )
    );

  return FM_SOURCE_MODES[index].value;

}



function flowModeToIndex(value){

  const index =
    FM_FLOW_MODES.findIndex(
      option => option.value === value
    );

  return index < 0
    ? 0
    : index;

}



function flowModeFromIndex(value){

  const index =
    Math.max(
      0,
      Math.min(
        FM_FLOW_MODES.length - 1,
        Math.round(
          Number(value) || 0
        )
      )
    );

  return FM_FLOW_MODES[index].value;

}
