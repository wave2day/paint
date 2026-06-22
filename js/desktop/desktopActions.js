import {
  placeIconsInGrid,
  resolveIconPosition,
  setIconPosition,
  snap
}
from
"./desktopGrid.js?v=desktop-window-shortcuts-1";

export function arrangeDesktopIcons(
  mode = "name"
){

  const icons =
    getDesktopIcons();

  const sorted =
    [...icons].sort((a,b) => {

      if(mode === "type"){
        return getIconType(a)
          .localeCompare(getIconType(b));
      }

      return getIconLabel(a)
        .localeCompare(getIconLabel(b));

    });

  placeIconsInGrid(sorted);

}

export function alignDesktopIcons(
  size = 32
){

  const desktop =
    document.querySelector(".desktop");

  if(!desktop){
    return;
  }

  const occupied =
    [];

  getDesktopIcons().forEach(icon => {

    const current =
      {
        left: snap(
          icon.offsetLeft,
          size
        ),
        top: snap(
          icon.offsetTop,
          size
        )
      };

    const safe =
      resolveIconPosition(
        desktop,
        current,
        occupied
      );

    setIconPosition(
      icon,
      safe
    );

    occupied.push(safe);

  });

}

export function repairDesktopIcons(){

  const desktop =
    document.querySelector(".desktop");

  if(!desktop){
    return;
  }

  const occupied =
    [];

  getDesktopIcons().forEach(icon => {

    const safe =
      resolveIconPosition(
        desktop,
        {
          left: icon.style.left,
          top: icon.style.top
        },
        occupied
      );

    setIconPosition(
      icon,
      safe
    );

    occupied.push(safe);

  });

}

function getDesktopIcons(){

  return Array.from(
    document.querySelectorAll(
      ".desktop-icon"
    )
  );

}

function getIconLabel(icon){

  return icon
    .querySelector("span")
    ?.textContent
    ?.trim()
    ?.toLowerCase()
    || "";

}

function getIconType(icon){

  if(icon.dataset.itemType){
    return icon.dataset.itemType;
  }

  const src =
    icon
      .querySelector("img")
      ?.getAttribute("src")
      || "";

  return src
    .split(".")
    .pop()
    .toLowerCase();

}
