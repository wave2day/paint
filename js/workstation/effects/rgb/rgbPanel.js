import { createSlideSwitcher }
from "../../controls/widgets/switcher.js?v=slide-switcher-wider-stops-1";

import { createValueKnob }
from "../../controls/widgets/knob.js?v=value-knob-circular-1";



export function createRgbPanel(){

  return `

    <div class="panel active"
         data-panel="rgb">

      <div class="effect-panel-layout rgb-panel">

        <div class="rgb-section rgb-section-signal"
             data-effect-block="rgb-signal">

          <div class="section-title">Signal</div>

          <div class="value-knob-row value-knob-row--two rgb-primary-knobs">
            ${createValueKnob({
              id:"rgbAmount",
              label:"Amount",
              min:0,
              max:100,
              step:1,
              value:18,
              variant:"main",
              className:"rgb-value-knob"
            })}

            ${createValueKnob({
              id:"rgbAngle",
              label:"Angle",
              min:0,
              max:360,
              step:1,
              value:0,
              variant:"main",
              className:"rgb-value-knob rgb-angle-knob value-knob--circular"
            })}
          </div>

          <label>Blur</label>
          <input type="range"
                 id="rgbBlur"
                 min="0"
                 max="30"
                 step="1"
                 value="0">

          <label>Jitter</label>
          <input type="range"
                 id="rgbJitter"
                 min="0"
                 max="100"
                 step="1"
                 value="0">

          <label>Leak</label>
          <input type="range"
                 id="rgbLeak"
                 min="0"
                 max="100"
                 step="1"
                 value="0">


        </div>

        <div class="rgb-section rgb-section-channels"
             data-effect-block="rgb-channels">

          <div class="section-title">Channels</div>

          <div class="rgb-fringe-stack">
            ${createValueKnob({
              id:"rgbFringeMode",
              label:"Fringe",
              min:0,
              max:3,
              step:1,
              value:0,
              variant:"main",
              className:"rgb-value-knob value-knob--positions-4 value-knob--circular rgb-fringe-knob"
            })}

            <div class="rgb-mode-switcher-wrap">
              ${createSlideSwitcher({
                id:"rgbSeparationMode",
                label:"Split Mode",
                value:"linear",
                options:[
                  { label:"Line", value:"linear" },
                  { label:"Rad", value:"radial" },
                  { label:"Scan", value:"scanline" }
                ],
                className:"rgb-mode-switcher"
              })}
            </div>
          </div>

          <div class="rgb-knob-row">

            <label class="rgb-mini-knob red">
              <span class="rgb-dial"></span>
              <span>Red</span>
              <input type="range"
                     id="rgbRedOffset"
                     min="-160"
                     max="160"
                     step="1"
                     value="70">
            </label>

            <label class="rgb-mini-knob green">
              <span class="rgb-dial"></span>
              <span>Green</span>
              <input type="range"
                     id="rgbGreenBias"
                     min="-120"
                     max="120"
                     step="1"
                     value="0">
            </label>

            <label class="rgb-mini-knob blue">
              <span class="rgb-dial"></span>
              <span>Blue</span>
              <input type="range"
                     id="rgbBlueOffset"
                     min="-160"
                     max="160"
                     step="1"
                     value="-70">
            </label>

          </div>
          <div class="rgb-select-grid">

            <label>
              Sample
              <select id="rgbSampleMode">
                <option value="clamp">Clamp</option>
                <option value="wrap">Wrap</option>
              </select>
            </label>

            <label>
              Preset
              <select id="rgbPreset">
                <option value="Lens Error">Lens Error</option>
                <option value="VHS Tracking">VHS Tracking</option>
                <option value="RGB Shadow">RGB Shadow</option>
                <option value="Circuit Camera">Circuit Camera</option>
                <option value="Neon Split">Neon Split</option>
                <option value="Signal Failure">Signal Failure</option>
              </select>
            </label>

          </div>

        </div>

        <div class="panel-buttons">
          <button type="button" id="rgbBypass">Bypass</button>
          <button type="button" id="rgbRandom">Random</button>
          <button type="button" id="rgbReset">Reset</button>
        </div>

      </div>

    </div>

  `;

}
