import {
  bringWindowToFront
}
from
"./windowFocus.js?v=window-stack-1";

const dialogs = new Map();

function getDialogHost(){
  return document.querySelector(".desktop") || document.body;
}

function bringDialogToFront(dialog){

  bringWindowToFront(dialog);

}

function bindDialogDrag(dialog){
  const titlebar =
    dialog.querySelector(".dialog-titlebar");

  if(!titlebar) return;

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titlebar.addEventListener("mousedown", event => {
    if(event.target.closest(".dialog-close")) return;

    dragging = true;

    offsetX = event.clientX - dialog.offsetLeft;
    offsetY = event.clientY - dialog.offsetTop;

    bringDialogToFront(dialog);
  });

  document.addEventListener("mousemove", event => {
    if(!dragging) return;

    dialog.style.left =
      event.clientX - offsetX + "px";

    dialog.style.top =
      event.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
}

function bindDialogResize(dialog){
  const handle =
    dialog.querySelector(".dialog-resize-handle");

  if(!handle || handle.dataset.bound === "true"){
    return;
  }

  handle.dataset.bound =
    "true";

  let resizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  handle.addEventListener("pointerdown", event => {
    resizing = true;

    startX = event.clientX;
    startY = event.clientY;
    startWidth = dialog.offsetWidth;
    startHeight = dialog.offsetHeight;

    bringDialogToFront(dialog);

    handle.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
    event.stopPropagation();
  });

  handle.addEventListener("pointermove", event => {
    if(!resizing){
      return;
    }

    const host =
      getDialogHost();

    const hostRect =
      host.getBoundingClientRect();

    const maxWidth =
      Math.max(
        260,
        hostRect.right - dialog.offsetLeft - 12
      );

    const maxHeight =
      Math.max(
        190,
        hostRect.bottom - dialog.offsetTop - 12
      );

    const nextWidth =
      Math.min(
        maxWidth,
        Math.max(
          260,
          startWidth + event.clientX - startX
        )
      );

    const nextHeight =
      Math.min(
        maxHeight,
        Math.max(
          190,
          startHeight + event.clientY - startY
        )
      );

    if(dialog.dataset.aspectLocked === "true"){
      const aspect =
        parseFloat(dialog.dataset.aspectRatio || "1");

      const chromeW =
        parseFloat(dialog.dataset.aspectChromeW || "0");

      const chromeH =
        parseFloat(dialog.dataset.aspectChromeH || "0");

      const maxLockedWidth =
        parseFloat(dialog.dataset.aspectMaxWidth || maxWidth);

      const maxLockedHeight =
        parseFloat(dialog.dataset.aspectMaxHeight || maxHeight);

      const imageWFromWidth =
        Math.max(
          80,
          nextWidth - chromeW
        );

      const imageWFromHeight =
        Math.max(
          80,
          (nextHeight - chromeH) * aspect
        );

      const imageW =
        Math.min(
          imageWFromWidth,
          imageWFromHeight,
          maxLockedWidth - chromeW,
          maxWidth - chromeW
        );

      const lockedWidth =
        Math.max(
          260,
          Math.round(imageW + chromeW)
        );

      const lockedHeight =
        Math.max(
          190,
          Math.round(imageW / aspect + chromeH)
        );

      dialog.style.width =
        Math.min(
          lockedWidth,
          maxLockedWidth,
          maxWidth
        ) + "px";

      dialog.style.height =
        Math.min(
          lockedHeight,
          maxLockedHeight,
          maxHeight
        ) + "px";

      return;
    }

    dialog.style.width =
      nextWidth + "px";

    dialog.style.height =
      nextHeight + "px";
  });

  handle.addEventListener("pointerup", event => {
    resizing = false;

    handle.releasePointerCapture?.(
      event.pointerId
    );
  });
}

function enableDialogResize(dialog){
  dialog.classList.add("is-resizable");

  let handle =
    dialog.querySelector(".dialog-resize-handle");

  if(!handle){
    handle =
      document.createElement("div");

    handle.className =
      "dialog-resize-handle";

    handle.setAttribute(
      "aria-hidden",
      "true"
    );

    dialog.appendChild(handle);
  }

  bindDialogResize(dialog);
}

export function openDialogWindow({
  id,
  title,
  content,
  left = 180,
  top = 120,
  width,
  height,
  resizable = false
}){
  if(dialogs.has(id)){
    const existing =
      dialogs.get(id);

    const body =
      existing.querySelector(".dialog-body");

    if(body){
      body.innerHTML = "";

      if(typeof content === "string"){
        body.innerHTML = content;
      }else if(content instanceof Node){
        body.appendChild(content);
      }
    }

    existing.style.display = "flex";

    if(width){
      existing.style.width =
        typeof width === "number"
          ? width + "px"
          : width;
    }

    if(height){
      existing.style.height =
        typeof height === "number"
          ? height + "px"
          : height;
    }

    if(resizable){
      enableDialogResize(existing);
    }

    bringDialogToFront(existing);

    return existing;
  }

  const dialog =
    document.createElement("div");

  dialog.className = "dialog-window";
  dialog.dataset.dialogId = id;

  dialog.style.left = left + "px";
  dialog.style.top = top + "px";

  if(width){
    dialog.style.width =
      typeof width === "number"
        ? width + "px"
        : width;
  }

  if(height){
    dialog.style.height =
      typeof height === "number"
        ? height + "px"
        : height;
  }

  const titlebar =
    document.createElement("div");

  titlebar.className = "dialog-titlebar";

  const titleEl =
    document.createElement("div");

  titleEl.className = "dialog-title";
  titleEl.textContent = title;

  const closeBtn =
    document.createElement("button");

  closeBtn.className = "dialog-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close");

  titlebar.appendChild(titleEl);
  titlebar.appendChild(closeBtn);

  const main =
    document.createElement("div");

  main.className = "dialog-main";

  const body =
    document.createElement("div");

  body.className = "dialog-body";

  if(typeof content === "string"){
    body.innerHTML = content;
  }else if(content instanceof Node){
    body.appendChild(content);
  }

  main.appendChild(body);

  dialog.appendChild(titlebar);
  dialog.appendChild(main);

  closeBtn.addEventListener("click", () => {
    dialog.style.display = "none";
  });

  dialog.addEventListener("mousedown", () => {
    bringDialogToFront(dialog);
  });

  getDialogHost().appendChild(dialog);

  dialogs.set(id, dialog);

  bindDialogDrag(dialog);

  if(resizable){
    enableDialogResize(dialog);
  }

  bringDialogToFront(dialog);

  return dialog;
}

export function closeDialogWindow(id){
  const dialog =
    dialogs.get(id);

  if(!dialog) return;

  dialog.style.display = "none";
}

export function initDialogWindows(){
  window.openDialogWindow = openDialogWindow;
  window.closeDialogWindow = closeDialogWindow;
}
