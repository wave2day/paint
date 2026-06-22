import { createTransport }
from "../../controls/widgets/transport.js?v=transport-panel-1";

import { createValueKnob }
from "../../controls/widgets/knob.js?v=value-knob-circular-1";

import { createValueFader }
from "../../controls/widgets/fader.js";

import { createSlideSwitcher }
from "../../controls/widgets/switcher.js?v=slide-switcher-wider-stops-1";

import { driftState }
from "./driftState.js";



export function createDriftPanel(){

  return `

    <div class="panel active drift-panel"
         data-panel="drift">

      ${createTransport()}

      <div class="drift-layout">

        <div class="drift-box"
             data-effect-block="drift-transport">

          <p class="section-title">Transport</p>

          <div class="drift-transport-controls">
            <div class="drift-speed-stack">
              ${createValueKnob({
                id:"drift-speed",
                label:"Speed",
                min:0,
                max:100,
                step:1,
                value:velocityToUi(driftState.speed),
                variant:"main"
              })}

              <div class="drift-loop-row">
                <label class="select-label"
                       for="drift-loop-mode">
                  Loop Mode
                </label>

                ${createSlideSwitcher({
                  id:"drift-loop-mode",
                  options:[
                    { label:"FWD", value:"forward" },
                    { label:"PING", value:"pingpong" },
                    { label:"RND", value:"random" }
                  ],
                  value:driftState.loopMode,
                  className:"slide-switcher--mini"
                })}
              </div>
            </div>

            <div class="value-fader-bank drift-phase-fader">
              ${createValueFader({
                id:"drift-phase",
                label:"Phase",
                min:0,
                max:100,
                step:1,
                value:driftState.phase * 100,
                className:"value-fader--drift-phase"
              })}
            </div>
          </div>

          <label class="select-label"
                 for="drift-preset">
            Preset
          </label>

          <select id="drift-preset">
            ${option("Custom", "Custom", driftState.presetName)}
            ${option("Analog Fade", "Analog Fade", driftState.presetName)}
            ${option("Ambient Flow", "Ambient Flow", driftState.presetName)}
            ${option("VHS Mood", "VHS Mood", driftState.presetName)}
            ${option("Toxic Drift", "Toxic Drift", driftState.presetName)}
            ${option("City Lights", "City Lights", driftState.presetName)}
            ${option("Thermal Dream", "Thermal Dream", driftState.presetName)}
            ${option("Collapse", "Collapse", driftState.presetName)}
            ${option("Indigo Night", "Indigo Night", driftState.presetName)}
            ${option("Signal Bloom", "Signal Bloom", driftState.presetName)}
          </select>

          <label class="select-label"
                 for="drift-keyframe-select">
            Keyframe
            <span id="drift-keyframe-count" class="drift-keyframe-count">
              ${driftState.keyframes.length} Keys
            </span>
          </label>

          <select id="drift-keyframe-select">
            ${keyframeOptions()}
          </select>

          <div class="panel-buttons drift-keyframe-actions">
            <button type="button" id="driftKeyPrev">Prev</button>
            <button type="button" id="driftKeyNext">Next</button>
            <button type="button" id="driftKeyAdd">Add</button>
            <button type="button" id="driftKeySnapshot">Snapshot</button>
            <button type="button" id="driftKeyDelete">Delete</button>
          </div>

          ${rangeControl({
            id:"drift-key-duration",
            label:"Duration",
            min:0.1,
            max:8,
            step:0.1,
            value:currentKeyframeDuration()
          })}

        </div>

        <div class="drift-box"
             data-effect-block="drift-global">

          <p class="section-title">Global</p>

          <div class="value-knob-row value-knob-row--two drift-main-knobs">
            ${createValueKnob({
              id:"drift-amount",
              label:"Amount",
              min:0,
              max:100,
              step:1,
              value:driftState.amount,
              variant:"main"
            })}

            ${createValueKnob({
              id:"drift-hue-bias",
              label:"Hue Bias",
              min:-180,
              max:180,
              step:1,
              value:driftState.hueBias,
              variant:"main",
              className:"value-knob--circular"
            })}
          </div>

          <div class="value-fader-bank value-fader-bank--four drift-bias-faders">
            ${createValueFader({
              id:"drift-saturation-bias",
              label:"Sat",
              min:-100,
              max:200,
              step:1,
              value:driftState.saturationBias
            })}

            ${createValueFader({
              id:"drift-contrast-bias",
              label:"Contrast",
              min:-100,
              max:200,
              step:1,
              value:driftState.contrastBias
            })}

            ${createValueFader({
              id:"drift-gamma-bias",
              label:"Gamma",
              min:0.5,
              max:2.5,
              step:0.01,
              value:driftState.gammaBias
            })}

            ${createValueFader({
              id:"drift-brightness-bias",
              label:"Bright",
              min:-100,
              max:100,
              step:1,
              value:driftState.brightnessBias
            })}
          </div>

        </div>

        <div class="drift-box"
             data-effect-block="drift-motion">

          <p class="section-title">Motion</p>

          <div class="drift-slider-stack">
            ${rangeControl({
              id:"drift-jitter",
              label:"Jitter",
              min:0,
              max:100,
              step:1,
              value:driftState.jitter
            })}

            <div
              class="dither-seed-row"
              data-drift-control="drift-seed"
            >
              <span class="dither-seed-readout"><i>Seed</i><b id="driftSeedReadout">${driftState.seed}</b></span>
              <button
                type="button"
                id="driftReseed"
                class="effect-capsule-button effect-capsule-button--seed"
              >Reseed</button>
              <input type="hidden" id="driftSeed" value="${driftState.seed}">
            </div>

            ${rangeControl({
              id:"drift-momentum",
              label:"Momentum",
              min:0,
              max:100,
              step:1,
              value:driftState.momentum
            })}

            ${rangeControl({
              id:"drift-noise",
              label:"Noise",
              min:0,
              max:100,
              step:1,
              value:driftState.driftNoise
            })}

            ${rangeControl({
              id:"drift-palette-amount",
              label:"Palette",
              min:0,
              max:100,
              step:1,
              value:driftState.paletteAmount
            })}
          </div>

          <label class="select-label"
                 for="drift-morph-smooth">
            Morph Smooth
          </label>

          <select id="drift-morph-smooth">
            ${option("linear", "Linear", driftState.morphSmooth)}
            ${option("smoothstep", "Smoothstep", driftState.morphSmooth)}
            ${option("sine", "Sine", driftState.morphSmooth)}
            ${option("exponential", "Exponential", driftState.morphSmooth)}
          </select>

          <label class="select-label"
                 for="drift-palette-blend">
            Palette Blend
          </label>

          <select id="drift-palette-blend">
            ${option("overlay", "Overlay", driftState.paletteBlend)}
            ${option("soft-light", "Soft Light", driftState.paletteBlend)}
            ${option("multiply", "Multiply", driftState.paletteBlend)}
            ${option("screen", "Screen", driftState.paletteBlend)}
            ${option("color", "Color", driftState.paletteBlend)}
          </select>

        </div>

        <div class="panel-buttons drift-actions">
          <button type="button" id="driftBypass">Bypass</button>
          <button type="button" id="driftRandom">Random</button>
          <button type="button" id="driftReset">Reset</button>
        </div>

      </div>

    </div>

  `;

}



function option(
  value,
  label,
  current
){

  return `
    <option value="${value}"${value === current ? " selected" : ""}>
      ${label}
    </option>
  `;

}



function rangeControl({
  id,
  label,
  min,
  max,
  step,
  value
}){

  return `
    <div class="drift-range-control">
      <label for="${id}">
        ${label}
      </label>

      <input
        type="range"
        id="${id}"
        class="slider"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
      >
    </div>
  `;

}



function keyframeOptions(){

  return (
    driftState.keyframes || []
  )
    .map((keyframe, index) => `
      <option value="${index}"${index === (driftState.selectedKeyframe || 0) ? " selected" : ""}>
        Key ${index + 1}
      </option>
    `)
    .join("");

}



function currentKeyframeDuration(){

  const index =
    driftState.selectedKeyframe || 0;

  const keyframe =
    (driftState.keyframes || [])[index];

  return keyframe?.duration || 1;

}



function velocityToUi(speed){

  const min =
    0.0001;

  const max =
    0.05;

  const norm =
    (speed - min) /
    (max - min);

  return Math.round(
    Math.cbrt(
      Math.max(
        0,
        Math.min(1, norm)
      )
    ) * 100
  );

}
