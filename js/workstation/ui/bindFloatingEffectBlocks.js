const FLOATING_LAYER_CLASS =
  "canvas-panel-layer";

const BLOCK_SELECTOR =
  "[data-effect-block]";

const HANDLE_CLASS =
  "effect-block-drag-handle";

const INTERACTIVE_SELECTOR = [
  "button",
  "input",
  "select",
  "textarea",
  "option",
  "label",
  ".value-knob",
  ".value-fader",
  ".slide-switcher",
  ".vertical-switcher",
  ".transport-button"
].join(",");



export function bindFloatingEffectBlocks(
  workstation,
  toolOptions,
  activeEffect = workstation?.effects?.mode
){

  if(
    !workstation ||
    !toolOptions ||
    !workstation.canvasArea
  ){
    return;
  }

  const layer =
    ensureFloatingLayer(
      workstation
    );

  syncFloatingVisibility(
    layer,
    activeEffect
  );

  removeDockedCopiesForFloatingBlocks(
    toolOptions,
    layer,
    activeEffect
  );

  [
    ...toolOptions.querySelectorAll(BLOCK_SELECTOR),
    ...layer.querySelectorAll(BLOCK_SELECTOR)
  ].forEach(block => {
    prepareBlock(
      workstation,
      toolOptions,
      layer,
      block,
      activeEffect
    );
  });

  syncFloatingVisibility(
    layer,
    activeEffect
  );

}



function ensureFloatingLayer(workstation){

  let layer =
    workstation.canvasArea
      .querySelector(
        `.${FLOATING_LAYER_CLASS}`
      );

  if(layer){
    return layer;
  }

  layer =
    document.createElement("div");

  layer.className =
    FLOATING_LAYER_CLASS;

  workstation.canvasArea
    .appendChild(layer);

  return layer;

}



function prepareBlock(
  workstation,
  toolOptions,
  layer,
  block,
  activeEffect
){

  if(!block.dataset.floatingEffect){
    block.dataset.floatingEffect =
      block.closest(`.${FLOATING_LAYER_CLASS}`)
        ? effectFromBlock(block)
        : activeEffect;
  }

  if(block.dataset.floatingBound === "true"){
    return;
  }

  block.dataset.floatingBound =
    "true";

  if(
    !block._effectBlockDockContainer &&
    !block.closest(`.${FLOATING_LAYER_CLASS}`)
  ){
    block._effectBlockDockContainer =
      block.parentElement;
  }

  block.classList.add(
    "effect-block-movable"
  );

  ensureDragHandle(
    block
  );

  block.addEventListener(
    "pointerdown",
    event => {
      if(
        event.button !== 0 ||
        event.target.closest(INTERACTIVE_SELECTOR) ||
        !event.target.closest(`.${HANDLE_CLASS}`)
      ){
        return;
      }

      startBlockDrag({
        event,
        workstation,
        toolOptions,
        layer,
        block,
        activeEffect
      });
    }
  );

}



function ensureDragHandle(block){

  if(block.querySelector(`:scope > .${HANDLE_CLASS}`)){
    return;
  }

  const handle =
    document.createElement("div");

  handle.className =
    HANDLE_CLASS;

  handle.setAttribute(
    "aria-hidden",
    "true"
  );

  block.prepend(handle);

}



function startBlockDrag({
  event,
  workstation,
  toolOptions,
  layer,
  block,
  activeEffect
}){

  event.preventDefault();
  event.stopPropagation();

  const sourceParent =
    block.parentElement;

  const sourceNext =
    block.nextSibling;

  const dockContainer =
    block._effectBlockDockContainer ||
    sourceParent;

  const sourceStyle =
    getBlockStyle(block);

  const sourceRect =
    block.getBoundingClientRect();

  if(block.classList.contains("effect-block-floating")){
    bringFloatingBlockForward(
      block
    );
  }

  const startX =
    event.clientX;

  const startY =
    event.clientY;

  const grabX =
    event.clientX - sourceRect.left;

  const grabY =
    event.clientY - sourceRect.top;

  const placeholder =
    document.createElement("div");

  placeholder.className =
    "effect-block-placeholder";

  placeholder.style.height =
    `${sourceRect.height}px`;

  if(sourceParent === dockContainer){
    dockContainer.insertBefore(
      placeholder,
      block
    );
  }

  document.body.appendChild(block);

  block.classList.add(
    "effect-block-dragging"
  );

  Object.assign(
    block.style,
    {
      position:"fixed",
      left:`${sourceRect.left}px`,
      top:`${sourceRect.top}px`,
      width:`${sourceRect.width}px`,
      zIndex:"9999"
    }
  );

  function move(moveEvent){
    moveEvent.preventDefault();
    moveEvent.stopPropagation();

    block.style.left =
      `${sourceRect.left + moveEvent.clientX - startX}px`;

    block.style.top =
      `${sourceRect.top + moveEvent.clientY - startY}px`;

    const overCanvas =
      isPointInside(
        moveEvent,
        workstation.canvasArea
      );

    const overToolbar =
      isPointInside(
        moveEvent,
        toolOptions
      );

    workstation.canvasArea
      .classList
      .toggle(
        "is-drop-target",
        overCanvas
      );

    toolOptions
      .classList
      .toggle(
        "is-dock-target",
        overToolbar
      );

    if(overToolbar){
      movePlaceholder(
        dockContainer,
        placeholder,
        moveEvent.clientY
      );
    }
  }

  function up(upEvent){
    upEvent.preventDefault();
    upEvent.stopPropagation();

    window.removeEventListener(
      "pointermove",
      move
    );

    window.removeEventListener(
      "pointerup",
      up
    );

    workstation.canvasArea
      .classList
      .remove("is-drop-target");

    toolOptions
      .classList
      .remove("is-dock-target");

    block.classList.remove(
      "effect-block-dragging"
    );

    if(isPointInside(upEvent, toolOptions)){
      dropIntoToolbar(
        block,
        dockContainer,
        placeholder
      );
    } else if(isPointInside(upEvent, workstation.canvasArea)){
      dropIntoCanvas(
        block,
        workstation,
        toolOptions,
        layer,
        upEvent,
        grabX,
        grabY,
        activeEffect
      );
    } else {
      returnToSource(
        block,
        sourceParent,
        sourceNext,
        sourceStyle
      );
    }

    placeholder.remove();
  }

  window.addEventListener(
    "pointermove",
    move,
    {
      passive:false
    }
  );

  window.addEventListener(
    "pointerup",
    up,
    {
      once:true
    }
  );

}



function dropIntoToolbar(
  block,
  dockContainer,
  placeholder
){

  resetBlockStyle(block);

  block.classList.remove(
    "effect-block-floating"
  );

  delete block.dataset.floatingEffect;

  if(placeholder?.parentElement === dockContainer){
    dockContainer.insertBefore(
      block,
      placeholder
    );
    return;
  }

  dockContainer.appendChild(block);

}



function dropIntoCanvas(
  block,
  workstation,
  toolOptions,
  layer,
  event,
  grabX,
  grabY,
  activeEffect
){

  const effect =
    block.dataset.floatingEffect ||
    activeEffect ||
    effectFromBlock(block);

  const existing =
    findFloatingBlock(
      layer,
      effect,
      block.dataset.effectBlock,
      block
    );

  if(existing){
    bringFloatingBlockForward(
      existing
    );

    dropIntoToolbar(
      block,
      block._effectBlockDockContainer || toolOptions,
      null
    );

    return;
  }

  const areaRect =
    workstation.canvasArea
      .getBoundingClientRect();

  const width =
    block.getBoundingClientRect().width;

  const height =
    block.getBoundingClientRect().height;

  resetBlockStyle(block);

  block.classList.add(
    "effect-block-floating"
  );

  block.dataset.floatingEffect =
    effect;

  layer.appendChild(block);

  bringFloatingBlockForward(
    block
  );

  block.style.width =
    `${width}px`;

  const position =
    findOpenCanvasPosition({
      layer,
      block,
      activeEffect,
      x: event.clientX - areaRect.left - grabX,
      y: event.clientY - areaRect.top - grabY,
      width,
      height,
      areaWidth: areaRect.width,
      areaHeight: areaRect.height
    });

  block.style.left =
    `${position.x}px`;

  block.style.top =
    `${position.y}px`;

  syncFloatingVisibility(
    layer,
    activeEffect
  );

}



function findOpenCanvasPosition({
  layer,
  block,
  activeEffect,
  x,
  y,
  width,
  height,
  areaWidth,
  areaHeight
}){

  const margin =
    8;

  const gap =
    6;

  const snapDistance =
    28;

  const maxX =
    Math.max(margin, areaWidth - width - 18);

  const maxY =
    Math.max(margin, areaHeight - height - 18);

  const start =
    {
      x:clamp(x, margin, maxX),
      y:clamp(y, margin, maxY)
    };

  const others =
    floatingBlocksForEffect(
      layer,
      activeEffect,
      block
    );

  const snapped =
    findAdjacentSnapPosition({
      start,
      width,
      height,
      margin,
      maxX,
      maxY,
      gap,
      snapDistance,
      others
    });

  if(snapped){
    return snapped;
  }

  if(
    !overlapsAny(
      { ...start, width, height },
      others
    )
  ){
    return start;
  }

  const stepX =
    Math.max(18, Math.round(width * .25));

  const stepY =
    Math.max(18, Math.round(height * .25));

  for(let row = 0; row < 10; row++){
    for(let col = 0; col < 10; col++){
      const candidate =
        {
          x:clamp(start.x + col * stepX, margin, maxX),
          y:clamp(start.y + row * stepY, margin, maxY),
          width,
          height
        };

      if(!overlapsAny(candidate, others)){
        return {
          x:candidate.x,
          y:candidate.y
        };
      }
    }
  }

  return start;

}



function findAdjacentSnapPosition({
  start,
  width,
  height,
  margin,
  maxX,
  maxY,
  gap,
  snapDistance,
  others
}){

  const startRect =
    {
      ...start,
      width,
      height
    };

  const candidates =
    [];

  others.forEach(other => {
    const verticalOverlap =
      start.y < other.y + other.height &&
      start.y + height > other.y;

    const horizontalOverlap =
      start.x < other.x + other.width &&
      start.x + width > other.x;

    const nearRight =
      Math.abs(
        start.x - (other.x + other.width + gap)
      ) <= snapDistance;

    const nearLeft =
      Math.abs(
        start.x + width + gap - other.x
      ) <= snapDistance;

    const nearBottom =
      Math.abs(
        start.y - (other.y + other.height + gap)
      ) <= snapDistance;

    const nearTop =
      Math.abs(
        start.y + height + gap - other.y
      ) <= snapDistance;

    const overlapping =
      overlapsAny(
        startRect,
        [other]
      );

    if(verticalOverlap || overlapping || nearRight){
      candidates.push({
        x:other.x + other.width + gap,
        y:alignNear(start.y, other.y, snapDistance)
      });
    }

    if(verticalOverlap || overlapping || nearLeft){
      candidates.push({
        x:other.x - width - gap,
        y:alignNear(start.y, other.y, snapDistance)
      });
    }

    if(horizontalOverlap || overlapping || nearBottom){
      candidates.push({
        x:alignNear(start.x, other.x, snapDistance),
        y:other.y + other.height + gap
      });
    }

    if(horizontalOverlap || overlapping || nearTop){
      candidates.push({
        x:alignNear(start.x, other.x, snapDistance),
        y:other.y - height - gap
      });
    }
  });

  return candidates
    .map(candidate => ({
      x:clamp(candidate.x, margin, maxX),
      y:clamp(candidate.y, margin, maxY)
    }))
    .filter(candidate =>
      !overlapsAny(
        {
          ...candidate,
          width,
          height
        },
        others
      )
    )
    .sort((a,b) =>
      distance(a,start) - distance(b,start)
    )[0] || null;

}



function alignNear(value,target,threshold){

  return Math.abs(value - target) <= threshold
    ? target
    : value;

}



function distance(a,b){

  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );

}



function floatingBlocksForEffect(
  layer,
  activeEffect,
  currentBlock
){

  return [
    ...layer.querySelectorAll(BLOCK_SELECTOR)
  ].filter(block =>
    block !== currentBlock &&
    !block.hidden &&
    block.classList.contains("effect-block-floating")
  ).map(block => ({
    x:block.offsetLeft,
    y:block.offsetTop,
    width:block.offsetWidth,
    height:block.offsetHeight
  }));

}



function overlapsAny(rect, others){

  return others.some(other =>
    rect.x < other.x + other.width &&
    rect.x + rect.width > other.x &&
    rect.y < other.y + other.height &&
    rect.y + rect.height > other.y
  );

}



function returnToSource(
  block,
  sourceParent,
  sourceNext,
  sourceStyle
){

  restoreBlockStyle(
    block,
    sourceStyle
  );

  if(sourceNext && sourceNext.parentElement === sourceParent){
    sourceParent.insertBefore(
      block,
      sourceNext
    );
    return;
  }

  sourceParent.appendChild(block);

}



function getBlockStyle(block){

  return {
    position:block.style.position,
    left:block.style.left,
    top:block.style.top,
    width:block.style.width,
    zIndex:block.style.zIndex
  };

}



function resetBlockStyle(block){

  block.style.position =
    "";

  block.style.left =
    "";

  block.style.top =
    "";

  block.style.width =
    "";

  block.style.zIndex =
    "";

}



function restoreBlockStyle(
  block,
  sourceStyle
){

  block.style.position =
    sourceStyle.position;

  block.style.left =
    sourceStyle.left;

  block.style.top =
    sourceStyle.top;

  block.style.width =
    sourceStyle.width;

  block.style.zIndex =
    sourceStyle.zIndex;

}



function movePlaceholder(
  dockContainer,
  placeholder,
  y
){

  const before =
    findToolbarInsertTarget(
      dockContainer,
      y
    );

  dockContainer.insertBefore(
    placeholder,
    before
  );

}



function findToolbarInsertTarget(
  dockContainer,
  y
){

  const blocks =
    [...dockContainer.children]
      .filter(child => (
        child.matches(BLOCK_SELECTOR)
      ));

  return blocks.find(block => {
    const rect =
      block.getBoundingClientRect();

    return y < rect.top + rect.height / 2;
  }) || null;

}



function isPointInside(event, element){

  if(!element){
    return false;
  }

  const rect =
    element.getBoundingClientRect();

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );

}



function clamp(value, min, max){

  return Math.max(
    min,
    Math.min(max, value)
  );

}



function syncFloatingVisibility(
  layer,
  activeEffect
){

  if(!layer){
    return;
  }

  layer
    .querySelectorAll(BLOCK_SELECTOR)
    .forEach(block => {
      const owner =
        block.dataset.floatingEffect ||
        effectFromBlock(block);

      block.dataset.floatingEffect =
        owner;

      block.hidden =
        !!activeEffect &&
        owner !== activeEffect;
    });

}



function removeDockedCopiesForFloatingBlocks(
  toolOptions,
  layer,
  activeEffect
){

  if(!toolOptions || !layer || !activeEffect){
    return;
  }

  [
    ...toolOptions.querySelectorAll(BLOCK_SELECTOR)
  ].forEach(block => {
    const floating =
      findFloatingBlock(
        layer,
        activeEffect,
        block.dataset.effectBlock,
        block
      );

    if(!floating){
      return;
    }

    floating._effectBlockDockContainer =
      block.parentElement;

    block.remove();
  });

}



function findFloatingBlock(
  layer,
  effect,
  blockId,
  currentBlock
){

  if(!effect || !blockId){
    return null;
  }

  return [
    ...layer.querySelectorAll(BLOCK_SELECTOR)
  ].find(block =>
    block !== currentBlock &&
    block.classList.contains("effect-block-floating") &&
    block.dataset.floatingEffect === effect &&
    block.dataset.effectBlock === blockId
  ) || null;

}



function bringFloatingBlockForward(block){

  if(!block?.parentElement){
    return;
  }

  const layer =
    block.closest(`.${FLOATING_LAYER_CLASS}`);

  block.parentElement.appendChild(block);

  if(!layer){
    return;
  }

  const next =
    Number(layer.dataset.nextZ || 1) + 1;

  layer.dataset.nextZ =
    String(next);

  block.style.zIndex =
    String(next);

}



function effectFromBlock(block){

  const id =
    block?.dataset?.effectBlock || "";

  if(id.startsWith("feedback-")){
    return "feedback";
  }

  if(id.startsWith("drift-")){
    return "drift";
  }

  if(id.startsWith("fm-")){
    return "fm";
  }

  if(id.startsWith("fx-")){
    return "fx";
  }

	  if(id.startsWith("rgb-")){
	    return "rgb";
	  }
	
	  if(id.startsWith("ar-")){
	    return "ar";
	  }
	
	  if(id.startsWith("dither-")){
	    return "dither";
	  }

  return "";

}
