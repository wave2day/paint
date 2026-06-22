export function bindWindowState(
  win,
  minimize,
  maximize
) {

  let restoreLeft = "";
  let restoreTop = "";

  let restoreWidth = "";
  let restoreHeight = "";



  /* =========================
     MINIMIZE
  ========================== */

  if (minimize) {

    minimize.addEventListener(
      "click",
      () => {

        if (
          win.classList.contains(
            "maximized"
          )
        ) {

          win.classList.remove(
            "maximized"
          );

        }

        if (
          win.classList.contains(
            "gallery-fullscreen-mode"
          )
        ) {

          const fullscreenToggle =
            win.querySelector(
              "[data-gallery-toggle-fullscreen].active"
            );

          if(fullscreenToggle){
            fullscreenToggle.click();
          }else{
            win.classList.remove(
              "gallery-fullscreen-mode"
            );
          }

        }

        win.classList.toggle(
          "collapsed"
        );

      }
    );

  }



  /* =========================
     MAXIMIZE
  ========================== */

  if (
    maximize &&
    !maximize.classList.contains(
      "is-disabled"
    )
  ) {

    maximize.addEventListener(
      "click",
      () => {

        if (
          win.classList.contains(
            "collapsed"
          )
        ) {

          win.classList.remove(
            "collapsed"
          );

        }

        if (
          !win.classList.contains(
            "maximized"
          )
        ) {

          restoreLeft =
            win.style.left;

          restoreTop =
            win.style.top;

          restoreWidth =
            win.style.width;

          restoreHeight =
            win.style.height;

          win.classList.add(
            "maximized"
          );

          const MAX_PAD = 15;

          win.style.left =
            MAX_PAD + "px";

          win.style.top =
            MAX_PAD + "px";

          win.style.width =
            (
              window.innerWidth
              - MAX_PAD * 2
            ) + "px";

          win.style.height =
            (
              window.innerHeight
              - MAX_PAD * 2
            ) + "px";

        } else {

          win.classList.remove(
            "maximized"
          );

          win.style.left =
            restoreLeft;

          win.style.top =
            restoreTop;

          win.style.width =
            restoreWidth;

          win.style.height =
            restoreHeight;

        }

      }
    );

  }

}
