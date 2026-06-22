import {
  MODES,
  PALETTES
}
from
"./config/pixelConfig.js?v=pixel-modules-3";

import {
  colorToCss,
  hexToRgb,
  mixRgb,
  nearestPaletteColor
}
from
"./engine/pixelColorUtils.js?v=pixel-modules-3";

import {
  buildAdaptiveAssetFromCanvas,
  sampleBlockColor
}
from
"./engine/pixelRefinedEngine.js?v=pixel-modules-3";

import {
  makeRect
}
from
"./engine/pixelSvgUtils.js?v=pixel-modules-3";

import {
  inferImageMimeType,
  isAcceptedImage
}
from
"./io/pixelFileUtils.js?v=pixel-modules-3";

import {
  downloadCanvas,
  downloadText
}
from
"./io/pixelDownload.js?v=pixel-modules-3";

import {
  buildPixelMarkup
}
from
"./ui/pixelMarkup.js?v=pixel-modules-3";

import {
  collectRefs
}
from
"./ui/pixelRefs.js?v=pixel-modules-3";

import {
  clearMini,
  renderCanvasMini,
  renderMini,
  renderOriginalPreview,
  setDownloads,
  setInfo
}
from
"./ui/pixelView.js?v=pixel-modules-3";

let loadedImage = null;
let loadedFile = null;
let objectUrl = null;
let desktopResult = null;
let titlebarResult = null;
let refs = null;

export function initPixel(){
  const root =
    document.querySelector("[data-pixel-root]");

  if(!root){
    return;
  }

  root.innerHTML = buildPixelMarkup();

  refs =
    collectRefs(root);

  bindPixelEvents();
  bindPixelImageEvents();

  setInfo(refs, {
    Status:"Ready",
    Image:"-",
    Trim:"-",
    Rects:"-"
  });
}

function bindPixelImageEvents(){

  if(window.pixelImageEventsBound){
    return;
  }

  window.pixelImageEventsBound =
    true;

  window.addEventListener(
    "pixel:open-image",
    event => {
      loadImageSource(
        event.detail?.src,
        event.detail?.name
      );
    }
  );

}

function bindPixelEvents(){
  refs.dropzone.addEventListener(
    "click",
    () => refs.upload.click()
  );

  refs.dropzone.addEventListener(
    "dragenter",
    event => {
      event.preventDefault();
      event.stopPropagation();
      refs.dropzone.classList.add("is-over");
    }
  );

  refs.dropzone.addEventListener(
    "dragover",
    event => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "copy";
      refs.dropzone.classList.add("is-over");
    }
  );

  refs.dropzone.addEventListener(
    "dragleave",
    event => {
      event.stopPropagation();

      if(!refs.dropzone.contains(event.relatedTarget)){
        refs.dropzone.classList.remove("is-over");
      }
    }
  );

  refs.dropzone.addEventListener(
    "drop",
    event => {
      event.preventDefault();
      event.stopPropagation();
      refs.dropzone.classList.remove("is-over");
      loadFile(event.dataTransfer.files[0]);
    }
  );

  refs.root.addEventListener(
    "dragover",
    event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "none";
    }
  );

  refs.root.addEventListener(
    "drop",
    event => {
      event.preventDefault();
    }
  );

  refs.upload.addEventListener(
    "change",
    event => {
      loadFile(event.target.files[0]);
    }
  );

  refs.convert.addEventListener(
    "click",
    convertAll
  );

  refs.workflowButtons.forEach(button => {
    button.addEventListener(
      "click",
      () => {
        refs.controls.workflow.value =
          button.dataset.pixelWorkflowButton;

        desktopResult = null;
        titlebarResult = null;
        setDownloads(refs, false);
        clearMini(refs);
        updateWorkflowUI();

        if(loadedImage){
          convertAll();
        }
      }
    );
  });

  refs.ranges.forEach(range => {
    range.addEventListener(
      "input",
      () => updateRangeOutput(range)
    );

    updateRangeOutput(range);
  });

  [...Object.values(refs.controls), refs.alphaCut]
    .forEach(control => {
      control.addEventListener(
        "change",
        () => {
          updateWorkflowUI();

          if(loadedImage){
            convertAll();
          }
        }
      );
    });

  updateWorkflowUI();

  refs.downloads.forEach(button => {
    button.addEventListener(
      "click",
      () => downloadAsset(button.dataset.pixelDownload)
    );
  });

  document
    .querySelectorAll("[data-pixel-menu]")
    .forEach(item => {
      item.addEventListener(
        "click",
        () => {
          const action =
            item.dataset.pixelMenu;

          if(action === "convert"){
            convertAll();
            return;
          }

          downloadAsset(
            action.replace("download-", "")
          );
        }
      );
  });
}

function updateWorkflowUI(){
  if(!refs?.controls?.workflow){
    return;
  }

  const workflow =
    refs.controls.workflow.value;

  refs.workflowPanels.forEach(panel => {
    panel.hidden =
      panel.dataset.pixelWorkflowPanel !== workflow;
  });

  refs.root.dataset.pixelWorkflow =
    workflow;

  refs.workspace.dataset.pixelWorkflow =
    workflow;

  refs.strip.hidden =
    workflow !== "icons";

  refs.workflowButtons.forEach(button => {
    const active =
      button.dataset.pixelWorkflowButton === workflow;

    button.classList.toggle("active", active);

    button.setAttribute(
      "aria-pressed",
      active ? "true" : "false"
    );
  });

  const outputName =
    workflow === "refined"
      ? "REFINED"
      : workflow === "images"
        ? "IMAGE"
        : "DESKTOP";

  const labels = {
    "desktop-svg":workflow === "icons"
      ? "DOWNLOAD DESKTOP SVG"
      : `DOWNLOAD ${outputName} SVG`,
    "titlebar-svg":"DOWNLOAD TITLEBAR SVG",
    "desktop-png":workflow === "icons"
      ? "DOWNLOAD DESKTOP PNG"
      : `DOWNLOAD ${outputName} PNG`,
    "titlebar-png":"DOWNLOAD TITLEBAR PNG"
  };

  refs.downloads.forEach(button => {
    button.textContent =
      labels[button.dataset.pixelDownload] || button.textContent;

    if(workflow !== "icons"){
      button.hidden =
        button.dataset.pixelDownload.startsWith("titlebar");
    }else{
      button.hidden = false;
    }
  });

  if(refs.badges.svg && !desktopResult){
    refs.badges.svg.textContent =
      workflow === "icons" ? "WAITING" : workflow.toUpperCase();
  }
}

function updateRangeOutput(range){
  const output =
    refs.root.querySelector(
      `[data-pixel-range-output="${range.id}"]`
    );

  if(output){
    output.value =
      range.value;

    output.textContent =
      range.value;
  }
}

function loadFile(file){
  if(!file){
    return;
  }

  if(!isAcceptedImage(file)){
    refs.badges.original.textContent =
      "BAD TYPE";

    setInfo(refs, {
      Status:"Unsupported file",
      Image:file.name || "Unknown",
      Trim:"-",
      Types:"PNG JPG WEBP GIF BMP"
    });

    return;
  }

  loadedFile = file;
  desktopResult = null;
  titlebarResult = null;
  setDownloads(refs, false);
  clearMini(refs);
  updateWorkflowUI();

  if(objectUrl){
    URL.revokeObjectURL(objectUrl);
  }

  objectUrl =
    URL.createObjectURL(file);

  const img =
    new Image();

  img.onload = () => {
    loadedImage = img;
    renderOriginalPreview(refs, objectUrl);

    const bounds =
      getAlphaBounds(img);

    refs.badges.original.textContent =
      `${img.width} x ${img.height}`;

    refs.badges.svg.textContent =
      "READY";

    refs.stages.svg.innerHTML =
      '<div class="pixel-empty">Ready to convert</div>';

    setInfo(refs, {
      Status:"Image loaded",
      Image:`${img.width} x ${img.height}`,
      Type:file.type || "by extension",
      Size:`${Math.round(file.size / 1024)} KB`,
      Trim:bounds ? `${bounds.w} x ${bounds.h}` : "empty",
      Rects:"-"
    });
  };

  img.onerror = () => {
    loadedImage = null;
    refs.badges.original.textContent =
      "LOAD ERROR";

    setInfo(refs, {
      Status:"Load error",
      Image:file.name || "Unknown",
      Trim:"-",
      Rects:"-"
    });
  };

  img.src =
    objectUrl;
}

async function loadImageSource(
  src,
  name = "gallery-image.png"
){

  if(!src){
    return;
  }

  try{
    const response =
      await fetch(src);

    const blob =
      await response.blob();

    const file =
      new File(
        [blob],
        name || "gallery-image.png",
        {
          type:
            blob.type ||
            inferImageMimeType(name)
        }
      );

    loadFile(file);

    window.restoreWindow?.(
      "pixel"
    );
  }
  catch(_error){
    setInfo(refs, {
      Status:"Load error",
      Image:name || "Gallery image",
      Trim:"-",
      Rects:"-"
    });
  }

}

function convertAll(){
  if(!loadedImage){
    setInfo(refs, {
      Status:"No image",
      Image:"-",
      Trim:"-",
      Rects:"-"
    });

    return;
  }

  if(refs.controls.workflow.value === "images"){
    desktopResult =
      buildImageAsset();

    titlebarResult =
      null;

    refs.stages.svg.innerHTML =
      desktopResult.svg;

    refs.badges.svg.textContent =
      `${desktopResult.gridW} x ${desktopResult.gridH}`;

    renderMini(
      refs.mini.desktopSvg,
      desktopResult.svg
    );

    renderCanvasMini(
      refs.mini.desktopPng,
      desktopResult.canvas
    );

    refs.mini.titlebarSvg.innerHTML = "";
    refs.mini.titlebarPng.innerHTML = "";

    refs.miniText.desktopSvg.textContent =
      `${desktopResult.gridW} x ${desktopResult.gridH}, ${desktopResult.rects} blocks`;

    refs.miniText.desktopPng.textContent =
      `${desktopResult.canvas.width} x ${desktopResult.canvas.height}`;

    refs.miniText.titlebarSvg.textContent =
      "Hidden in Images";

    refs.miniText.titlebarPng.textContent =
      "Hidden in Images";

    setInfo(refs, {
      Status:"Done",
      Workflow:"Images",
      Image:`${loadedImage.width} x ${loadedImage.height}`,
      Output:`${desktopResult.canvas.width} x ${desktopResult.canvas.height}`,
      Block:`${desktopResult.blockSize}px`,
      Sampling:desktopResult.samplingLabel,
      Palette:desktopResult.paletteLabel,
      Rects:desktopResult.rects
    });

    setDownloads(refs, true);
    updateWorkflowUI();

    return;
  }

  if(refs.controls.workflow.value === "refined"){
    desktopResult =
      buildRefinedAsset();

    titlebarResult =
      null;

    refs.stages.svg.innerHTML =
      desktopResult.svg;

    refs.badges.svg.textContent =
      `${desktopResult.gridW} x ${desktopResult.gridH}`;

    renderMini(
      refs.mini.desktopSvg,
      desktopResult.svg
    );

    renderCanvasMini(
      refs.mini.desktopPng,
      desktopResult.canvas
    );

    refs.mini.titlebarSvg.innerHTML = "";
    refs.mini.titlebarPng.innerHTML = "";

    refs.miniText.desktopSvg.textContent =
      `${desktopResult.gridW} x ${desktopResult.gridH}, ${desktopResult.rects} blocks`;

    refs.miniText.desktopPng.textContent =
      `${desktopResult.canvas.width} x ${desktopResult.canvas.height}`;

    refs.miniText.titlebarSvg.textContent =
      "Hidden in Refined";

    refs.miniText.titlebarPng.textContent =
      "Hidden in Refined";

    setInfo(refs, {
      Status:"Done",
      Workflow:"Refined",
      Image:`${loadedImage.width} x ${loadedImage.height}`,
      Output:`${desktopResult.canvas.width} x ${desktopResult.canvas.height}`,
      Blocks:`${desktopResult.rects}`,
      Split:`${desktopResult.splitBlocks}`,
      Threshold:desktopResult.threshold,
      Palette:desktopResult.paletteLabel
    });

    setDownloads(refs, true);
    updateWorkflowUI();

    return;
  }

  desktopResult =
    buildPixelAsset(
      parseInt(refs.controls.desktopSize.value, 10),
      "desktop"
    );

  titlebarResult =
    buildPixelAsset(
      parseInt(refs.controls.titlebarSize.value, 10),
      "titlebar"
    );

  refs.stages.svg.innerHTML =
    desktopResult.svg;

  refs.badges.svg.textContent =
    `${desktopResult.gridW} x ${desktopResult.gridH}`;

  renderMini(
    refs.mini.desktopSvg,
    desktopResult.svg
  );

  renderMini(
    refs.mini.titlebarSvg,
    titlebarResult.svg
  );

  renderCanvasMini(
    refs.mini.desktopPng,
    desktopResult.canvas
  );

  renderCanvasMini(
    refs.mini.titlebarPng,
    titlebarResult.canvas
  );

  refs.miniText.desktopSvg.textContent =
    `${desktopResult.gridW} x ${desktopResult.gridH}, ${desktopResult.rects} rects`;

  refs.miniText.titlebarSvg.textContent =
    `${titlebarResult.gridW} x ${titlebarResult.gridH}, ${titlebarResult.rects} rects`;

  refs.miniText.desktopPng.textContent =
    `${desktopResult.size} x ${desktopResult.size}`;

  refs.miniText.titlebarPng.textContent =
    `${titlebarResult.size} x ${titlebarResult.size}`;

  const bounds =
    getAlphaBounds(loadedImage);

  setInfo(refs, {
    Status:"Done",
    Mode:desktopResult.modeLabel,
    Image:`${loadedImage.width} x ${loadedImage.height}`,
    Trim:bounds ? `${bounds.w} x ${bounds.h}` : "empty",
    Desktop:`${desktopResult.gridW} x ${desktopResult.gridH}`,
    Titlebar:`${titlebarResult.gridW} x ${titlebarResult.gridH}`,
    Rects:`${desktopResult.rects} / ${titlebarResult.rects}`
  });

  setDownloads(refs, true);
}

function buildPixelAsset(size, kind){
  const mode =
    MODES[refs.controls.pixelMode.value];

  const rasterizer =
    refs.controls.iconRasterizer?.value || "current";

  const source =
    refs.controls.autoTrim.checked
      ? getAlphaBounds(loadedImage)
      : {
        x:0,
        y:0,
        w:loadedImage.width,
        h:loadedImage.height
      };

  const canvas =
    renderRasterCanvas(size, source, kind, rasterizer);

  const gridFactor =
    kind === "titlebar"
      ? Math.max(mode.gridFactor, .94)
      : mode.gridFactor;

  const gridW =
    Math.max(1, Math.round(size * gridFactor));

  const gridH =
    Math.max(1, Math.round(size * gridFactor));

  const grid =
    document.createElement("canvas");

  const gctx =
    grid.getContext("2d");

  grid.width = gridW;
  grid.height = gridH;

  gctx.clearRect(0, 0, gridW, gridH);
  gctx.imageSmoothingEnabled =
    rasterizer === "smoothIcon" ||
    rasterizer === "coverage";

  if(gctx.imageSmoothingEnabled){
    gctx.imageSmoothingQuality = "high";
  }

  gctx.drawImage(canvas, 0, 0, gridW, gridH);

  const imgData =
    gctx.getImageData(0, 0, gridW, gridH);

  if(rasterizer === "hinted"){
    hintIconImageData(imgData, gridW, gridH);
  }

  const data =
    imgData.data;

  let svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridW} ${gridH}" width="${gridW}" height="${gridH}" shape-rendering="crispEdges">
<style>
svg{shape-rendering:crispEdges;image-rendering:pixelated;}
</style>
<g>
`;

  let rects = 0;

  for(let y = 0; y < gridH; y++){
    if(refs.controls.mergeRuns.checked){
      let runColor = null;
      let runStart = 0;

      for(let x = 0; x <= gridW; x++){
        const color =
          x < gridW
            ? getPixelColor(data, gridW, x, y, mode)
            : null;

        if(color !== runColor){
          if(runColor){
            svg += makeRect(runStart, y, x - runStart, 1, runColor);
            rects++;
          }

          runColor = color;
          runStart = x;
        }
      }
    }else{
      for(let x = 0; x < gridW; x++){
        const color =
          getPixelColor(data, gridW, x, y, mode);

        if(color){
          svg += makeRect(x, y, 1, 1, color);
          rects++;
        }
      }
    }
  }

  svg += `</g>
</svg>
`;

  return {
    svg,
    canvas,
    gridW,
    gridH,
    rects,
    size,
    modeLabel:`${mode.label} / ${getIconRasterizerLabel(rasterizer)}`
  };
}

function buildImageAsset(){
  const maxWidth =
    parseInt(refs.controls.imageOutputWidth.value, 10);

  const blockSize =
    parseInt(refs.controls.imageBlockSize.value, 10);

  const ratio =
    maxWidth / loadedImage.width;

  const outW =
    Math.max(blockSize, Math.round(loadedImage.width * ratio));

  const outH =
    Math.max(blockSize, Math.round(loadedImage.height * ratio));

  const source =
    document.createElement("canvas");

  const sctx =
    source.getContext("2d");

  source.width = outW;
  source.height = outH;
  sctx.clearRect(0, 0, outW, outH);

  const hardSampling =
    refs.controls.imageSampling.value === "hard";

  sctx.imageSmoothingEnabled =
    !hardSampling;

  if(!hardSampling){
    sctx.imageSmoothingQuality = "high";
  }

  sctx.drawImage(loadedImage, 0, 0, outW, outH);

  const imageData =
    sctx.getImageData(0, 0, outW, outH);

  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");

  canvas.width = outW;
  canvas.height = outH;
  ctx.clearRect(0, 0, outW, outH);
  ctx.imageSmoothingEnabled = false;

  const palette =
    PALETTES[refs.controls.imagePalette.value] || PALETTES.original;

  const paletteColors =
    palette.colors?.map(hexToRgb) || null;

  const strength =
    Math.max(
      0,
      Math.min(
        1,
        parseInt(refs.controls.paletteStrength.value, 10) / 100
      )
    );

  let svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${outW} ${outH}" width="${outW}" height="${outH}" shape-rendering="crispEdges">
<style>
svg{shape-rendering:crispEdges;image-rendering:pixelated;}
</style>
<g>
`;

  let rects = 0;

  for(let y = 0; y < outH; y += blockSize){
    const h =
      Math.min(blockSize, outH - y);

    for(let x = 0; x < outW; x += blockSize){
      const w =
        Math.min(blockSize, outW - x);

      let color =
        sampleBlockColor(
          imageData.data,
          outW,
          x,
          y,
          w,
          h,
          refs.controls.imageColorMode.value,
          getAlphaCut()
        );

      if(!color || color.a <= getAlphaCut()){
        continue;
      }

      if(paletteColors){
        color =
          mixRgb(
            color,
            nearestPaletteColor(color, paletteColors),
            strength
          );
      }

      const css =
        colorToCss(color);

      ctx.fillStyle =
        css;

      ctx.fillRect(x, y, w, h);

      svg +=
        makeRect(x, y, w, h, css);

      rects++;
    }
  }

  svg += `</g>
</svg>
`;

  return {
    svg,
    canvas,
    gridW:outW,
    gridH:outH,
    rects,
    blockSize,
    paletteLabel:palette.label,
    samplingLabel:hardSampling ? "Hard Shape" : "Smooth Photo",
    modeLabel:"IMAGE BLOCKS"
  };
}

function buildRefinedAsset(){
  const maxWidth =
    parseInt(refs.controls.refinedOutputWidth.value, 10);

  const baseBlock =
    parseInt(refs.controls.refinedBaseBlock.value, 10);

  const minBlock =
    parseInt(refs.controls.refinedMinBlock.value, 10);

  const threshold =
    parseInt(refs.controls.refineThreshold.value, 10);

  const source =
    buildScaledSourceCanvas(
      maxWidth,
      refs.controls.refinedSampling.value === "hard"
    );

  const palette =
    PALETTES[refs.controls.refinedPalette.value] || PALETTES.original;

  const paletteColors =
    palette.colors?.map(hexToRgb) || null;

  const strength =
    Math.max(
      0,
      Math.min(
        1,
        parseInt(refs.controls.refinedPaletteStrength.value, 10) / 100
      )
    );

  const result =
    buildAdaptiveAssetFromCanvas(
      source,
      {
        baseBlock,
        minBlock,
        threshold,
        colorMode:refs.controls.refinedColorMode.value,
        paletteColors,
        paletteStrength:strength,
        alphaCut:getAlphaCut()
      }
    );

  return {
    ...result,
    threshold,
    paletteLabel:palette.label,
    modeLabel:"REFINED"
  };
}

function renderRasterCanvas(size, source, kind, rasterizer = "current"){
  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled =
    rasterizer === "smoothIcon";

  if(ctx.imageSmoothingEnabled){
    ctx.imageSmoothingQuality = "high";
  }

  if(!source){
    return canvas;
  }

  const pad =
    kind === "titlebar" ? 1 : 2;

  const usable =
    Math.max(1, size - pad * 2);

  const ratio =
    Math.min(usable / source.w, usable / source.h);

  const drawW =
    Math.max(1, Math.round(source.w * ratio));

  const drawH =
    Math.max(1, Math.round(source.h * ratio));

  const offsetX =
    refs.controls.centerInViewBox.checked
      ? Math.floor((size - drawW) / 2)
      : pad;

  const offsetY =
    refs.controls.centerInViewBox.checked
      ? Math.floor((size - drawH) / 2)
      : pad;

  if(rasterizer === "coverage"){
    drawCoverageRaster(
      ctx,
      source,
      offsetX,
      offsetY,
      drawW,
      drawH
    );
  }else{
    ctx.drawImage(
      loadedImage,
      source.x,
      source.y,
      source.w,
      source.h,
      offsetX,
      offsetY,
      drawW,
      drawH
    );
  }

  return canvas;
}

function getAlphaBounds(img){
  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);

  const data =
    ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const cut =
    getAlphaCut();

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;

  for(let y = 0; y < canvas.height; y++){
    for(let x = 0; x < canvas.width; x++){
      const a =
        data[(y * canvas.width + x) * 4 + 3];

      if(a > cut){
        if(x < minX) minX = x;
        if(y < minY) minY = y;
        if(x > maxX) maxX = x;
        if(y > maxY) maxY = y;
      }
    }
  }

  if(maxX < minX || maxY < minY){
    return null;
  }

  return {
    x:minX,
    y:minY,
    w:maxX - minX + 1,
    h:maxY - minY + 1
  };
}

function getPixelColor(data, width, x, y, mode){
  const i =
    (y * width + x) * 4;

  let r = data[i];
  let g = data[i + 1];
  let b = data[i + 2];
  let a = data[i + 3];

  if(a <= getAlphaCut()){
    return null;
  }

  if(mode.sharpenAlpha){
    a = Math.min(255, a + mode.alphaAdd);
  }

  if(mode.snapAlpha){
    a = a > 128 ? 255 : 0;
  }

  if(a <= getAlphaCut()){
    return null;
  }

  return a >= 255
    ? `rgb(${r},${g},${b})`
    : `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
}

function drawCoverageRaster(ctx, source, offsetX, offsetY, drawW, drawH){
  const scale =
    4;

  const hi =
    document.createElement("canvas");

  const hctx =
    hi.getContext("2d");

  hi.width =
    Math.max(1, drawW * scale);

  hi.height =
    Math.max(1, drawH * scale);

  hctx.clearRect(0, 0, hi.width, hi.height);
  hctx.imageSmoothingEnabled = true;
  hctx.imageSmoothingQuality = "high";

  hctx.drawImage(
    loadedImage,
    source.x,
    source.y,
    source.w,
    source.h,
    0,
    0,
    hi.width,
    hi.height
  );

  const hiData =
    hctx.getImageData(0, 0, hi.width, hi.height).data;

  const out =
    ctx.createImageData(drawW, drawH);

  const outData =
    out.data;

  for(let y = 0; y < drawH; y++){
    for(let x = 0; x < drawW; x++){
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let weight = 0;

      for(let yy = 0; yy < scale; yy++){
        for(let xx = 0; xx < scale; xx++){
          const i =
            (((y * scale + yy) * hi.width) + (x * scale + xx)) * 4;

          const alpha =
            hiData[i + 3] / 255;

          r += hiData[i] * alpha;
          g += hiData[i + 1] * alpha;
          b += hiData[i + 2] * alpha;
          a += hiData[i + 3];
          weight += alpha;
        }
      }

      const o =
        (y * drawW + x) * 4;

      if(weight > 0){
        outData[o] =
          Math.round(r / weight);

        outData[o + 1] =
          Math.round(g / weight);

        outData[o + 2] =
          Math.round(b / weight);
      }

      outData[o + 3] =
        Math.round(a / (scale * scale));
    }
  }

  ctx.putImageData(out, offsetX, offsetY);
}

function hintIconImageData(imgData, width, height){
  const input =
    new Uint8ClampedArray(imgData.data);

  const output =
    imgData.data;

  const cut =
    getAlphaCut();

  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const i =
        (y * width + x) * 4;

      const solid =
        input[i + 3] > cut;

      let solidNeighbors = 0;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for(let yy = -1; yy <= 1; yy++){
        for(let xx = -1; xx <= 1; xx++){
          if(xx === 0 && yy === 0){
            continue;
          }

          const nx =
            x + xx;

          const ny =
            y + yy;

          if(nx < 0 || ny < 0 || nx >= width || ny >= height){
            continue;
          }

          const ni =
            (ny * width + nx) * 4;

          if(input[ni + 3] > cut){
            solidNeighbors++;
            r += input[ni];
            g += input[ni + 1];
            b += input[ni + 2];
            count++;
          }
        }
      }

      if(solid && solidNeighbors <= 1){
        output[i + 3] = 0;
      }

      if(!solid && solidNeighbors >= 6 && count){
        output[i] = Math.round(r / count);
        output[i + 1] = Math.round(g / count);
        output[i + 2] = Math.round(b / count);
        output[i + 3] = 255;
      }
    }
  }
}

function getIconRasterizerLabel(value){
  const labels = {
    current:"Current",
    hardShape:"Hard Shape",
    smoothIcon:"Smooth Icon",
    coverage:"Coverage",
    hinted:"Hinted"
  };

  return labels[value] || "Current";
}

function buildScaledSourceCanvas(maxWidth, hardSampling){
  const ratio =
    maxWidth / loadedImage.width;

  const outW =
    Math.max(1, Math.round(loadedImage.width * ratio));

  const outH =
    Math.max(1, Math.round(loadedImage.height * ratio));

  const source =
    document.createElement("canvas");

  const ctx =
    source.getContext("2d");

  source.width = outW;
  source.height = outH;
  ctx.clearRect(0, 0, outW, outH);
  ctx.imageSmoothingEnabled =
    !hardSampling;

  if(!hardSampling){
    ctx.imageSmoothingQuality = "high";
  }

  ctx.drawImage(loadedImage, 0, 0, outW, outH);

  return source;
}

function getAlphaCut(){
  const value =
    parseInt(refs.alphaCut.value, 10);

  if(Number.isNaN(value)){
    return 0;
  }

  return Math.max(0, Math.min(255, value));
}

function downloadAsset(kind){
  if(!desktopResult){
    return;
  }

  if(kind === "desktop-svg"){
    downloadText(
      desktopResult.svg,
      fileStem("desktop") + ".svg",
      "image/svg+xml"
    );
  }

  if(kind === "titlebar-svg"){
    if(!titlebarResult){
      return;
    }

    downloadText(
      titlebarResult.svg,
      fileStem("titlebar") + ".svg",
      "image/svg+xml"
    );
  }

  if(kind === "desktop-png"){
    downloadCanvas(
      desktopResult.canvas,
      fileStem("desktop") + ".png"
    );
  }

  if(kind === "titlebar-png"){
    if(!titlebarResult){
      return;
    }

    downloadCanvas(
      titlebarResult.canvas,
      fileStem("titlebar") + ".png"
    );
  }
}

function fileStem(kind){
  const raw =
    loadedFile?.name || "pixel-icon";

  const clean =
    raw
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();

  const size =
    refs.controls.workflow.value === "images"
      ? refs.controls.imageOutputWidth.value
      : kind === "desktop"
      ? refs.controls.desktopSize.value
      : refs.controls.titlebarSize.value;

  const label =
    refs.controls.workflow.value === "images"
      ? "image"
      : kind;

  return `${clean || "pixel-icon"}-${label}-${size}`;
}
