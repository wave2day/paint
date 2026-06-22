export function renderCanvas(renderer){

  const {
    ctx,
    viewport,
    image
  } = renderer;

  ctx.clearRect(
    0,
    0,
    renderer.canvas.width,
    renderer.canvas.height
  );

  if(!image){
    return;
  }

  const fitScale =
    Math.max(
      viewport.viewportWidth / viewport.imageWidth,
      viewport.viewportHeight / viewport.imageHeight
    );

  viewport.fitScale =
    fitScale;

  const scale =
    fitScale *
    viewport.scale;

  const drawWidth =
    viewport.imageWidth *
    scale;

  const drawHeight =
    viewport.imageHeight *
    scale;

  viewport.drawWidth =
    drawWidth;

  viewport.drawHeight =
    drawHeight;

  viewport.overflowX =
    Math.max(
      0,
      drawWidth - viewport.viewportWidth
    );

  viewport.overflowY =
    Math.max(
      0,
      drawHeight - viewport.viewportHeight
    );

  if(viewport.overflowX <= 0){

    viewport.offsetX =
      (viewport.viewportWidth - drawWidth) / 2;

  }else{

    viewport.offsetX =
      Math.max(
        -viewport.overflowX,
        Math.min(
          0,
          viewport.offsetX
        )
      );

  }

  if(viewport.overflowY <= 0){

    viewport.offsetY =
      (viewport.viewportHeight - drawHeight) / 2;

  }else{

    viewport.offsetY =
      Math.max(
        -viewport.overflowY,
        Math.min(
          0,
          viewport.offsetY
        )
      );

  }

  ctx.drawImage(
    image,
    Math.round(viewport.offsetX),
    Math.round(viewport.offsetY),
    Math.round(drawWidth),
    Math.round(drawHeight)
  );

}