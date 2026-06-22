const GLITCH_GRAPHICS_URL =
  "https://glitch.graphics";

export function initGlitchGraphicsWindow(){

  const win =
    document.getElementById("glitchGraphics");

  if(!win){
    return;
  }

  const frame =
    win.querySelector(".glitch-graphics-frame");

  const status =
    win.querySelector("[data-glitch-graphics-status]");

  win.addEventListener(
    "selectstart",
    event => {
      event.preventDefault();
    }
  );

  win.addEventListener(
    "pointerdown",
    () => {
      clearSelection();
    }
  );

  win.addEventListener(
    "pointerup",
    () => {
      clearSelection();
    }
  );

  win.addEventListener(
    "dragstart",
    event => {
      event.preventDefault();
    }
  );

  bindMenuAction(
    win,
    "reload",
    () => {
      if(frame){
        const source =
          frame.src || GLITCH_GRAPHICS_URL;

        frame.src =
          "about:blank";

        window.requestAnimationFrame(
          () => {
            frame.src =
              source;
          }
        );
      }

      setStatus(
        status,
        "Reloaded"
      );
    }
  );

  bindMenuAction(
    win,
    "open-browser",
    () => {
      window.open(
        GLITCH_GRAPHICS_URL,
        "_blank",
        "noopener"
      );
    }
  );

  bindMenuAction(
    win,
    "fit",
    () => {
      win.classList.remove(
        "glitch-graphics-actual"
      );

      setStatus(
        status,
        "Fit Window"
      );
    }
  );

  bindMenuAction(
    win,
    "snapshot-desktop",
    () => {
      setStatus(
        status,
        "Snapshot route pending"
      );
    }
  );

  bindMenuAction(
    win,
    "close",
    () => {
      win
        .querySelector(".close")
        ?.click();
    }
  );

  win.addEventListener(
    "contextmenu",
    event => {
      if(
        event.target.closest(
          ".titlebar,.menu,.context-menu"
        )
      ){
        return;
      }

      event.preventDefault();
      openGlitchGraphicsContextMenu(
        event.clientX,
        event.clientY,
        status
      );
    }
  );

}



function bindMenuAction(root,action,handler){

  root
    .querySelectorAll(`[data-glitch-action="${action}"]`)
    .forEach(item => {
      item.addEventListener(
        "click",
        event => {
          event.preventDefault();

          if(
            item.getAttribute("aria-disabled") === "true"
          ){
            return;
          }

          handler();
        }
      );
    });

}



function openGlitchGraphicsContextMenu(x,y,status){

  document
    .querySelectorAll(".glitch-graphics-context-menu")
    .forEach(menu => menu.remove());

  const menu =
    document.createElement("div");

  menu.className =
    "context-menu glitch-graphics-context-menu";

  menu.style.position =
    "fixed";

  menu.style.zIndex =
    "999999";

  menu.style.setProperty(
    "--x",
    `${x}px`
  );

  menu.style.setProperty(
    "--y",
    `${y}px`
  );

  menu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    <button class="context-item" data-context-action="reload">
      <span class="context-icon context-refresh"></span>
      <span>Reload</span>
    </button>

    <button class="context-item" data-context-action="open-browser">
      <span class="context-icon context-image"></span>
      <span>Open in Browser</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item" data-context-action="snapshot-desktop" aria-disabled="true">
      <span class="context-icon context-image"></span>
      <span>Snapshot to Desktop</span>
    </button>
  `;

  menu
    .querySelector('[data-context-action="reload"]')
    ?.addEventListener(
      "click",
      () => {
        document
          .querySelector('[data-glitch-action="reload"]')
          ?.click();
      }
    );

  menu
    .querySelector('[data-context-action="open-browser"]')
    ?.addEventListener(
      "click",
      () => {
        document
          .querySelector('[data-glitch-action="open-browser"]')
          ?.click();
      }
    );

  document.body.appendChild(menu);

  requestAnimationFrame(() => {
    menu.classList.add("is-open");
  });

  function close(event){
    if(
      event &&
      event.target.closest(".glitch-graphics-context-menu")
    ){
      return;
    }

    menu.remove();
    document.removeEventListener("pointerdown",close);
    document.removeEventListener("keydown",closeKey);
  }

  function closeKey(event){
    if(event.key === "Escape"){
      close();
    }
  }

  document.addEventListener(
    "pointerdown",
    close
  );

  document.addEventListener(
    "keydown",
    closeKey
  );

  setStatus(
    status,
    "Context menu"
  );

}



function setStatus(target,text){

  if(!target){
    return;
  }

  target.textContent =
    text;

}



function clearSelection(){

  const selection =
    window.getSelection?.();

  if(selection){
    selection.removeAllRanges();
  }

}
