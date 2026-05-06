export function renderFMPanel() {
  return `
    <div class="effect-settings fm-settings">
      <div class="fm-title">FM MOD</div>

      <label>Freq</label>
      <input type="range" id="fmFreq" min="0.005" max="0.08" step="0.001" value="0.02">

      <label>Depth</label>
      <input type="range" id="fmDepth" min="0" max="80" step="1" value="25">

      <label>Angle</label>
      <input type="range" id="fmAngle" min="0" max="180" step="1" value="0">

      <label>Threshold</label>
      <input type="range" id="fmThreshold" min="0" max="255" step="1" value="128">
    </div>
  `;
}