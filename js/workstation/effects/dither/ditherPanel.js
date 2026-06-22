import { createValueKnob }
from "../../controls/widgets/knob.js?v=value-knob-circular-1";

import { createSlideSwitcher }
from "../../controls/widgets/switcher.js?v=slide-switcher-wider-stops-1";

import { createValueFader }
from "../../controls/widgets/fader.js?v=widget-fader-redesign-6";



function createDitherOptionGroup({

  id = "",
  label = "",
  value = "",
  options = [],
  className = ""

} = {}){

  return `

    <div
      class="dither-option-group ${className}"
      data-dither-control="${id}"
      data-dither-options="${id}"
    >
      <span class="dither-option-title">${label}</span>

      <div class="dither-option-buttons">
        ${options
          .map(option => `
            <button
              type="button"
              class="dither-option-button${option.value === value ? " is-active" : ""}"
              data-value="${option.value}"
            >${option.label}</button>
          `)
          .join("")}
      </div>

      <input
        type="hidden"
        id="${id}"
        value="${value}"
      >
    </div>

  `;

}



export function createDitherPanel(){

  return `

    <div class="panel active"
         data-panel="dither">

      <div class="effect-panel-layout dither-panel">

        <div class="dither-section"
             data-effect-block="dither-palette">

        <h3 class="section-title">Palette & Quantization</h3>

        <div class="value-knob-row value-knob-row--two dither-palette-knobs">
          ${createValueKnob({
            id:"dtPaletteSize",
            label:"Colors",
            min:0,
            max:6,
            step:1,
            value:3,
            variant:"main",
            className:"dither-value-knob"
          })}

          ${createValueKnob({
            id:"dtChannelMode",
            label:"Channel",
            min:0,
            max:3,
            step:1,
            value:0,
            variant:"main",
            className:"dither-value-knob value-knob--positions-4 value-knob--circular dither-channel-knob"
          })}
        </div>

        ${createDitherOptionGroup({
          id:"dtPaletteBias",
          label:"Bias",
          value:"neutral",
          options:[
            { label:"Neutral", value:"neutral" },
            { label:"Neon", value:"neon" },
            { label:"CRT", value:"crt" },
            { label:"CMYK", value:"cmyk" },
            { label:"Vapor", value:"vapor" }
          ],
          className:"dither-options-wide"
        })}

        </div>

        <div class="dither-section"
             data-effect-block="dither-algorithm">

        <h3 class="section-title">Algorithm & Pattern</h3>

        ${createDitherOptionGroup({
          id:"dtAlgorithm",
          label:"Mode",
          value:"bayer",
          options:[
            { label:"Grid", value:"bayer" },
            { label:"Blue", value:"blueNoise" },
            { label:"Flow", value:"floyd" },
            { label:"Mac", value:"atkinson" },
            { label:"Rand", value:"random" }
          ],
          className:"dither-options-wide dither-mode-options"
        })}

        <div class="dither-pattern-bank">
          <div class="value-knob-row dither-pattern-knobs"
               data-dither-control="dtPatternScale">
            ${createValueKnob({
              id:"dtPatternScale",
              label:"Cell",
              min:0,
              max:3,
              step:1,
              value:1,
              className:"dither-value-knob value-knob--positions-4 value-knob--circular dither-cell-knob"
            })}
          </div>

          <div
            class="dither-matrix-switcher-wrap"
            data-dither-control="dtMatrixSize"
          >
            ${createSlideSwitcher({
              id:"dtMatrixSize",
              label:"Matrix",
              value:"4",
              options:[
                { label:"2", value:"2" },
                { label:"4", value:"4" },
                { label:"8", value:"8" }
              ],
              className:"dither-matrix-switcher"
            })}
          </div>
        </div>

        <label class="select-label">Preset</label>
        <select id="dtPreset">
          <option value="LoFi Camera">LoFi Camera</option>
          <option value="Neon Dither">Neon Dither</option>
          <option value="CRT Matrix" selected>CRT Matrix</option>
          <option value="CMYK Damage">CMYK Damage</option>
          <option value="Toxic Vapor">Toxic Vapor</option>
        </select>

        </div>

        <div class="dither-section"
             data-effect-block="dither-error">

        <h3 class="section-title">Error & Noise</h3>

        <div class="value-knob-row value-knob-row--two dither-error-knobs">
          <div class="dither-noise-control">
            ${createValueKnob({
              id:"dtNoise",
              label:"Grain",
              min:0,
              max:100,
              step:1,
              value:0,
              variant:"main",
              className:"dither-value-knob"
            })}

            <div
              class="dither-seed-row"
              data-dither-control="dtNoiseSeed"
            >
              <span class="dither-seed-readout"><i>Seed</i><b id="dtNoiseSeedReadout">2409</b></span>
              <button
                type="button"
                id="dtReseed"
                class="effect-capsule-button effect-capsule-button--seed"
              >Reseed</button>
              <input type="hidden" id="dtNoiseSeed" value="2409">
            </div>
          </div>

          <div class="dither-spread-control">
            ${createValueKnob({
              id:"dtDiffusion",
              label:"Spread",
              min:0,
              max:150,
              step:1,
              value:100,
              variant:"main",
              className:"dither-value-knob"
            })}

            <div
              class="dither-curve-switcher-wrap"
              data-dither-control="dtDiffusionCurve"
            >
              ${createSlideSwitcher({
                id:"dtDiffusionCurve",
                label:"Curve",
                value:"standard",
                options:[
                  { label:"Soft", value:"soft" },
                  { label:"Std", value:"standard" },
                  { label:"Agg", value:"aggressive" }
                ],
                className:"dither-curve-switcher"
              })}
            </div>
          </div>
        </div>

        </div>

        <div class="dither-section"
             data-effect-block="dither-output">

        <h3 class="section-title">Image Prep & Output</h3>

        <div class="value-knob-row value-knob-row--two dither-output-knobs">
          ${createValueKnob({
            id:"dtStrength",
            label:"Strength",
            min:0,
            max:100,
            step:1,
            value:100,
            variant:"main",
            className:"dither-value-knob"
          })}

          ${createValueKnob({
            id:"dtContrast",
            label:"Contrast",
            min:-50,
            max:50,
            step:1,
            value:0,
            variant:"main",
            className:"dither-value-knob"
          })}
        </div>

        <div class="value-fader-bank dither-output-faders">
          ${createValueFader({
            id:"dtGamma",
            label:"Gamma",
            min:0.25,
            max:3,
            step:0.05,
            value:1,
            className:"dither-output-fader"
          })}

          ${createValueFader({
            id:"dtBlackPoint",
            label:"Black",
            min:0,
            max:254,
            step:1,
            value:0,
            className:"dither-output-fader"
          })}

          ${createValueFader({
            id:"dtWhitePoint",
            label:"White",
            min:1,
            max:255,
            step:1,
            value:255,
            className:"dither-output-fader"
          })}
        </div>

        </div>

        <div class="panel-buttons">
          <button type="button" id="dtBypass">Bypass</button>
          <button type="button" id="dtRandom">Random</button>
          <button type="button" id="dtReset">Reset</button>
        </div>

      </div>

    </div>

  `;

}
