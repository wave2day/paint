import {
  bindValueFaders,
  syncValueFader
}
from "./widgets/fader.js?v=feedback-fader-1";

import {
  bindValueKnobs,
  syncValueKnob
}
from "./widgets/knob.js?v=value-knob-circular-1";

import {
  bindSlideSwitchers,
  syncSlideSwitcher
}
from "./widgets/switcher.js?v=slide-switcher-wider-stops-1";



const PRESETS = {

  "Ghost Trail":{
    memory:55,
    speed:0.004,
    mix:35,
    injection:45,
    blur:2,
    shiftX:0,
    shiftY:0,
    scale:0,
    rotation:0,
    rgbMemoryDrift:0,
    paletteLoss:0,
    noiseInject:0,
    noiseMode:"grain"
  },

  "VHS Memory":{
    memory:70,
    speed:0.005,
    mix:45,
    injection:45,
    blur:2,
    shiftX:3,
    shiftY:0,
    scale:0,
    rotation:0,
    rgbMemoryDrift:15,
    paletteLoss:10,
    noiseInject:10,
    noiseMode:"grain"
  },

  "Circuit Buffer":{
    memory:85,
    speed:0.006,
    mix:65,
    injection:45,
    blur:1,
    shiftX:0,
    shiftY:0,
    scale:0,
    rotation:0,
    rgbMemoryDrift:25,
    paletteLoss:45,
    noiseInject:25,
    noiseMode:"color"
  },

  "Recursive Tunnel":{
    memory:90,
    speed:0.004,
    mix:70,
    injection:35,
    blur:0,
    shiftX:0,
    shiftY:0,
    scale:-2,
    rotation:0.6,
    rgbMemoryDrift:8,
    paletteLoss:20,
    noiseInject:0,
    noiseMode:"grain"
  },

  "Frozen Burn":{
    memory:98,
    speed:0.003,
    mix:80,
    injection:5,
    blur:0,
    shiftX:0,
    shiftY:0,
    scale:0,
    rotation:0,
    rgbMemoryDrift:0,
    paletteLoss:65,
    noiseInject:8,
    noiseMode:"speckle"
  },

  "Buffer Collapse":{
    memory:99,
    speed:0.007,
    mix:90,
    injection:25,
    blur:0,
    shiftX:0,
    shiftY:0,
    scale:0,
    rotation:0,
    rgbMemoryDrift:30,
    paletteLoss:85,
    noiseInject:40,
    noiseMode:"speckle"
  }

};



const TRANSFORM_FADERS = {
  fbBlur:{
    key:"blur",
    min:0,
    max:50,
    step:1
  },
  fbShiftX:{
    key:"shiftX",
    min:-100,
    max:100,
    step:1
  },
  fbShiftY:{
    key:"shiftY",
    min:-100,
    max:100,
    step:1
  },
  fbScale:{
    key:"scale",
    min:-50,
    max:50,
    step:1
  },
  fbRotation:{
    key:"rotation",
    min:-12,
    max:12,
    step:0.1
  }
};



const PRIMARY_KNOBS = {
  fbMemory:{
    key:"memory",
    min:0,
    max:100,
    step:1
  },
  speed:{
    key:"speed",
    min:0.001,
    max:0.02,
    step:0.001
  },
  fbMix:{
    key:"mix",
    min:0,
    max:100,
    step:1
  },
  fbInjection:{
    key:"injection",
    min:0,
    max:100,
    step:1
  }
};



const MEMORY_KNOBS = {
  fbRgbMemoryDrift:{
    key:"rgbMemoryDrift",
    min:0,
    max:100,
    step:1
  },
  fbPaletteLoss:{
    key:"paletteLoss",
    min:0,
    max:100,
    step:1
  },
  fbNoiseInject:{
    key:"noiseInject",
    min:0,
    max:100,
    step:1
  }
};



const COLOR_LOSS_LED_PROFILES = {
  classic:{
    dim:.74,
    normal:.88,
    bright:.97
  },
  balanced:{
    dim:.46,
    normal:.70,
    bright:.90
  },
  soft:{
    dim:.58,
    normal:.78,
    bright:.93
  }
};



const NOISE_MODE_OPTIONS = [
  {
    label:"A",
    value:"grain"
  },
  {
    label:"B",
    value:"color"
  },
  {
    label:"C",
    value:"speckle"
  }
];



export function bindFeedbackControls(workstation){

  const feedback =
    workstation.effects.modules.feedback;

  const response =
    document.getElementById(
      "fbResponseProfile"
    );

  if(response){
    response.value =
      feedback.state.responseProfile ||
      "balanced";

    response.addEventListener(
      "change",
      () => {
        feedback.state.responseProfile =
          response.value;

        syncColorLossLed(
          feedback
        );

        workstation.queueRender();
      }
    );
  }

  const preset =
    document.getElementById(
      "fbPreset"
    );

  if(preset){
    preset.value =
      feedback.state.presetName;

    preset.addEventListener(
      "change",
      () => {
        applyPreset(
          feedback,
          preset.value
        );

        syncPanel(feedback);
        workstation.queueRender();
      }
    );
  }

  const freeze =
    document.getElementById(
      "fbFreeze"
    );

  if(freeze){
    syncFreezeButton(
      freeze,
      feedback.state.freeze
    );

    freeze.addEventListener(
      "click",
      () => {
        feedback.state.freeze =
          !feedback.state.freeze;

        syncFreezeButton(
          freeze,
          feedback.state.freeze
        );

        workstation.queueRender();
      }
    );
  }

  const clear =
    document.getElementById(
      "fbClear"
    );

  if(clear){
    clear.addEventListener(
      "click",
      () => {
        feedback.clear();
        workstation.queueRender();
      }
    );
  }

  const random =
    document.getElementById(
      "fbRandom"
    );

  if(random){
    random.addEventListener(
      "click",
      () => {
        randomize(feedback);
        syncPanel(feedback);
        workstation.queueRender();
      }
    );
  }

  bindFeedbackTransformFaders(
    workstation,
    feedback
  );

  bindFeedbackPrimaryKnobs(
    workstation,
    feedback
  );

  bindFeedbackMemoryKnobs(
    workstation,
    feedback
  );

  bindFeedbackNoiseMode(
    workstation,
    feedback
  );

  syncColorLossLed(
    feedback
  );

}



function applyPreset(feedback, name){

  const preset =
    PRESETS[name];

  if(!preset){
    return;
  }

  Object.assign(
    feedback.state,
    preset,
    {
      freeze:false,
      presetName:name
    }
  );

  feedback.clear();

}



function randomize(feedback){

  Object.assign(
    feedback.state,
    {
      mix:randomInt(20, 90),
      memory:randomInt(50, 99),
      speed:randomFloat(0.002, 0.012, 3),
      injection:randomInt(5, 80),
      blur:randomInt(0, 10),
      shiftX:randomInt(-12, 12),
      shiftY:randomInt(-8, 8),
      scale:randomInt(-4, 4),
      rotation:randomInt(-3, 3),
      rgbMemoryDrift:randomInt(0, 40),
      paletteLoss:randomInt(0, 85),
      noiseInject:randomInt(0, 45),
      noiseMode:
        randomChoice([
          "grain",
          "color",
          "speckle"
        ]),
      seed:randomInt(1, 9999),
      freeze:false,
      presetName:"Custom"
    }
  );

  feedback.clear();

}



function syncPanel(feedback){

  const response =
    document.getElementById(
      "fbResponseProfile"
    );

  if(response){
    response.value =
      feedback.state.responseProfile ||
      "balanced";
  }

  const preset =
    document.getElementById(
      "fbPreset"
    );

  if(preset){
    preset.value =
      PRESETS[feedback.state.presetName]
        ? feedback.state.presetName
        : "Ghost Trail";
  }

  const freeze =
    document.getElementById(
      "fbFreeze"
    );

  if(freeze){
    syncFreezeButton(
      freeze,
      feedback.state.freeze
    );
  }

  syncFeedbackTransformFaders(
    feedback
  );

  syncFeedbackPrimaryKnobs(
    feedback
  );

  syncFeedbackMemoryKnobs(
    feedback
  );

  syncFeedbackNoiseMode(
    feedback
  );

}



function bindFeedbackTransformFaders(
  workstation,
  feedback
){

  const faders = {};

  Object
    .entries(TRANSFORM_FADERS)
    .forEach(([id, config]) => {
      faders[id] = {
        min:config.min,
        max:config.max,
        step:config.step,
        get:() => feedback.state[config.key],
        set:value => {
          feedback.state[config.key] =
            value;
        }
      };
    });

  bindValueFaders({
    faders,
    onChange:() => {
      workstation.queueRender();
    }
  });

}



function syncFeedbackTransformFaders(feedback){

  Object
    .entries(TRANSFORM_FADERS)
    .forEach(([id, config]) => {
      const input =
        document.getElementById(id);

      if(!input){
        return;
      }

      input.value =
        feedback.state[config.key];

      syncValueFader(
        input,
        config.min,
        config.max
      );
    });

}



function bindFeedbackPrimaryKnobs(
  workstation,
  feedback
){

  const knobs = {};

  Object
    .entries(PRIMARY_KNOBS)
    .forEach(([id, config]) => {
      knobs[id] = {
        min:config.min,
        max:config.max,
        step:config.step,
        get:() => getPrimaryKnobValue(
          id,
          config,
          feedback
        ),
        set:value => {
          setPrimaryKnobValue(
            id,
            config,
            feedback,
            value
          );
        }
      };
    });

  bindValueKnobs({
    knobs,
    onChange:() => {
      workstation.queueRender();
    }
  });

}



function syncFeedbackPrimaryKnobs(feedback){

  Object
    .entries(PRIMARY_KNOBS)
    .forEach(([id, config]) => {
      const input =
        document.getElementById(id);

      if(!input){
        return;
      }

      input.value =
        getPrimaryKnobValue(
          id,
          config,
          feedback
        );

      syncValueKnob(
        input,
        config.min,
        config.max
      );
    });

}



function syncColorLossLed(
  feedback,
  pulse = false
){

  const led =
    document
      .querySelector('[data-led="fbPaletteLoss"]');

  if(!led){
    return;
  }

  const amount =
    clamp01(
      feedback.state.paletteLoss / 100
    );

  led.dataset.state =
    colorLossLedState(
      amount,
      feedback.state.responseProfile
    );

  if(!pulse){
    return;
  }

  led.classList.remove(
    "is-pulsing"
  );

  requestAnimationFrame(() => {
    led.classList.add(
      "is-pulsing"
    );
  });

  clearTimeout(
    led._pulseTimer
  );

  led._pulseTimer =
    setTimeout(
      () => {
        led.classList.remove(
          "is-pulsing"
        );
      },
      170
    );

}



function clamp01(value){

  return Math.max(
    0,
    Math.min(1, value)
  );

}



function colorLossLedState(
  amount,
  profileName = "balanced"
){

  const profile =
    COLOR_LOSS_LED_PROFILES[profileName] ||
    COLOR_LOSS_LED_PROFILES.balanced;

  if(amount < profile.dim){
    return "off";
  }

  if(amount < profile.normal){
    return "dim";
  }

  if(amount < profile.bright){
    return "normal";
  }

  return "bright";

}



function getPrimaryKnobValue(
  id,
  config,
  feedback
){

  if(config.key){
    return feedback.state[config.key];
  }

  const input =
    document.getElementById(id);

  const value =
    input
      ? parseFloat(input.value)
      : NaN;

  return Number.isFinite(value)
    ? value
    : config.defaultValue;

}



function setPrimaryKnobValue(
  id,
  config,
  feedback,
  value
){

  if(config.key){
    feedback.state[config.key] =
      value;
  }

}



function bindFeedbackMemoryKnobs(
  workstation,
  feedback
){

  const knobs = {};

  Object
    .entries(MEMORY_KNOBS)
    .forEach(([id, config]) => {
      knobs[id] = {
        min:config.min,
        max:config.max,
        step:config.step,
        get:() => feedback.state[config.key],
        set:value => {
          feedback.state[config.key] =
            value;
        }
      };
    });

  bindValueKnobs({
    knobs,
    onChange:id => {
      if(id === "fbPaletteLoss"){
        syncColorLossLed(
          feedback,
          true
        );
      }

      workstation.queueRender();
    }
  });

}



function bindFeedbackNoiseMode(
  workstation,
  feedback
){

  bindSlideSwitchers({
    switchers:{
      fbNoiseMode:{
        label:"Noise Type",
        options:NOISE_MODE_OPTIONS,
        get:() => feedback.state.noiseMode,
        set:value => {
          feedback.state.noiseMode =
            value;
        }
      }
    },
    onChange:() => {
      workstation.queueRender();
    }
  });

}



function syncFeedbackMemoryKnobs(feedback){

  Object
    .entries(MEMORY_KNOBS)
    .forEach(([id, config]) => {
      const input =
        document.getElementById(id);

      if(!input){
        return;
      }

      input.value =
        feedback.state[config.key];

      syncValueKnob(
        input,
        config.min,
        config.max
      );
    });

  syncColorLossLed(
    feedback
  );

}



function syncFeedbackNoiseMode(feedback){

  const input =
    document.getElementById(
      "fbNoiseMode"
    );

  if(!input){
    return;
  }

  input.value =
    feedback.state.noiseMode;

  syncSlideSwitcher(
    input,
    NOISE_MODE_OPTIONS
  );

}



function syncFreezeButton(button, active){

  button.classList.toggle(
    "active",
    active
  );

  button.textContent =
    active
      ? "Frozen"
      : "Freeze";

}



function randomInt(min, max){

  return Math.round(
    min +
    Math.random() *
    (max - min)
  );

}



function randomChoice(items){

  return items[
    randomInt(
      0,
      items.length - 1
    )
  ];

}



function randomFloat(min, max, decimals){

  const value =
    min +
    Math.random() *
    (max - min);

  return Number(
    value.toFixed(decimals)
  );

}
