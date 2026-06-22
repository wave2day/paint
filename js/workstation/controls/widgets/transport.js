export function createTransport(){

  return `

    <div class="transport">

      <button
        id="start"
        class="transport-btn play"
        type="button"
        title="Play"
        aria-label="Play"
      >
        <span class="transport-label">Play</span>
      </button>

      <button
        id="stop"
        class="transport-btn stop"
        type="button"
        title="Stop"
        aria-label="Stop"
      >
        <span class="transport-label">Stop</span>
      </button>

      <button
        id="record"
        class="transport-btn record"
        type="button"
        title="Record"
        aria-label="Record"
      >
        <span class="transport-label">Record</span>
      </button>

    </div>

  `;

}
