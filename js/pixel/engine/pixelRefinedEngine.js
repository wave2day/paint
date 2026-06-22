import {
  REFINE_RECT_LIMIT
}
from
"../config/pixelConfig.js?v=pixel-modules-3";

import {
  colorToCss,
  getLuma,
  median,
  mixRgb,
  nearestPaletteColor
}
from
"./pixelColorUtils.js?v=pixel-modules-3";

import {
  makeRect
}
from
"./pixelSvgUtils.js?v=pixel-modules-3";

export function buildAdaptiveAssetFromCanvas(source, {
  baseBlock,
  minBlock,
  threshold,
  colorMode,
  paletteColors,
  paletteStrength,
  alphaCut,
  rectLimit = REFINE_RECT_LIMIT
}){
  const outW =
    source.width;

  const outH =
    source.height;

  const sctx =
    source.getContext("2d");

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

  const rects = [];
  let splitBlocks = 0;

  for(let y = 0; y < outH; y += baseBlock){
    for(let x = 0; x < outW; x += baseBlock){
      refineBlock(
        imageData.data,
        outW,
        outH,
        x,
        y,
        Math.min(baseBlock, outW - x),
        Math.min(baseBlock, outH - y),
        minBlock,
        threshold,
        colorMode,
        paletteColors,
        paletteStrength,
        alphaCut,
        rectLimit,
        rects,
        () => {
          splitBlocks++;
        }
      );
    }
  }

  let svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${outW} ${outH}" width="${outW}" height="${outH}" shape-rendering="crispEdges">
<style>
svg{shape-rendering:crispEdges;image-rendering:pixelated;}
</style>
<g>
`;

  rects.forEach(rect => {
    ctx.fillStyle =
      rect.css;

    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

    svg +=
      makeRect(
        rect.x,
        rect.y,
        rect.w,
        rect.h,
        rect.css
      );
  });

  svg += `</g>
</svg>
`;

  return {
    svg,
    canvas,
    gridW:outW,
    gridH:outH,
    rects:rects.length,
    splitBlocks
  };
}

function refineBlock(
  data,
  width,
  height,
  x,
  y,
  w,
  h,
  minBlock,
  threshold,
  colorMode,
  paletteColors,
  paletteStrength,
  alphaCut,
  rectLimit,
  rects,
  onSplit
){
  let color =
    sampleBlockColor(
      data,
      width,
      x,
      y,
      w,
      h,
      colorMode,
      alphaCut
    );

  if(!color || color.a <= alphaCut){
    return;
  }

  if(paletteColors){
    color =
      mixRgb(
        color,
        nearestPaletteColor(color, paletteColors),
        paletteStrength
      );
  }

  const error =
    getBlockError(
      data,
      width,
      x,
      y,
      w,
      h,
      color,
      alphaCut
    );

  const canSplit =
    (
      w > minBlock ||
      h > minBlock
    ) &&
    rects.length < rectLimit;

  if(error > threshold && canSplit){
    onSplit();

    const w1 =
      Math.max(1, Math.floor(w / 2));

    const h1 =
      Math.max(1, Math.floor(h / 2));

    const w2 =
      w - w1;

    const h2 =
      h - h1;

    refineBlock(data, width, height, x, y, w1, h1, minBlock, threshold, colorMode, paletteColors, paletteStrength, alphaCut, rectLimit, rects, onSplit);

    if(w2 > 0){
      refineBlock(data, width, height, x + w1, y, w2, h1, minBlock, threshold, colorMode, paletteColors, paletteStrength, alphaCut, rectLimit, rects, onSplit);
    }

    if(h2 > 0){
      refineBlock(data, width, height, x, y + h1, w1, h2, minBlock, threshold, colorMode, paletteColors, paletteStrength, alphaCut, rectLimit, rects, onSplit);
    }

    if(w2 > 0 && h2 > 0){
      refineBlock(data, width, height, x + w1, y + h1, w2, h2, minBlock, threshold, colorMode, paletteColors, paletteStrength, alphaCut, rectLimit, rects, onSplit);
    }

    return;
  }

  rects.push({
    x,
    y,
    w,
    h,
    css:colorToCss(color)
  });
}

function getBlockError(data, width, x, y, w, h, color, alphaCut){
  let error = 0;
  let count = 0;

  for(let yy = y; yy < y + h; yy++){
    for(let xx = x; xx < x + w; xx++){
      const i =
        (yy * width + xx) * 4;

      const a =
        data[i + 3];

      if(a <= alphaCut){
        continue;
      }

      const dr =
        data[i] - color.r;

      const dg =
        data[i + 1] - color.g;

      const db =
        data[i + 2] - color.b;

      error +=
        Math.sqrt(dr * dr + dg * dg + db * db);

      count++;
    }
  }

  return count
    ? error / count
    : 0;
}

export function sampleBlockColor(data, width, x, y, w, h, mode, alphaCut){
  const pixels = [];
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalA = 0;
  let totalWeight = 0;

  for(let yy = y; yy < y + h; yy++){
    for(let xx = x; xx < x + w; xx++){
      const i =
        (yy * width + xx) * 4;

      const pixel = {
        r:data[i],
        g:data[i + 1],
        b:data[i + 2],
        a:data[i + 3]
      };

      if(pixel.a <= alphaCut){
        continue;
      }

      pixels.push(pixel);

      const weight =
        mode === "luma"
          ? Math.max(1, getLuma(pixel))
          : 1;

      totalR += pixel.r * weight;
      totalG += pixel.g * weight;
      totalB += pixel.b * weight;
      totalA += pixel.a * weight;
      totalWeight += weight;
    }
  }

  if(!pixels.length || !totalWeight){
    return null;
  }

  if(mode === "median"){
    return {
      r:median(pixels.map(pixel => pixel.r)),
      g:median(pixels.map(pixel => pixel.g)),
      b:median(pixels.map(pixel => pixel.b)),
      a:median(pixels.map(pixel => pixel.a))
    };
  }

  return {
    r:Math.round(totalR / totalWeight),
    g:Math.round(totalG / totalWeight),
    b:Math.round(totalB / totalWeight),
    a:Math.round(totalA / totalWeight)
  };
}
