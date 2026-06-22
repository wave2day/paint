import {
  bindSlideSwitchers,
  syncSlideSwitcher
} from "./widgets/switcher.js?v=slide-switcher-wider-stops-1";

import {
  bindValueKnobs,
  syncValueKnob
} from "./widgets/knob.js?v=value-knob-circular-1";



const RGB_FRINGE_MODES = [
  "rgb",
  "cyan",
  "magenta",
  "heat"
];



const RGB_DEFAULTS = {
  amount:18,
  angle:0,
  redOffset:70,
  blueOffset:-70,
  greenBias:0,
  blur:0,
  jitter:0,
  leak:0,
  separationMode:"linear",
  fringeMode:"rgb",
  sampleMode:"clamp",
  paletteColor:null,
  bypass:false,
  seed:1207,
  presetName:"Lens Error"
};

const RGB_PRESETS = {
  "Lens Error": {
    amount:12,
    blur:0,
    jitter:0,
    leak:0,
    sampleMode:"clamp"
  },
  "VHS Tracking": {
    amount:28,
    angle:0,
    redOffset:80,
    blueOffset:-80,
    jitter:32,
    leak:10,
    sampleMode:"clamp"
  },
  "RGB Shadow": {
    amount:36,
    blur:12,
    jitter:0,
    leak:36,
    sampleMode:"clamp"
  },
  "Circuit Camera": {
    amount:58,
    jitter:70,
    leak:20,
    sampleMode:"wrap"
  },
  "Neon Split": {
    amount:42,
    redOffset:86,
    blueOffset:-90,
    greenBias:12,
    leak:62,
    sampleMode:"clamp"
  },
  "Signal Failure": {
    amount:86,
    blur:2,
    jitter:96,
    leak:12,
    sampleMode:"wrap"
  }
};



export function bindRgbControls(workstation){

  const rgb =
    workstation.effects.modules.rgb;

  if(!rgb){
    return;
  }

  const state =
    rgb.state;

  const map = {
    rgbRedOffset:"redOffset",
    rgbBlueOffset:"blueOffset",
    rgbGreenBias:"greenBias",
    rgbBlur:"blur",
    rgbJitter:"jitter",
    rgbLeak:"leak"
  };

  Object.entries(map).forEach(([id,key]) => {

    const el =
      document.getElementById(id);

    if(!el){
      return;
    }

    el.value =
      state[key];

    el.addEventListener("input",() => {

      state[key] =
        parseFloat(el.value);

      syncRgbKnobVisuals();

      workstation.queueRender();

    });

  });

  bindValueKnobs({
    knobs:{
      rgbAmount:{
        min:0,
        max:100,
        step:1,
        get:() => state.amount,
        set:value => {
          state.amount = value;
          workstation.queueRender();
        }
      },
      rgbAngle:{
        min:0,
        max:360,
        step:1,
        circular:true,
        get:() => state.angle,
        set:value => {
          state.angle = value;
          workstation.queueRender();
        }
      }
    }
  });

  bindChannelKnobs(
    workstation,
    state
  );

  const sample =
    document.getElementById("rgbSampleMode");

  if(sample){

    sample.value =
      state.sampleMode;

    sample.addEventListener("change",() => {

      state.sampleMode =
        sample.value;

      workstation.queueRender();

    });

  }

  bindSlideSwitchers({
    switchers:{
      rgbSeparationMode:{
        label:"Split Mode",
        options:[
          { label:"Line", value:"linear" },
          { label:"Rad", value:"radial" },
          { label:"Scan", value:"scanline" }
        ],
        get:() => state.separationMode || "linear",
        set:value => {
          state.separationMode = value;
          workstation.queueRender();
        }
      }
    }
  });

  bindValueKnobs({
    knobs:{
      rgbFringeMode:{
        min:0,
        max:3,
        step:1,
        circular:true,
        get:() => fringeModeToIndex(state.fringeMode),
        set:value => {
          state.fringeMode = indexToFringeMode(value);
          workstation.queueRender();
        }
      }
    }
  });

  const preset =
    document.getElementById("rgbPreset");

  if(preset){

    preset.value =
      state.presetName;

    preset.addEventListener("change",() => {

      Object.assign(
        state,
        RGB_DEFAULTS,
        RGB_PRESETS[preset.value],
        {
          presetName:preset.value
        }
      );

      bindPanelValues(state);
      syncRgbKnobVisuals();
      workstation.queueRender();

    });

  }

  bindButton("rgbBypass",() => {
    state.bypass = !state.bypass;
    workstation.queueRender();
  });

  bindButton("rgbRandom",() => {
    Object.assign(state,{
      amount:randomInt(8,90),
      angle:randomInt(0,360),
      redOffset:randomInt(35,100),
      blueOffset:randomInt(-100,-35),
      greenBias:randomInt(-20,20),
      blur:randomInt(0,14),
      jitter:randomInt(0,90),
      leak:randomInt(0,70),
      separationMode:randomItem(["linear","radial","scanline"]),
      fringeMode:randomItem(RGB_FRINGE_MODES),
      sampleMode:Math.random() > 0.72 ? "wrap" : "clamp",
      seed:randomInt(1,99999),
      bypass:false,
      presetName:"Lens Error"
    });
    bindPanelValues(state);
    syncRgbKnobVisuals();
    workstation.queueRender();
  });

  bindButton("rgbReset",() => {
    Object.assign(state,RGB_DEFAULTS);
    bindPanelValues(state);
    syncRgbKnobVisuals();
    workstation.queueRender();
  });

  syncRgbKnobVisuals();

}



function bindChannelKnobs(workstation,state){

  const ranges = {
    rgbRedOffset:{
      key:"redOffset",
      min:-160,
      max:160
    },
    rgbGreenBias:{
      key:"greenBias",
      min:-120,
      max:120
    },
    rgbBlueOffset:{
      key:"blueOffset",
      min:-160,
      max:160
    }
  };

  Object.entries(ranges).forEach(([id,config]) => {

    const input =
      document.getElementById(id);

    if(!input){
      return;
    }

    const knob =
      input.closest(".rgb-mini-knob");

    if(!knob){
      return;
    }

    knob.addEventListener("pointerdown",event => {

      event.preventDefault();

      knob.classList.add("dragging");

      if(knob.setPointerCapture){
        knob.setPointerCapture(event.pointerId);
      }

      const startY =
        event.clientY;

      const startValue =
        parseFloat(input.value);

      function move(moveEvent){

        const delta =
          startY - moveEvent.clientY;

        const value =
          clamp(
            startValue + delta * 1.4,
            config.min,
            config.max
          );

        input.value =
          value;

        state[config.key] =
          value;

        syncRgbKnobVisuals();

        workstation.queueRender();

      }

      function up(upEvent){

        knob.classList.remove("dragging");

        if(knob.releasePointerCapture){
          knob.releasePointerCapture(upEvent.pointerId);
        }

        window.removeEventListener(
          "pointermove",
          move
        );

        window.removeEventListener(
          "pointerup",
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

    });

  });

}



function clamp(value,min,max){

  return Math.max(
    min,
    Math.min(max,value)
  );

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



function bindPanelValues(state){

  const values = {
    rgbAmount:state.amount,
    rgbAngle:state.angle,
    rgbRedOffset:state.redOffset,
    rgbBlueOffset:state.blueOffset,
    rgbGreenBias:state.greenBias,
    rgbBlur:state.blur,
    rgbJitter:state.jitter,
    rgbLeak:state.leak,
    rgbSeparationMode:state.separationMode || "linear",
    rgbFringeMode:state.fringeMode || "rgb",
    rgbSampleMode:state.sampleMode,
    rgbPreset:state.presetName
  };

  Object.entries(values).forEach(([id,value]) => {

    const el =
      document.getElementById(id);

    if(el){
      el.value = value;
    }

  });

  const separationMode =
    document.getElementById("rgbSeparationMode");

  if(separationMode){
    syncSlideSwitcher(
      separationMode,
      [
        { label:"Line", value:"linear" },
        { label:"Rad", value:"radial" },
        { label:"Scan", value:"scanline" }
      ]
    );
  }

  const fringeMode =
    document.getElementById("rgbFringeMode");

  if(fringeMode){
    fringeMode.value =
      fringeModeToIndex(state.fringeMode);

    syncValueKnob(fringeMode,0,3);
  }

  const amount =
    document.getElementById("rgbAmount");

  if(amount){
    syncValueKnob(amount,0,100);
  }

  const angle =
    document.getElementById("rgbAngle");

  if(angle){
    syncValueKnob(angle,0,360);
  }

}



function syncRgbKnobVisuals(){

  const ranges = {
    rgbRedOffset:[
      -160,
      160
    ],
    rgbGreenBias:[
      -120,
      120
    ],
    rgbBlueOffset:[
      -160,
      160
    ]
  };

  Object.entries(ranges).forEach(([id,range]) => {

    const input =
      document.getElementById(id);

    if(!input){
      return;
    }

    const knob =
      input.closest(".rgb-mini-knob");

    if(!knob){
      return;
    }

    const value =
      parseFloat(input.value);

    const norm =
      (value - range[0]) /
      (range[1] - range[0]);

    knob.style.setProperty(
      "--turn",
      `${norm * 270 - 135}deg`
    );

  });

}


function randomItem(items){

  return items[
    randomInt(0,items.length - 1)
  ];

}


function fringeModeToIndex(mode){

  return Math.max(
    0,
    RGB_FRINGE_MODES.indexOf(mode || "rgb")
  );

}



function indexToFringeMode(index){

  return RGB_FRINGE_MODES[
    clamp(Math.round(index),0,RGB_FRINGE_MODES.length - 1)
  ] || "rgb";

}
