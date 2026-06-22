import {
  bindValueKnobs,
  syncValueKnob
} from "./widgets/knob.js?v=value-knob-circular-1";

import {
  bindValueFaders,
  syncValueFader
} from "./widgets/fader.js?v=widget-fader-redesign-6";

import {
  artifactDefaults,
  artifactPresets
} from "../effects/artifact/artifactState.js";

const AR_MODE_OPTIONS = [
  { label:"Clean", value:"clean-codec" },
  { label:"Low", value:"low-bitrate" },
  { label:"Drop", value:"streaming-failure" },
  { label:"File", value:"corrupted-file" },
  { label:"Mosh", value:"datamosh" },
  { label:"Fail", value:"digital-collapse" }
];

const AR_BLOCK_OPTIONS = [
  8,
  16,
  24,
  32,
  48,
  64
];

const AR_PALETTE_BLEND_OPTIONS = [
  "overlay",
  "soft-light",
  "multiply",
  "screen",
  "color"
];

export function bindArtifactControls(workstation){
  const artifact =
    workstation.effects.modules.ar;

  if(!artifact){
    return;
  }

  const state =
    artifact.state;

  const queueRender =
    createArtifactRenderScheduler(workstation);

  bindValueKnobs({
    knobs:{
      arCompression:knobConfig(state,queueRender,"compression"),
      arBitrate:knobConfig(state,queueRender,"bitrate"),
      arChromaLoss:knobConfig(state,queueRender,"chromaLoss"),
      arPaletteAmount:knobConfig(state,queueRender,"paletteAmount",() => {
        state.paletteEditActive =
          true;
      }),
      arPacketLoss:knobConfig(state,queueRender,"packetLoss"),
      arFreezeAmount:knobConfig(state,queueRender,"freezeAmount"),
      arDecodeError:knobConfig(state,queueRender,"decodeError"),
      arMotionCorruption:knobConfig(state,queueRender,"motionCorruption"),
      arDatamoshAmount:knobConfig(state,queueRender,"datamoshAmount"),
      arBufferDamage:knobConfig(state,queueRender,"bufferDamage"),
      arGhosting:knobConfig(state,queueRender,"ghosting"),
      arRecovery:knobConfig(state,queueRender,"recovery"),
      arRecoveryNoise:knobConfig(state,queueRender,"recoveryNoise"),
      arVerticalJump:knobConfig(state,queueRender,"verticalJump",() => {
        artifact.skipDigitalMemoryUpdateOnce =
          true;
      }),
      arSyncRoll:knobConfig(state,queueRender,"syncRoll",() => {
        artifact.skipDigitalMemoryUpdateOnce =
          true;
      }),
      arTvSnow:knobConfig(state,queueRender,"tvSnow",() => {
        artifact.skipDigitalMemoryUpdateOnce =
          true;
      }),
      arTvBurst:knobConfig(state,queueRender,"tvBurst",() => {
        artifact.skipDigitalMemoryUpdateOnce =
          true;
      })
    }
  });

  bindValueFaders({
    faders:{
      arTracking:faderConfig(state,"tracking"),
      arTearing:faderConfig(state,"tearing"),
      arDropout:faderConfig(state,"dropout"),
      arHeadSwitch:faderConfig(state,"headSwitch"),
      arChromaCrawl:faderConfig(state,"chromaCrawl")
    },
    onChange:() => {
      artifact.skipDigitalMemoryUpdateOnce =
        true;

      queueRender();
    }
  });

  bindRange("arAmount",value => {
    state.amount =
      value;

    artifact.skipDigitalMemoryUpdateOnce =
      true;

    queueRender();
  });

  bindRange("arBlend",value => {
    state.blend =
      value;

    artifact.skipDigitalMemoryUpdateOnce =
      true;

    queueRender();
  });

  bindRange("arBlockSize",value => {
    state.blockSize =
      snapBlockSize(value);

    artifact.resetBuffer();
    queueRender(true);
  });

  bindRange("arRegionSize",value => {
    state.regionSize =
      snapRegionSize(value);

    artifact.resetBuffer();
    queueRender(true);
  });

  bindSelect("arPaletteBlend",value => {
    state.paletteBlend =
      value;

    state.paletteEditActive =
      true;

    queueRender();
  });

  bindSelect("arPreset",value => {
    Object.assign(
      state,
      artifactDefaults,
      artifactPresets[value],
      {
        presetName:value
      }
    );

    syncPanelValues(state);
    artifact.resetBuffer();
    queueRender(true);
  });

  bindButton("arBypass",() => {
    state.bypass =
      !state.bypass;

    queueRender(true);
  });

  bindButton("arRandom",() => {
    Object.assign(state,{
      mode:randomItem(AR_MODE_OPTIONS).value,
      presetName:"YouTube 144p",
      amount:randomInt(18,95),
      blend:randomInt(48,92),
      blockSize:randomItem(AR_BLOCK_OPTIONS),
      compression:randomInt(15,90),
      bitrate:randomInt(6,76),
      boundary:randomInt(8,86),
      ringing:randomInt(0,86),
      packetLoss:randomInt(0,78),
      packetDrop:randomInt(0,82),
      regionSize:randomItem([24,32,48,64,96,128]),
      updateFailure:randomInt(0,78),
      freezeAmount:randomInt(8,90),
      blockDrift:randomInt(0,85),
      decodeError:randomInt(0,78),
      bufferDamage:randomInt(0,88),
      bufferRepeat:randomInt(0,88),
      bufferReuse:randomInt(0,82),
      memoryHold:false,
      ghosting:randomInt(0,78),
      recovery:randomInt(8,88),
      recoveryNoise:randomInt(0,58),
      chromaLoss:randomInt(8,78),
      chromaOffset:randomInt(0,64),
      chromaBleed:randomInt(0,72),
      chromaSmear:randomInt(0,70),
      tracking:randomInt(0,72),
      tearing:randomInt(0,82),
      dropout:randomInt(0,78),
      headSwitch:randomInt(0,72),
      chromaCrawl:randomInt(0,70),
      verticalJump:randomInt(0,64),
      syncRoll:randomInt(0,62),
      tvSnow:randomInt(0,70),
      tvBurst:randomInt(0,70),
      motionCorruption:randomInt(0,78),
      datamoshAmount:randomInt(0,78),
      vectorPersistence:randomInt(30,88),
      motionQuality:randomInt(28,78),
      collapseEnergy:0,
      paletteAmount:randomInt(0,72),
      paletteBlend:randomItem(AR_PALETTE_BLEND_OPTIONS),
      seed:randomInt(1,99999),
      bypass:false
    });

    syncPanelValues(state);
    artifact.resetBuffer();
    queueRender(true);
  });

  bindButton("arReseed",() => {
    state.seed =
      randomInt(1,99999);

    syncPanelValues(state);
    artifact.resetBuffer();
    queueRender(true);
  });

  bindButton("arMemoryHold",() => {
    const nextHold =
      !state.memoryHold;

    if(nextHold){
      artifact.captureMemoryHold(
        workstation.core
      );

      state.memoryHold =
        true;

      syncMemoryHoldButton(state);
      return;
    }

    state.memoryHold =
      false;

    syncMemoryHoldButton(state);
    queueRender(true);
  });

  bindButton("arReset",() => {
    Object.assign(
      state,
      artifactDefaults
    );

    syncPanelValues(state);
    artifact.resetBuffer();
    queueRender(true);
  });

  syncPanelValues(state);
}

function knobConfig(state,queueRender,key,afterSet = null){
  return {
    min:0,
    max:100,
    step:1,
    get:() => state[key],
    set:value => {
      state[key] =
        value;

      if(afterSet){
        afterSet(value);
      }

      queueRender();
    }
  };
}

function faderConfig(state,key){
  return {
    min:0,
    max:100,
    step:1,
    get:() => state[key],
    set:value => {
      state[key] =
        value;
    }
  };
}

function syncPanelValues(state){
  const values = {
    arAmount:state.amount,
    arBlend:state.blend,
    arCompression:state.compression,
    arBitrate:state.bitrate,
    arChromaLoss:state.chromaLoss,
    arPaletteAmount:state.paletteAmount,
    arPaletteBlend:state.paletteBlend,
    arPacketLoss:state.packetLoss,
    arFreezeAmount:state.freezeAmount,
    arDecodeError:state.decodeError,
    arTracking:state.tracking,
    arTearing:state.tearing,
    arDropout:state.dropout,
    arHeadSwitch:state.headSwitch,
    arChromaCrawl:state.chromaCrawl,
    arVerticalJump:state.verticalJump,
    arSyncRoll:state.syncRoll,
    arTvSnow:state.tvSnow,
    arTvBurst:state.tvBurst,
    arMotionCorruption:state.motionCorruption,
    arDatamoshAmount:state.datamoshAmount,
    arBufferDamage:state.bufferDamage,
    arGhosting:state.ghosting,
    arRecovery:state.recovery,
    arRecoveryNoise:state.recoveryNoise,
    arBlockSize:String(state.blockSize || 16),
    arRegionSize:String(state.regionSize || 48),
    arSeed:state.seed,
    arPreset:state.presetName,
    arMode:state.mode
  };

  Object.entries(values).forEach(([id,value]) => {
    const element =
      document.getElementById(id);

    if(element){
      element.value =
        value;
    }
  });

  [
    "arCompression",
    "arBitrate",
    "arChromaLoss",
    "arPaletteAmount",
    "arPacketLoss",
    "arFreezeAmount",
    "arDecodeError",
    "arMotionCorruption",
    "arDatamoshAmount",
    "arBufferDamage",
    "arGhosting",
    "arRecovery",
    "arRecoveryNoise",
    "arVerticalJump",
    "arSyncRoll",
    "arTvSnow",
    "arTvBurst"
  ].forEach(id => syncKnob(id,0,100));

  const seedReadout =
    document.getElementById("arSeedReadout");

  if(seedReadout){
    seedReadout.textContent =
      String(state.seed || 1);
  }

  [
    "arTracking",
    "arTearing",
    "arDropout",
    "arHeadSwitch",
    "arChromaCrawl"
  ].forEach(id => syncFader(id,0,100));

  syncMemoryHoldButton(state);
}

function syncKnob(id,min,max){
  const knob =
    document.getElementById(id);

  if(knob){
    syncValueKnob(knob,min,max);
  }
}

function syncFader(id,min,max){
  const fader =
    document.getElementById(id);

  if(fader){
    syncValueFader(fader,min,max);
  }
}

function syncMemoryHoldButton(state){
  const button =
    document.getElementById("arMemoryHold");

  if(!button){
    return;
  }

  button.classList.toggle(
    "is-active",
    Boolean(state.memoryHold)
  );

  button.classList.toggle(
    "active",
    Boolean(state.memoryHold)
  );

  button.setAttribute(
    "aria-pressed",
    state.memoryHold
      ? "true"
      : "false"
  );

  const stateLabel =
    document.getElementById("arMemoryHoldState");

  if(!stateLabel){
    return;
  }

  stateLabel.textContent =
    state.memoryHold
      ? "Held"
      : "Live";

  stateLabel.classList.toggle(
    "is-held",
    Boolean(state.memoryHold)
  );
}

function bindSelect(id,handler){
  const select =
    document.getElementById(id);

  if(select){
    select.addEventListener("change",() => {
      handler(select.value);
    });
  }
}

function bindRange(id,handler){
  const range =
    document.getElementById(id);

  if(range){
    range.addEventListener("input",() => {
      handler(parseFloat(range.value));
    });
  }
}

function createArtifactRenderScheduler(workstation){
  let trailingTimer =
    null;

  let lastQueued =
    0;

  return function queueArtifactRender(immediate = false){
    const now =
      performance.now();

    const minGap =
      90;

    if(trailingTimer){
      clearTimeout(trailingTimer);
    }

    if(immediate || now - lastQueued > minGap){
      lastQueued =
        now;

      workstation.queueRender();
    }

    if(immediate){
      return;
    }

    trailingTimer =
      setTimeout(
        () => {
          lastQueued =
            performance.now();

          workstation.queueRender();
        },
        120
      );
  };
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

function randomItem(items){
  return items[
    randomInt(0,items.length - 1)
  ];
}

function snapBlockSize(value){
  return Math.round(
    Math.max(4,Math.min(64,value)) / 4
  ) * 4;
}

function snapRegionSize(value){
  return Math.round(
    Math.max(16,Math.min(256,value)) / 16
  ) * 16;
}
