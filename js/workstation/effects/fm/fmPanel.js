import { createTransport }
from "../../controls/widgets/transport.js?v=transport-panel-1";

import { createValueKnob }
from "../../controls/widgets/knob.js?v=value-knob-circular-1";

import { createValueFader }
from "../../controls/widgets/fader.js?v=widget-fader-redesign-6";

import {
  createSlideSwitcher,
  createVerticalSwitcher
}
from "../../controls/widgets/switcher.js?v=slide-switcher-wider-stops-1";



export function createFMPanel(){

  return `

    <div class="panel"
         data-panel="fm">

      <div class="effect-panel-layout fm-panel">

        ${createTransport()}

        <div class="fm-section"
             data-effect-block="fm-core">

          <h3 class="section-title">Core Signal</h3>

          <div class="value-knob-row value-knob-row--two fm-core-knobs">
            ${createValueKnob({
              id:"fmFreq",
              label:"Freq",
              min:0,
              max:200,
              step:1,
              value:20,
              variant:"main",
              className:"fm-value-knob"
            })}

            ${createValueKnob({
              id:"fmDepth",
              label:"Depth",
              min:0,
              max:100,
              step:1,
              value:31,
              variant:"main",
              className:"fm-value-knob"
            })}

            ${createValueKnob({
              id:"fmAngle",
              label:"Angle",
              min:0,
              max:180,
              step:1,
              value:0,
              className:"fm-value-knob value-knob--full value-knob--circular"
            })}

            ${createValueKnob({
              id:"fmFlow",
              label:"Flow",
              min:0,
              max:100,
              step:1,
              value:0,
              className:"fm-value-knob"
            })}

            ${createValueKnob({
              id:"fmWarp",
              label:"Warp",
              min:0,
              max:100,
              step:1,
              value:0,
              variant:"main",
              className:"fm-value-knob"
            })}


            <div class="fm-core-mode-cell">
              <div class="fm-mode-switchers">
                <div class="fm-mode-switcher-wrap">
                  ${createVerticalSwitcher({
                    id:"fmMode",
                    label:"FM",
                    value:"classic",
                    options:[
                      { label:"Clsc", value:"classic" },
                      { label:"Cont", value:"contour" }
                    ],
                    className:"fm-mode-toggle"
                  })}
                </div>
              </div>
            </div>

          </div>

          <div class="value-knob-row value-knob-row--two fm-source-field-row">
            <label class="value-knob value-knob--main value-knob--circular fm-source-knob"
                   data-value-knob="fmSourceModeIndex">
              <span class="value-knob__dial"></span>
              <span class="value-knob__markers" aria-hidden="true">
                <i style="--marker-angle:0deg"></i>
                <i style="--marker-angle:60deg"></i>
                <i style="--marker-angle:120deg"></i>
                <i style="--marker-angle:180deg"></i>
                <i style="--marker-angle:240deg"></i>
                <i style="--marker-angle:300deg"></i>
              </span>

              <span class="value-knob__label">Source</span>
              <span class="fm-source-readout"
                    id="fmSourceModeReadout">Lum</span>

              <input
                class="value-knob__input"
                type="range"
                id="fmSourceModeIndex"
                min="0"
                max="5"
                step="1"
                value="0"
              >
            </label>

            <label class="value-knob value-knob--main value-knob--positions-5 value-knob--circular fm-flow-mode-knob"
                   data-value-knob="fmFlowModeIndex">
              <span class="value-knob__dial"></span>
              <span class="value-knob__markers" aria-hidden="true">
                <i style="--marker-angle:0deg"></i>
                <i style="--marker-angle:72deg"></i>
                <i style="--marker-angle:144deg"></i>
                <i style="--marker-angle:216deg"></i>
                <i style="--marker-angle:288deg"></i>
              </span>

              <span class="value-knob__label">Field</span>
              <span class="fm-flow-readout"
                    id="fmFlowModeReadout">Vert</span>

              <input
                class="value-knob__input"
                type="range"
                id="fmFlowModeIndex"
                min="0"
                max="4"
                step="1"
                value="0"
              >
            </label>
          </div>

        </div>

        <div class="fm-section"
             data-effect-block="fm-line">

          <h3 class="section-title">Line Shape</h3>

          <div class="value-knob-row value-knob-row--two fm-line-knobs">
            ${createValueKnob({
              id:"fmSmooth",
              label:"Smooth",
              min:0,
              max:100,
              step:1,
              value:100,
              className:"fm-value-knob"
            })}

            ${createValueKnob({
              id:"fmThreshold",
              label:"Thresh",
              min:0,
              max:255,
              step:1,
              value:128,
              variant:"main",
              className:"fm-value-knob"
            })}

            ${createValueKnob({
              id:"fmLineWidth",
              label:"Width",
              min:0,
              max:100,
              step:1,
              value:50,
              className:"fm-value-knob"
            })}

            ${createValueKnob({
              id:"fmContourDensity",
              label:"Density",
              min:0,
              max:100,
              step:1,
              value:0,
              className:"fm-value-knob"
            })}
          </div>

          <div class="fm-line-switcher-wrap">
            <div class="fm-line-tone-button-wrap">
              <span class="fm-line-tone-label">Tone</span>
              <button
                type="button"
                id="fmLinePolarity"
                class="effect-round-button fm-line-tone-button"
                data-mode="light"
                aria-label="Line tone Light"
                aria-pressed="false"
              ></button>
              <span
                id="fmLinePolarityReadout"
                class="fm-line-tone-readout"
              >Light</span>
            </div>

            ${createSlideSwitcher({
              id:"fmLineMode",
              label:"Line",
              value:"solid",
              options:[
                { label:"Solid", value:"solid" },
                { label:"Dot", value:"dotted" },
                { label:"Break", value:"broken" }
              ],
              className:"fm-mode-switcher"
            })}
          </div>

        </div>

        <div class="fm-section"
             data-effect-block="fm-breakup">

          <h3 class="section-title">Breakup</h3>

          <div class="value-fader-bank fm-breakup-faders">
            ${createValueFader({
              id:"fmDotBreakup",
              label:"Dots",
              className:"fm-breakup-fader",
              min:0,
              max:100,
              step:1,
              value:0
            })}

            ${createValueFader({
              id:"fmSignalTear",
              label:"Tear",
              className:"fm-breakup-fader",
              min:0,
              max:100,
              step:1,
              value:0
            })}

            ${createValueFader({
              id:"fmNoiseAmount",
              label:"Noise",
              className:"fm-breakup-fader",
              min:0,
              max:100,
              step:1,
              value:0
            })}
          </div>

        </div>

        <div class="fm-duo-row">
          <div class="fm-section"
               data-effect-block="fm-motion">

            <h3 class="section-title">Motion</h3>

            <div class="value-knob-row value-knob-row--two fm-motion-knobs">
              ${createValueKnob({
                id:"fmPhaseDrift",
                label:"Phase",
                min:0,
                max:100,
                step:1,
                value:0,
                variant:"main",
                className:"fm-value-knob"
              })}

              ${createValueKnob({
                id:"fmMotionAmount",
                label:"Motion",
                min:0,
                max:100,
                step:1,
                value:100,
                variant:"main",
                className:"fm-value-knob"
              })}
            </div>

          </div>

          <div class="fm-section"
               data-effect-block="fm-color">

            <h3 class="section-title">Color</h3>

            <div class="value-knob-row value-knob-row--two fm-color-knobs">
              ${createValueKnob({
                id:"fmColorize",
                label:"Color",
                min:0,
                max:100,
                step:1,
                value:0,
                variant:"main",
                className:"fm-value-knob"
              })}

              ${createValueKnob({
                id:"fmColorSpread",
                label:"Spread",
                min:0,
                max:100,
                step:1,
                value:0,
                variant:"main",
                className:"fm-value-knob"
              })}

              <div class="fm-blend-mode-button-wrap fm-blend-mode-button-wrap--color">
                <span class="fm-blend-mode-label">Mode</span>
                <button
                  type="button"
                  id="fmBlendMode"
                  class="effect-round-button fm-blend-mode-button"
                  data-mode="full"
                  aria-label="Blend mode Full"
                  aria-pressed="false"
                ></button>
                <span
                  id="fmBlendModeReadout"
                  class="fm-blend-mode-readout"
                >Full</span>
              </div>

              ${createValueKnob({
                id:"fmGlow",
                label:"Glow",
                min:0,
                max:100,
                step:1,
                value:0,
                className:"fm-value-knob"
              })}
            </div>

            <div class="fm-slider-box fm-blend-slider">
              <label for="fmBlend">Blend</label>
              <input
                type="range"
                id="fmBlend"
                min="0"
                max="100"
                step="1"
                value="100"
              >

            </div>

          </div>
        </div>

        <div class="fm-section fm-preset-section"
             data-effect-block="fm-preset">
          <h3 class="section-title">Preset</h3>

          <label class="fm-preset-label">
            <span class="sr-only">Preset</span>
            <select id="fmPreset">
              <option value="Classic">Classic</option>
              <option value="Topographic">Topographic</option>
              <option value="Line Trace">Line Trace</option>
              <option value="Dotted">Dotted</option>
              <option value="CRT Signal">CRT Signal</option>
            </select>
          </label>
        </div>

        <div class="panel-buttons fm-actions">
          <button type="button" id="fmBypass">Bypass</button>
          <button type="button" id="fmRandom">Random</button>
          <button type="button" id="fmReset">Reset</button>
        </div>

      </div>

    </div>

  `;
}
