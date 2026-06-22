export function createLed({

  id = "",
  color = "red",
  state = "off",
  className = ""

} = {}){

  const classes =
    `status-led status-led--${color}` +
    (className ? ` ${className}` : "");

  return `

    <span
      class="${classes}"
      data-led="${id}"
      data-state="${state}"
      aria-hidden="true"
    ></span>

  `;

}
