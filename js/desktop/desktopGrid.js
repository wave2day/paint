import {
  setIconMemory,
  updateDesktopItem
}
from
"./desktopMemory.js";

export const GRID = {
  left:48,
  top:96,
  width:96,
  height:104
};

export const ICON_SIZE = {
  width:72,
  height:92
};

export function resolveIconPosition(
  desktop,
  saved,
  occupied
){

  const parsed =
    parsePosition(saved);

  if(
    parsed &&
    isInsideDesktop(desktop,parsed) &&
    !collidesWithAny(parsed,occupied)
  ){
    return parsed;
  }

  return nextFreeSlot(
    desktop,
    occupied
  );

}

export function nextFreeSlot(desktop,occupied){

  const rect =
    desktop.getBoundingClientRect();

  const maxRows =
    Math.max(
      1,
      Math.floor(
        (rect.height - GRID.top - 24) /
        GRID.height
      )
    );

  const maxCols =
    Math.max(
      1,
      Math.floor(
        (rect.width - GRID.left - 24) /
        GRID.width
      )
    );

  for(let col = 0; col < maxCols; col++){

    for(let row = 0; row < maxRows; row++){

      const position =
        {
          left: GRID.left + col * GRID.width,
          top: GRID.top + row * GRID.height
        };

      if(
        !collidesWithAny(position,occupied)
      ){
        return position;
      }

    }

  }

  return {
    left: GRID.left,
    top: GRID.top
  };

}

export function nextFreeSlotFromRight(desktop,occupied){

  const rect =
    desktop.getBoundingClientRect();

  const maxRows =
    Math.max(
      1,
      Math.floor(
        (rect.height - GRID.top - 24) /
        GRID.height
      )
    );

  const maxCols =
    Math.max(
      1,
      Math.floor(
        (rect.width - GRID.left - 24) /
        GRID.width
      )
    );

  for(let col = maxCols - 1; col >= 0; col -= 1){

    for(let row = 0; row < maxRows; row += 1){

      const position =
        {
          left: GRID.left + col * GRID.width,
          top: GRID.top + row * GRID.height
        };

      if(!collidesWithAny(position,occupied)){
        return position;
      }

    }

  }

  return nextFreeSlot(
    desktop,
    occupied
  );

}

export function placeIconsInGrid(icons){

  const desktop =
    document.querySelector(".desktop");

  if(!desktop){
    return;
  }

  const occupied =
    [];

  icons.forEach(icon => {

    const position =
      nextFreeSlot(
        desktop,
        occupied
      );

    setIconPosition(
      icon,
      position
    );

    occupied.push(position);

  });

}

export function setIconPosition(icon,position){

  const desktop =
    document.querySelector(".desktop");

  const safe =
    desktop
      ? clampToDesktop(desktop,position)
      : position;

  icon.style.left =
    safe.left + "px";

  icon.style.top =
    safe.top + "px";

  if(icon.dataset.itemId){

    updateDesktopItem(
      icon.dataset.itemId,
      {
        left: icon.style.left,
        top: icon.style.top
      }
    );

    return;

  }

  if(icon.dataset.windowId){

    setIconMemory(
      icon.dataset.windowId,
      {
        left: icon.style.left,
        top: icon.style.top,
        visible: icon.style.display !== "none"
      }
    );

  }

}

export function clampToDesktop(desktop,position){

  const rect =
    desktop.getBoundingClientRect();

  return {
    left: clamp(
      position.left,
      0,
      Math.max(0,rect.width - ICON_SIZE.width)
    ),
    top: clamp(
      position.top,
      0,
      Math.max(0,rect.height - ICON_SIZE.height)
    )
  };

}

export function snap(value,size){

  return Math.round(value / size) * size;

}

function parsePosition(saved){

  const left =
    parseCssNumber(saved?.left);

  const top =
    parseCssNumber(saved?.top);

  if(
    left === null ||
    top === null
  ){
    return null;
  }

  return {
    left,
    top
  };

}

function parseCssNumber(value){

  if(typeof value === "number"){
    return Number.isFinite(value)
      ? value
      : null;
  }

  if(typeof value !== "string"){
    return null;
  }

  const number =
    parseFloat(value);

  return Number.isFinite(number)
    ? number
    : null;

}

function isInsideDesktop(desktop,position){

  const rect =
    desktop.getBoundingClientRect();

  return (
    position.left >= 0 &&
    position.top >= 0 &&
    position.left <= rect.width - ICON_SIZE.width &&
    position.top <= rect.height - ICON_SIZE.height
  );

}

function collidesWithAny(position,positions){

  return positions.some(other =>
    positionsOverlap(position,other)
  );

}

function positionsOverlap(a,b){

  return !(
    a.left + ICON_SIZE.width <= b.left ||
    a.left >= b.left + ICON_SIZE.width ||
    a.top + ICON_SIZE.height <= b.top ||
    a.top >= b.top + ICON_SIZE.height
  );

}

function clamp(value,min,max){

  return Math.max(
    min,
    Math.min(max,value)
  );

}
