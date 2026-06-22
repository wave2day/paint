export function bringWindowToFront(win) {

  document
    .querySelectorAll(
      ".window,.dialog-window"
    )
    .forEach(item => {

      item.style.zIndex = 1;

    });

  win.style.zIndex = 10;

}

export function bindWindowFocus(win) {

  win.addEventListener(
    "pointerdown",
    () => {

      bringWindowToFront(win);

    }
  );

}
