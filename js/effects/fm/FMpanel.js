export function createFMPanel(){

  return `

    <div class="panel"
         data-panel="fm">

      <div class="fm-layout">

        <div class="fm-knobs">

          <div class="knob-row">

            <div class="knob" data-knob="freq">
              <div class="dial"></div>
              <span>Freq</span>
            </div>

            <div class="knob" data-knob="depth">
              <div class="dial"></div>
              <span>Depth</span>
            </div>

          </div>

          <div class="knob-row">

            <div class="knob" data-knob="angle">
              <div class="dial"></div>
              <span>Angle</span>
            </div>

            <div class="knob" data-knob="flow">
              <div class="dial"></div>
              <span>Flow</span>
            </div>

          </div>

          <div class="knob-row">

            <div class="knob" data-knob="blend">
              <div class="dial"></div>
              <span>Blend</span>
            </div>

            <div class="knob" data-knob="colorize">
              <div class="dial"></div>
              <span>Color</span>
            </div>

          </div>

        </div>

        <div class="fm-slider-box">

          <div class="fm-sliders">

            <div class="v-slider-wrap">

              <input type="range"
                     id="fmSmooth"
                     class="v-slider"
                     min="0"
                     max="1"
                     step="0.001"
                     value="0.5">

              <span>Smooth</span>

            </div>

            <div class="v-slider-wrap">

              <input type="range"
                     id="fmThreshold"
                     class="v-slider"
                     min="0"
                     max="1"
                     step="0.001"
                     value="0.5">

              <span>Threshold</span>

            </div>

          </div>

        </div>

      </div>

    </div>

  `;
}
