export function createSlider({

  id = "",
  label = "",

  min = 0,
  max = 1,
  step = 0.001,
  value = 0

} = {}){

  return `

    <div class="slider-wrap">

      <input
        type="range"

        id="${id}"

        class="slider"

        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
      >

      <span>${label}</span>

    </div>

  `;

}