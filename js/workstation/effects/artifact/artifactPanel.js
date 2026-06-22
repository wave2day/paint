import { createValueKnob }
from "../../controls/widgets/knob.js?v=value-knob-circular-1";

import { createValueFader }
from "../../controls/widgets/fader.js?v=widget-fader-redesign-6";

export function createArtifactPanel(){
  return `
    <div class="panel active"
         data-panel="ar">
      <div class="effect-panel-layout ar-panel">
        <div class="ar-section"
             data-effect-block="ar-global">
          <div class="section-title">AR</div>

          <div class="ar-global-sliders">
            <label class="select-label">Amount</label>
            <input
              type="range"
              id="arAmount"
              min="0"
              max="100"
              step="1"
              value="35"
            >

            <label class="select-label">Blend</label>
            <input
              type="range"
              id="arBlend"
              min="0"
              max="100"
              step="1"
              value="70"
            >
          </div>

          <label class="select-label">Preset</label>
          <select id="arPreset">
            <option value="Clean Codec">Clean Codec</option>
            <option value="YouTube 144p">YouTube 144p</option>
            <option value="Low Bitrate Stream">Low Bitrate Stream</option>
            <option value="Broken DVB">Broken DVB</option>
            <option value="Corrupted AVI">Corrupted AVI</option>
            <option value="VHS Tracking">VHS Tracking</option>
            <option value="Datamosh Intro">Datamosh Intro</option>
            <option value="Buffer Nightmare">Buffer Nightmare</option>
            <option value="Terminal Failure">Terminal Failure</option>
          </select>

          <div class="ar-seed-row"
               data-ar-control="arSeed">
            <span class="ar-seed-readout"><i>Seed</i><b id="arSeedReadout">2406</b></span>
            <button
              type="button"
              id="arReseed"
              class="effect-capsule-button effect-capsule-button--seed"
            >Reseed</button>
            <input type="hidden" id="arSeed" value="2406">
          </div>

        </div>

        <div class="ar-section"
             data-effect-block="ar-compression">
          <div class="section-title">Compression</div>

          <label class="select-label">Block</label>
          <input
            type="range"
            id="arBlockSize"
            min="4"
            max="64"
            step="4"
            value="16"
          >

          <div class="value-knob-row value-knob-row--two ar-codec-knobs">
            ${createValueKnob({
              id:"arCompression",
              label:"Codec",
              min:0,
              max:100,
              step:1,
              value:35,
              className:"ar-value-knob"
            })}

            ${createValueKnob({
              id:"arBitrate",
              label:"Bitrate",
              min:0,
              max:100,
              step:1,
              value:40,
              className:"ar-value-knob"
            })}
          </div>
        </div>

        <div class="ar-section"
             data-effect-block="ar-palette">
          <div class="section-title">Palette</div>

          <div class="value-knob-row value-knob-row--two ar-palette-knobs">
            ${createValueKnob({
              id:"arPaletteAmount",
              label:"Palette",
              min:0,
              max:100,
              step:1,
              value:25,
              className:"ar-value-knob"
            })}

            ${createValueKnob({
              id:"arChromaLoss",
              label:"Chroma",
              min:0,
              max:100,
              step:1,
              value:25,
              className:"ar-value-knob"
            })}
          </div>

          <label class="select-label">Blend</label>
          <select id="arPaletteBlend">
            <option value="overlay">Overlay</option>
            <option value="soft-light">Soft</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="color">Color</option>
          </select>

        </div>

        <div class="ar-section"
             data-effect-block="ar-packet">
          <div class="section-title">Errors</div>

          <div class="value-knob-row ar-packet-knobs">
            ${createValueKnob({
              id:"arPacketLoss",
              label:"Loss",
              min:0,
              max:100,
              step:1,
              value:15,
              className:"ar-value-knob"
            })}

            ${createValueKnob({
              id:"arFreezeAmount",
              label:"Freeze",
              min:0,
              max:100,
              step:1,
              value:45,
              className:"ar-value-knob"
            })}

            ${createValueKnob({
              id:"arDecodeError",
              label:"Decode",
              min:0,
              max:100,
              step:1,
              value:8,
              className:"ar-value-knob"
            })}
          </div>

          <label class="select-label">Region</label>
          <input
            type="range"
            id="arRegionSize"
            min="16"
            max="256"
            step="16"
            value="48"
          >
        </div>

        <div class="ar-section"
             data-effect-block="ar-signal">
          <div class="section-title">VHS</div>

          <div class="value-fader-bank ar-vhs-faders">
            ${createValueFader({
              id:"arTracking",
              label:"Track",
              min:0,
              max:100,
              step:1,
              value:12
            })}

            ${createValueFader({
              id:"arTearing",
              label:"Tear",
              min:0,
              max:100,
              step:1,
              value:8
            })}

            ${createValueFader({
              id:"arDropout",
              label:"Drop",
              min:0,
              max:100,
              step:1,
              value:8
            })}

            ${createValueFader({
              id:"arHeadSwitch",
              label:"Head",
              min:0,
              max:100,
              step:1,
              value:4
            })}

            ${createValueFader({
              id:"arChromaCrawl",
              label:"Crawl",
              min:0,
              max:100,
              step:1,
              value:10
            })}
          </div>

          <div class="value-knob-row value-knob-row--two ar-vhs-event-knobs">
            ${createValueKnob({
              id:"arVerticalJump",
              label:"Slip",
              min:0,
              max:100,
              step:1,
              value:6,
              className:"ar-value-knob"
            })}

            ${createValueKnob({
              id:"arSyncRoll",
              label:"Sync",
              min:0,
              max:100,
              step:1,
              value:4,
              className:"ar-value-knob"
            })}
          </div>
        </div>

        <div class="ar-section"
             data-effect-block="ar-tv">
          <div class="section-title">TV</div>

          <div class="value-knob-row value-knob-row--two ar-tv-knobs">
            ${createValueKnob({
              id:"arTvSnow",
              label:"Snow",
              min:0,
              max:100,
              step:1,
              value:10,
              className:"ar-value-knob"
            })}

            ${createValueKnob({
              id:"arTvBurst",
              label:"Burst",
              min:0,
              max:100,
              step:1,
              value:4,
              className:"ar-value-knob"
            })}
          </div>
        </div>

        <div class="ar-section"
             data-effect-block="ar-motion">
          <div class="section-title">Motion</div>

          <div class="value-knob-row value-knob-row--two ar-motion-knobs">
            ${createValueKnob({
              id:"arMotionCorruption",
              label:"Vector",
              min:0,
              max:100,
              step:1,
              value:0,
              className:"ar-value-knob"
            })}

            ${createValueKnob({
              id:"arDatamoshAmount",
              label:"Mosh",
              min:0,
              max:100,
              step:1,
              value:0,
              className:"ar-value-knob"
            })}
          </div>
        </div>

        <div class="ar-section"
             data-effect-block="ar-buffer">
          <div class="section-title">Memory</div>

          <div class="ar-memory-layout">
            <div class="ar-memory-main">
              ${createValueKnob({
                id:"arBufferDamage",
                label:"Memory",
                min:0,
                max:100,
                step:1,
                value:28,
                variant:"main",
                className:"ar-value-knob ar-memory-main-knob"
              })}

              <div class="ar-memory-actions">
                <span class="ar-memory-hold-label">Hold</span>
                <button
                  type="button"
                  id="arMemoryHold"
                  class="effect-round-button ar-memory-hold"
                  aria-pressed="false"
                  aria-label="Memory Hold"
                ></button>
                <span
                  id="arMemoryHoldState"
                  class="ar-memory-hold-readout"
                >Live</span>
              </div>
            </div>

            <div class="ar-memory-small-stack">
              ${createValueKnob({
                id:"arGhosting",
                label:"Ghost",
                min:0,
                max:100,
                step:1,
                value:18,
                className:"ar-value-knob"
              })}

              ${createValueKnob({
                id:"arRecovery",
                label:"Recover",
                min:0,
                max:100,
                step:1,
                value:45,
                className:"ar-value-knob"
              })}

              ${createValueKnob({
                id:"arRecoveryNoise",
                label:"Noise",
                min:0,
                max:100,
                step:1,
                value:12,
                className:"ar-value-knob"
              })}
            </div>
          </div>
        </div>

        <div class="panel-buttons">
          <button type="button" id="arBypass">Bypass</button>
          <button type="button" id="arRandom">Random</button>
          <button type="button" id="arReset">Default</button>
        </div>
      </div>
    </div>
  `;
}
