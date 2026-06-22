import {
  getWallpaperMemory,
  setWallpaperMemory
}
from
"../desktop/desktopMemory.js";



const wallpaper =
  document.querySelector(
    ".desktop-wallpaper"
  );

let activeFitMenu = null;



function normalizeWallpaperMemory(savedWallpaper){

  if(
    typeof savedWallpaper === "string"
  ){
    return {
      src:savedWallpaper,
      fit:"fill"
    };
  }

  if(
    savedWallpaper?.src
  ){
    return {
      src:savedWallpaper.src,
      fit:savedWallpaper.fit || "fill"
    };
  }

  return {
    src:"./media/wallpapers/default.jpg",
    fit:"fill"
  };

}



function getFitStyles(fit){

  if(fit === "fit"){
    return {
      size:"contain",
      color:"#111"
    };
  }

  if(fit === "stretch"){
    return {
      size:"100% 100%",
      color:"#111"
    };
  }

  return {
    size:"cover",
    color:"#111"
  };

}



function toCssImageUrl(src){

  const safeSrc =
    String(src)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, "\\\"")
      .replace(/\n/g, "");

  return `url("${safeSrc}")`;

}



export function initWallpaper(){

  const wallpaperData =
    normalizeWallpaperMemory(
      getWallpaperMemory()
    );

  setWallpaper(
    wallpaperData.src,
    wallpaperData.fit
  );

}



/* =========================
   SET WALLPAPER
========================= */

export function setWallpaper(
  src,
  fit = "fill"
){

  if(!wallpaper){
    return;
  }

  const styles =
    getFitStyles(fit);

  wallpaper.style.backgroundColor =
    styles.color;

  wallpaper.style.backgroundImage =
    toCssImageUrl(src);

  wallpaper.style.backgroundSize =
    styles.size;

  wallpaper.style.backgroundPosition =
    "center";

  wallpaper.style.backgroundRepeat =
    "no-repeat";

  setWallpaperMemory({
    src,
    fit
  });

}



export function requestWallpaper(
  src,
  x = window.innerWidth / 2,
  y = window.innerHeight / 2
){

  getImageRatio(src)
    .then(imageRatio => {

      const desktopRatio =
        window.innerWidth /
        window.innerHeight;

      const mismatch =
        Math.abs(
          imageRatio - desktopRatio
        ) > 0.08;

      if(!mismatch){
        setWallpaper(src, "fill");
        return;
      }

      openWallpaperFitMenu(
        src,
        x,
        y
      );

    })
    .catch(() => {

      openWallpaperFitMenu(
        src,
        x,
        y
      );

    });

}



function getImageRatio(src){

  return new Promise((resolve, reject) => {

    const img =
      new Image();

    img.onload = () => {
      resolve(
        img.naturalWidth /
        img.naturalHeight
      );
    };

    img.onerror =
      reject;

    img.src =
      src;

  });

}



function openWallpaperFitMenu(
  src,
  x,
  y
){

  closeWallpaperFitMenu();

  const menu =
    document.createElement(
      "div"
    );

  menu.className =
    "context-submenu wallpaper-fit-menu";

  menu.style.setProperty(
    "--x",
    `${x}px`
  );

  menu.style.setProperty(
    "--y",
    `${y}px`
  );

  menu.style.position =
    "fixed";

  menu.style.zIndex =
    999999;

  menu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    <div class="context-title">
      Wallpaper
    </div>

    <div class="context-separator"></div>

    <button class="context-item" data-fit="fill">
      Fill
    </button>

    <button class="context-item" data-fit="fit">
      Fit
    </button>

    <button class="context-item" data-fit="stretch">
      Stretch
    </button>
  `;

  menu
    .querySelectorAll(".context-item")
    .forEach(button => {

      button.addEventListener(
        "pointerdown",
        event => {

          event.stopPropagation();

          setWallpaper(
            src,
            button.dataset.fit
          );

          closeWallpaperFitMenu();

        }
      );

    });

  document.body.appendChild(
    menu
  );

  menu.classList.add(
    "is-open"
  );

  activeFitMenu =
    menu;

  requestAnimationFrame(() => {

    document.addEventListener(
      "pointerdown",
      closeWallpaperFitMenu,
      { once:true }
    );

  });

}



function closeWallpaperFitMenu(){

  if(!activeFitMenu){
    return;
  }

  activeFitMenu.remove();

  activeFitMenu = null;

}
