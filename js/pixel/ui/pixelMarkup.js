import {
  PALETTES
}
from
"../config/pixelConfig.js?v=pixel-modules-3";

export function buildPixelMarkup(){
  return `
    <aside class="pixel-side">
      <section class="pixel-panel">
        <div class="pixel-label">SOURCE IMAGE</div>
        <div class="pixel-dropzone" data-pixel-dropzone>
          <div>
            DROP IMAGE HERE<br>
            OR CLICK
            <small>PNG, JPG, WEBP, GIF, BMP</small>
          </div>
        </div>
        <input
          class="pixel-hidden"
          type="file"
          data-pixel-upload
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
        >
      </section>

      <section class="pixel-panel pixel-convert-panel">
        <button class="pixel-button primary pixel-convert-button" data-pixel-convert>CONVERT</button>
      </section>

      <section class="pixel-panel">
        <div class="pixel-label">WORKFLOW</div>
        <div class="pixel-workflow-switch" role="group" aria-label="Pixel workflow">
          <button class="pixel-workflow-button active" type="button" data-pixel-workflow-button="icons">
            <strong>Icons</strong>
            <span>desktop + titlebar SVG/PNG</span>
          </button>
          <button class="pixel-workflow-button" type="button" data-pixel-workflow-button="images">
            <strong>Images</strong>
            <span>block image + palette PNG/SVG</span>
          </button>
          <button class="pixel-workflow-button" type="button" data-pixel-workflow-button="refined">
            <strong>Refined</strong>
            <span>compare + split edge blocks</span>
          </button>
        </div>
        <select class="pixel-hidden" data-pixel-control="workflow" aria-hidden="true">
          <option value="icons" selected>Icons</option>
          <option value="images">Images</option>
          <option value="refined">Refined</option>
        </select>
      </section>

      <section class="pixel-panel" data-pixel-workflow-panel="icons">
        <div class="pixel-label">SIZES</div>
        ${selectRow("Desktop","desktopSize",[
          ["48","48 x 48"],
          ["64","64 x 64"],
          ["96","96 x 96"],
          ["128","128 x 128",true],
          ["256","256 x 256"]
        ])}
        ${selectRow("Titlebar","titlebarSize",[
          ["16","16 x 16",true],
          ["20","20 x 20"],
          ["24","24 x 24"],
          ["32","32 x 32"]
        ])}
      </section>

      <section class="pixel-panel" data-pixel-workflow-panel="icons">
        <div class="pixel-label">PIXEL ENGINE</div>
        ${selectRow("Mode","pixelMode",[
          ["ultraClean","Ultra Clean",true],
          ["microHarden","Micro Harden"],
          ["edgeSnap","Edge Snap"],
          ["softPixel","Soft Pixel"],
          ["pixel","Pixel"]
        ])}
        ${selectRow("Rasterizer","iconRasterizer",[
          ["current","Current",true],
          ["hardShape","Hard Shape"],
          ["smoothIcon","Smooth Icon"],
          ["coverage","Coverage"],
          ["hinted","Hinted"]
        ])}
        ${checkRow("autoTrim","Auto trim transparent edges",true)}
        ${checkRow("centerInViewBox","Center icon in final canvas",true)}
        ${checkRow("mergeRuns","Merge same-color pixels",true)}
        ${rangeRow("AlphaCut","pixelAlphaCut","data-pixel-alpha-cut","0","255","8")}
        <div class="pixel-note">
          AlphaCut zahazuje pixely s alfou menší nebo rovnou zadané hodnotě.
        </div>
      </section>

      <section class="pixel-panel" data-pixel-workflow-panel="images">
        <div class="pixel-label">IMAGE ENGINE</div>
        ${selectRow("Output","imageOutputWidth",[
          ["320","320 px"],
          ["480","480 px",true],
          ["640","640 px"],
          ["960","960 px"]
        ])}
        ${selectRow("Block","imageBlockSize",[
          ["2","2 px"],
          ["4","4 px"],
          ["6","6 px"],
          ["8","8 px",true],
          ["12","12 px"],
          ["16","16 px"],
          ["24","24 px"]
        ])}
        ${selectRow("Sampling","imageSampling",[
          ["smooth","Smooth Photo",true],
          ["hard","Hard Shape"]
        ])}
        ${selectRow("Color","imageColorMode",[
          ["average","Average",true],
          ["median","Median"],
          ["luma","Luma Weight"]
        ])}
        ${selectRow("Palette","imagePalette",Object.entries(PALETTES).map(([value, palette]) => [
          value,
          palette.label,
          value === "original"
        ]))}
        ${rangeRow("Palette mix","pixel-paletteStrength",'data-pixel-control="paletteStrength"',"0","100","100")}
        <div class="pixel-note">
          Images režim rozkostičkuje celý obrázek. Barva bloku se přepočítá z okolních pixelů a volitelně se přitáhne k nejbližší barvě palety.
        </div>
      </section>

      <section class="pixel-panel" data-pixel-workflow-panel="refined">
        <div class="pixel-label">REFINED ENGINE</div>
        ${selectRow("Output","refinedOutputWidth",[
          ["320","320 px"],
          ["480","480 px",true],
          ["640","640 px"],
          ["960","960 px"]
        ])}
        ${selectRow("Base block","refinedBaseBlock",[
          ["8","8 px"],
          ["12","12 px",true],
          ["16","16 px"],
          ["24","24 px"],
          ["32","32 px"]
        ])}
        ${selectRow("Min block","refinedMinBlock",[
          ["1","1 px"],
          ["2","2 px"],
          ["4","4 px",true],
          ["6","6 px"],
          ["8","8 px"]
        ])}
        ${selectRow("Sampling","refinedSampling",[
          ["hard","Hard Shape",true],
          ["smooth","Smooth Photo"]
        ])}
        ${selectRow("Color","refinedColorMode",[
          ["median","Median",true],
          ["average","Average"],
          ["luma","Luma Weight"]
        ])}
        ${selectRow("Palette","refinedPalette",Object.entries(PALETTES).map(([value, palette]) => [
          value,
          palette.label,
          value === "original"
        ]))}
        ${rangeRow("Refine threshold","pixel-refineThreshold",'data-pixel-control="refineThreshold"',"0","180","42")}
        ${rangeRow("Palette mix","pixel-refinedPaletteStrength",'data-pixel-control="refinedPaletteStrength"',"0","100","100")}
        <div class="pixel-note">
          Refined nejdřív udělá velké bloky. Bloky, které se moc liší od originálu, rozdělí na menší, hlavně kolem hran a detailů.
        </div>
      </section>

      <section class="pixel-panel pixel-action-panel">
        <div class="pixel-label">ACTION</div>
        <div class="pixel-button-grid">
          <button class="pixel-button" data-pixel-download="desktop-svg" disabled>DOWNLOAD DESKTOP SVG</button>
          <button class="pixel-button" data-pixel-download="titlebar-svg" disabled>DOWNLOAD TITLEBAR SVG</button>
          <button class="pixel-button" data-pixel-download="desktop-png" disabled>DOWNLOAD DESKTOP PNG</button>
          <button class="pixel-button" data-pixel-download="titlebar-png" disabled>DOWNLOAD TITLEBAR PNG</button>
        </div>
      </section>

      <section class="pixel-panel">
        <div class="pixel-label">INFO</div>
        <div class="pixel-info" data-pixel-info></div>
      </section>
    </aside>

    <section class="pixel-workspace" data-pixel-workspace>
      ${preview("ORIGINAL","NO FILE","original")}
      ${preview("PIXEL SVG","WAITING","svg")}

      <div class="pixel-strip" data-pixel-strip>
        ${mini("desktopSvg","DESKTOP SVG")}
        ${mini("titlebarSvg","TITLEBAR SVG")}
        ${mini("desktopPng","DESKTOP PNG")}
        ${mini("titlebarPng","TITLEBAR PNG")}
      </div>
    </section>
  `;
}

function selectRow(label, id, options){
  const optionHtml =
    options
      .map(([value, text, selected]) => (
        `<option value="${value}"${selected ? " selected" : ""}>${text}</option>`
      ))
      .join("");

  return `
    <div class="pixel-row">
      <label for="pixel-${id}">${label}</label>
      <select id="pixel-${id}" data-pixel-control="${id}">
        ${optionHtml}
      </select>
    </div>
  `;
}

function checkRow(id, label, checked){
  return `
    <div class="pixel-row pixel-check">
      <input id="pixel-${id}" data-pixel-control="${id}" type="checkbox"${checked ? " checked" : ""}>
      <label for="pixel-${id}">${label}</label>
    </div>
  `;
}

function rangeRow(label, id, attributes, min, max, value){
  return `
    <div class="pixel-range-row">
      <label for="${id}">${label}</label>
      <div class="pixel-range-control">
        <input
          id="${id}"
          ${attributes}
          type="range"
          min="${min}"
          max="${max}"
          value="${value}"
          data-pixel-range
        >
        <output for="${id}" data-pixel-range-output="${id}">${value}</output>
      </div>
    </div>
  `;
}

function preview(title, badge, id){
  return `
    <div class="pixel-preview" data-pixel-preview="${id}">
      <div class="pixel-preview-head">
        <span>${title}</span>
        <span data-pixel-badge="${id}">${badge}</span>
      </div>
      <div class="pixel-preview-body">
        <div class="pixel-stage" data-pixel-stage="${id}">
          <div class="pixel-empty">${id === "original" ? "Drop an image into the left panel" : "Converted icon preview"}</div>
        </div>
      </div>
    </div>
  `;
}

function mini(id, title){
  return `
    <div class="pixel-mini">
      <div class="pixel-mini-swatch" data-pixel-mini="${id}"></div>
      <div class="pixel-mini-text">
        ${title}<br>
        <span data-pixel-mini-text="${id}">-</span>
      </div>
    </div>
  `;
}
