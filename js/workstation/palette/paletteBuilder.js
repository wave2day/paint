const blocks = [
  {
    name:"RGB CORE",
    colors:["#ff0000","#00ff00","#0000ff","#ff00ff","#00ffff"]
  },
  {
    name:"CRT BLUES",
    colors:["#0018ff","#0050ff","#0080ff","#50b0ff","#c0ecff"]
  },
  {
    name:"PHOSPHOR GREENS",
    colors:["#008800","#00ff00","#44ff00","#bbff00","#ffee00"]
  },
  {
    name:"VHS PURPLE",
    colors:["#8a00c8","#6f00ff","#b34cff","#dd77ff","#efb4ff"]
  },
  {
    name:"HOT SIGNAL",
    colors:["#ffff00","#ffc800","#ff8800","#ff4400","#ff0000"]
  },
  {
    name:"LIQUID CYAN",
    colors:["#00dfff","#00d8e8","#00dff0","#66f0ff","#c8ffff"]
  },
  {
    name:"ACID SIGNAL",
    colors:["#22ff00","#33ff22","#66ff00","#aaff00","#ffff00"]
  },
  {
    name:"ANALOG DIRTY",
    colors:["#8b2e00","#b35c00","#5f3b00","#4d5a2d","#111111"]
  },
  {
    name:"VHS HEAT",
    colors:["#ff0033","#ff5500","#ff9900","#ff6600","#ffcc00"]
  },
  {
    name:"DIGITAL BLOOM",
    colors:["#b08cc2","#d9a3c1","#e1a6bb","#c9b6e3","#f062b5"]
  },
  {
    name:"RGB BLEED",
    colors:["#0033ff","#0066ff","#0088ff","#4a6cff","#6fa3d8"]
  },
  {
    name:"ULTRAVIOLET",
    colors:["#ff00ff","#d405ff","#8a2eff","#c94cff","#ff66cc"]
  }
];

const fixedColors = [
  "#000000",
  "#ffffff",
  "#3a3a3a",
  "#6a6a6a",
  "#b08cc2",
  "#d9a3c1",
  "#f062b5",
  "#6ec1e4",
  "#3b3bb3",
  "#1a4ed8",

  "#4a6cff",
  "#74d4cf",
  "#5a2a21",
  "#e1a6bb",
  "#a87ac2",
  "#7a6ccf",
  "#5c6fb3",
  "#c9b6e3",
  "#6fa3d8",
  "#63c7c9"
];

function createSlots(selectedGrid){
  selectedGrid.innerHTML = "";

  for(let i = 0; i < 30; i++){
    const slot =
      document.createElement("div");

    slot.className = "slot";

    selectedGrid.appendChild(slot);
  }
}

function renderFixedPalette(sourcePalette){
  sourcePalette.innerHTML = "";

  fixedColors.forEach(color => {
    const dot =
      document.createElement("div");

    dot.className = "source-color";
    dot.style.background = color;

    sourcePalette.appendChild(dot);
  });
}

function buildFinalPalette(variableColors){
  const firstRowVariables =
    variableColors.slice(0, 15);

  const secondRowVariables =
    variableColors.slice(15, 30);

  const firstRowFixed =
    fixedColors.slice(0, 10);

  const secondRowFixed =
    fixedColors.slice(10, 20);

  return [
    ...firstRowVariables,
    ...firstRowFixed,
    ...secondRowVariables,
    ...secondRowFixed
  ];
}

export function createPaletteBuilder({
  onApply,
  onCancel
} = {}){
  const root =
    document.createElement("div");

  root.className = "palette-builder-content";

  root.innerHTML = `
    <div class="palette-builder">
      <div class="pb-left">
        <h3>CUSTOM COLORS</h3>
        <div class="selected-grid"></div>

        <h3 class="pb-fixed-title">FIXED COLORS</h3>
        <div class="source-palette"></div>
      </div>

      <div class="pb-right">
        <h3>COLOR BLOCKS</h3>
        <div class="block-list"></div>
      </div>
    </div>

    <div class="pb-footer">
      <button type="button" class="reset-btn">RESET</button>

      <div class="pb-actions">
        <button type="button" class="cancel-btn">CANCEL</button>
        <button type="button" class="apply-btn">APPLY</button>
      </div>
    </div>
  `;

  const selectedGrid =
    root.querySelector(".selected-grid");

  const blockList =
    root.querySelector(".block-list");

  const sourcePalette =
    root.querySelector(".source-palette");

  const resetBtn =
    root.querySelector(".reset-btn");

  const cancelBtn =
    root.querySelector(".cancel-btn");

  const applyBtn =
    root.querySelector(".apply-btn");

  const selectedBlocks = [];

  function updateSelectedGrid(){
    const slots =
      selectedGrid.querySelectorAll(".slot");

    slots.forEach(slot => {
      slot.className = "slot";
      slot.style.background = "";
    });

    const colors =
      selectedBlocks.flatMap(index => blocks[index].colors);

    colors.forEach((color, index) => {
      if(!slots[index]) return;

      slots[index].classList.add("filled");
      slots[index].style.background = color;
    });
  }

  function syncBlockStates(){
    const rows =
      blockList.querySelectorAll(".block");

    rows.forEach(row => {
      const index =
        Number(row.dataset.index);

      const isSelected =
        selectedBlocks.includes(index);

      row.classList.toggle("selected", isSelected);
    });
  }

  function toggleBlock(index){
    const existing =
      selectedBlocks.indexOf(index);

    if(existing !== -1){
      selectedBlocks.splice(existing, 1);
    }else{
      if(selectedBlocks.length >= 6){
        return;
      }

      selectedBlocks.push(index);
    }

    syncBlockStates();
    updateSelectedGrid();
  }

  function renderBlocks(){
    blockList.innerHTML = "";

    blocks.forEach((block, index) => {
      const row =
        document.createElement("div");

      row.className = "block";
      row.dataset.index = index;

      row.innerHTML = `
        <div class="block-name">
          ${block.name}
        </div>

        <div class="block-swatches">
          ${block.colors.map(color => `
            <div
              class="swatch"
              style="background:${color}">
              <span>${color}</span>
            </div>
          `).join("")}
        </div>
      `;

      row.addEventListener("click", () => {
        toggleBlock(index);
      });

      blockList.appendChild(row);
    });

    syncBlockStates();
  }

  function resetPalette(){
    selectedBlocks.length = 0;
    syncBlockStates();
    updateSelectedGrid();
  }

  function applyPalette(){
    if(selectedBlocks.length !== 6){
      alert("Select exactly 6 variable blocks.");
      return;
    }

    const variable =
      selectedBlocks.flatMap(index => blocks[index].colors);

    const full =
      buildFinalPalette(variable);

    const palette = {
      fixed: fixedColors,
      variable,
      full
    };

    window.dispatchEvent(new CustomEvent("palette:apply", {
      detail: palette
    }));

    if(onApply){
      onApply(palette);
    }
  }

  createSlots(selectedGrid);
  renderFixedPalette(sourcePalette);
  renderBlocks();
  updateSelectedGrid();

  resetBtn.addEventListener("click", resetPalette);
  cancelBtn.addEventListener("click", () => {
    if(onCancel){
      onCancel();
    }
  });
  applyBtn.addEventListener("click", applyPalette);

  return root;
}
