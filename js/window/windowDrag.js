import {
  bindWindowFocus
}
from
"./windowFocus.js?v=window-stack-1";

import {
  bindWindowResize
}
from
"./windowResize.js?v=window-snap-cache-1";

import {
  clampWindowPosition
}
from
"./windowBounds.js?v=window-snap-cache-1";

import {
  applyWindowSnap
}
from
"./windowSnap.js?v=window-snap-cache-1";

import {
  bindWindowState
}
from
"./windowState.js?v=collapse-manual-revert-1";

import {
  buildResizeGrip
}
from
"./windowGrip.js?v=window-snap-cache-1";

import {
  getWindowRect
}
from
"./windowGeometry.js?v=window-snap-cache-1";



export function bindWindows() {

  const SAFE = 12;
  const SNAP = 18;
  const SHADOW = 8;

  document
    .querySelectorAll(".window")
    .forEach(win => {

      const dragbar =
        win.querySelector(".dragbar");

      const minimize =
        win.querySelector(".minimize");

      const maximize =
        win.querySelector(".maximize");

      const grip =
        win.querySelector(".resize-grip");

      if (!dragbar) return;

      buildResizeGrip(grip);

      bindWindowResize(
        win,
        grip,
        SAFE
      );

      bindWindowState(
        win,
        minimize,
        maximize
      );

      bindWindowFocus(win);



      let dragging = false;

      let offsetX = 0;
      let offsetY = 0;



      /* =========================
         DRAG START
      ========================== */

      dragbar.addEventListener(
        "pointerdown",
        e => {

          if (
            e.target.closest(".win-btn")
          ) return;

          if (
            win.classList.contains(
              "maximized"
            )
          ) return;

          dragging = true;

          const rect =
            win.getBoundingClientRect();

          offsetX =
            e.clientX - rect.left;

          offsetY =
            e.clientY - rect.top;

          e.preventDefault();

        }
      );



      /* =========================
         POINTER MOVE
      ========================== */

      window.addEventListener(
        "pointermove",
        e => {

          if (!dragging) return;

          const rect =
            getWindowRect(
              win,
              SHADOW
            );

          let nextX =
            e.clientX - offsetX;

          let nextY =
            e.clientY - offsetY;



          /* =========================
             VIEWPORT LIMITS
          ========================== */

          const clamped =
            clampWindowPosition(
              nextX,
              nextY,
              rect,
              SAFE
            );

          nextX = clamped.x;
          nextY = clamped.y;



          /* =========================
             WINDOW SNAP
          ========================== */

          const windows =
            document.querySelectorAll(
              ".window"
            );

          const snapped =
            applyWindowSnap(
              nextX,
              nextY,
              rect,
              windows,
              win,
              SNAP,
              SHADOW
            );

          nextX = snapped.x;
          nextY = snapped.y;



          win.style.left =
            nextX + "px";

          win.style.top =
            nextY + "px";

        }
      );



      /* =========================
         POINTER UP
      ========================== */

      window.addEventListener(
        "pointerup",
        () => {

          dragging = false;

        }
      );

    });

}
