export function calculateMinWidth(win) {

  const menu =
    win.querySelector(".menu");

  if (!menu) {
    return 320;
  }

  let requiredWidth = 320;

  menu
    .querySelectorAll(".menu-item")
    .forEach(item => {

      const dropdown =
        item.querySelector(
          ".menu-dropdown"
        );

      const itemRight =
        item.offsetLeft
        + item.offsetWidth;

      requiredWidth =
        Math.max(
          requiredWidth,
          itemRight + 40
        );

      if (dropdown) {

        const DROPDOWN_WIDTH = 220;

        const dropdownRight =
          item.offsetLeft
          + DROPDOWN_WIDTH
          + 10;

        requiredWidth =
          Math.max(
            requiredWidth,
            dropdownRight
          );

      }

    });

  return requiredWidth;

}



function readPixelVar(
  element,
  name,
  fallback
) {

  const value =
    parseFloat(
      getComputedStyle(element)
        .getPropertyValue(name)
    );

  if (
    Number.isFinite(value)
  ) {
    return value;
  }

  return fallback;

}



export function bindWindowResize(
  win,
  grip,
  SAFE
) {

  let resizing = false;

  let startW = 0;
  let startH = 0;

  let startX = 0;
  let startY = 0;



  if (!grip) return;



  /* =========================
     RESIZE START
  ========================== */

  grip.addEventListener(
    "pointerdown",
    e => {

      if (
        win.classList.contains(
          "maximized"
        )
      ) return;

      resizing = true;

      const rect =
        win.getBoundingClientRect();

      startW = rect.width;
      startH = rect.height;

      startX = e.clientX;
      startY = e.clientY;

      e.preventDefault();

    }
  );



  /* =========================
     RESIZING
  ========================== */

  window.addEventListener(
    "pointermove",
    e => {

      if (!resizing) return;

      const width =
        startW +
        (e.clientX - startX);

      const height =
        startH +
        (e.clientY - startY);

      const minWidth =
        calculateMinWidth(win);

      const maxWidth =
        window.innerWidth
        - win.offsetLeft
        - SAFE;

      const maxHeight =
        window.innerHeight
        - win.offsetTop
        - SAFE;



      /* =========================
         DYNAMIC MIN HEIGHT
      ========================== */

      let minHeight = 240;

      if (win.id === "workstation") {

        const titlebar =
          win.querySelector(
            ".titlebar"
          );

        const menu =
          win.querySelector(
            ".menu"
          );

        const toolEngines =
          win.querySelector(
            ".tool-engines"
          );

        const bottom =
          win.querySelector(
            ".window-bottom"
          );

        const controlsMinHeight =
          readPixelVar(
            win,
            "--effect-controls-min-height",
            260
          );

        minHeight =
          titlebar.offsetHeight
          + menu.offsetHeight
          + toolEngines.offsetHeight
          + controlsMinHeight
          + bottom.offsetHeight
          + 56;

      }



      /* =========================
         APPLY SIZE
      ========================== */

      win.style.width =
        Math.max(
          minWidth,
          Math.min(
            maxWidth,
            width
          )
        ) + "px";

      win.style.height =
        Math.max(
          minHeight,
          Math.min(
            maxHeight,
            height
          )
        ) + "px";

    }
  );



  /* =========================
     RESIZE END
  ========================== */

  window.addEventListener(
    "pointerup",
    () => {

      resizing = false;

    }
  );

}
