export function createDriftPanel(){

  return `
  
    <div class="panel active"
         data-panel="drift">

      <div class="effect-settings">

        <label>Speed</label>

        <input type="range"
               id="speed"
               min="0.001"
               max="0.02"
               step="0.001"
               value="0.004">

        <label>Smooth</label>

        <input type="range"
               id="smooth"
               min="1"
               max="5"
               step="0.1"
               value="2">

        <label>Hue Bias</label>

        <input type="range"
               id="hueBias"
               min="-180"
               max="180"
               step="1"
               value="0">

      </div>

      <div class="transport">

        <button id="start"
                class="transport-btn play"></button>

        <button id="stop"
                class="transport-btn stop"></button>

      </div>

    </div>

  `;

}
