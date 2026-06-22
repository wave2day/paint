import { createTransport }
from "../../controls/widgets/transport.js?v=transport-panel-1";

import { createValueFader }
from "../../controls/widgets/fader.js?v=feedback-response-profiles-2";

import { createValueKnob }
from "../../controls/widgets/knob.js?v=value-knob-circular-1";

import { createLed }
from "../../controls/widgets/led.js?v=feedback-led-states-1";

import { createSlideSwitcher }
from "../../controls/widgets/switcher.js?v=slide-switcher-wider-stops-1";



export function createFeedbackPanel(){

  return `

    <div class="panel active"
         data-panel="feedback">

      <div class="effect-panel-layout feedback-panel">

        ${createTransport()}

        <div class="feedback-section"
             data-effect-block="feedback-primary">

          <h3 class="section-title">Feedback</h3>

          <div class="value-knob-row value-knob-row--two feedback-primary-knobs">
            ${createValueKnob({
              id:"fbMemory",
              label:"Memory",
              min:0,
              max:100,
              step:1,
              value:55,
              variant:"main"
            })}

            ${createValueKnob({
              id:"speed",
              label:"Speed",
              min:0.001,
              max:0.02,
              step:0.001,
              value:0.004,
              variant:"main"
            })}

            ${createValueKnob({
              id:"fbMix",
              label:"Mix",
              min:0,
              max:100,
              step:1,
              value:35,
              variant:"main"
            })}

            ${createValueKnob({
              id:"fbInjection",
              label:"Injection",
              min:0,
              max:100,
              step:1,
              value:45,
              variant:"main"
            })}
          </div>

          <label class="select-label">Preset</label>
          <select id="fbPreset">
            <option value="Ghost Trail" selected>Ghost Trail</option>
            <option value="VHS Memory">VHS Memory</option>
            <option value="Circuit Buffer">Circuit Buffer</option>
            <option value="Recursive Tunnel">Recursive Tunnel</option>
            <option value="Frozen Burn">Frozen Burn</option>
            <option value="Buffer Collapse">Buffer Collapse</option>
          </select>

        </div>

        <div class="feedback-section"
             data-effect-block="feedback-transform">

          <h3 class="section-title">Transform</h3>

          <div class="value-fader-bank feedback-transform-faders">
            ${createValueFader({
              id:"fbBlur",
              label:"Memory<br>Blur",
              min:0,
              max:50,
              step:1,
              value:2,
              className:"value-fader--memory-blur"
            })}

            ${createValueFader({
              id:"fbShiftX",
              label:"X",
              min:-100,
              max:100,
              step:1,
              value:0
            })}

            ${createValueFader({
              id:"fbShiftY",
              label:"Y",
              min:-100,
              max:100,
              step:1,
              value:0
            })}

            ${createValueFader({
              id:"fbScale",
              label:"Scale",
              min:-50,
              max:50,
              step:1,
              value:0
            })}

            ${createValueFader({
              id:"fbRotation",
              label:"Rot",
              min:-12,
              max:12,
              step:0.1,
              value:0
            })}
          </div>

          <div class="feedback-response-control">
            <label class="select-label">Response</label>
            <select id="fbResponseProfile">
              <option value="classic">Classic</option>
              <option value="balanced" selected>Balanced</option>
              <option value="soft">Soft</option>
            </select>
          </div>

        </div>

        <div class="feedback-section"
             data-effect-block="feedback-memory">

          <h3 class="section-title">Memory</h3>

          <div class="value-knob-row feedback-memory-knobs">
            <div class="feedback-noise-control">
              ${createValueKnob({
                id:"fbNoiseInject",
                label:"Noise",
                min:0,
                max:100,
                step:1,
                value:0
              })}

              ${createSlideSwitcher({
                id:"fbNoiseMode",
                label:"Noise Type",
                value:"grain",
                options:[
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
                ],
                className:"feedback-noise-switcher"
              })}
            </div>

            <div class="feedback-knob-with-led feedback-knob-with-led--color-loss">
              ${createLed({
                id:"fbPaletteLoss",
                color:"red",
                className:"feedback-color-loss-led"
              })}

              ${createValueKnob({
                id:"fbPaletteLoss",
                label:"Color<br>Loss",
                min:0,
                max:100,
                step:1,
                value:0,
                className:"value-knob--color-loss"
              })}
            </div>

            ${createValueKnob({
              id:"fbRgbMemoryDrift",
              label:"RGB<br>Memory Drift",
              min:0,
              max:100,
              step:1,
              value:0
            })}
          </div>

        </div>

        <div class="panel-buttons">
          <button type="button" id="fbFreeze">Freeze</button>
          <button type="button" id="fbRandom">Random</button>
          <button type="button" id="fbClear">Clear</button>
        </div>

      </div>

    </div>

  `;

}
