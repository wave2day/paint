import {
  getIconMemory,
  setIconMemory
}
from
"./desktopMemory.js";

import {
  bringWindowToFront
}
from
"../window/windowFocus.js?v=window-stack-1";

import {
  clampToDesktop,
  resolveIconPosition
}
from
"./desktopGrid.js?v=desktop-window-shortcuts-1";

import {
  beginDesktopBundleDrag,
  cleanupDesktopBundleDrag,
  hasDesktopBundleSelection,
  moveDesktopBundleDrag
}
from
"./desktopDragDrop.js?v=desktop-selection-menu-1";

export function bindDesktopWindowShortcuts(
  desktop,
  usedSlots
){

  bindRestoreWindow();

  document
    .querySelectorAll(".window")
    .forEach(win => {

      const close =
        win.querySelector(".close");

      if (!close) return;

      const id =
        win.id || "window";

      const title =
        win.querySelector(
          ".title-left span"
        )?.textContent
        || "Window";

      const sourceIcon =
        win.querySelector(
          ".title-icon"
        )?.getAttribute("src")
        || "./js/icons/appicon.svg";

      const icon =
        document.createElement("div");

      icon.className =
        "desktop-icon";

      icon.dataset.windowId =
        id;

      const saved =
        getIconMemory(id);

      const position =
        resolveIconPosition(
          desktop,
          saved,
          usedSlots
        );

      icon.style.left =
        position.left + "px";

      icon.style.top =
        position.top + "px";

      usedSlots.push(position);

      const startsMinimized =
        win.dataset.startMinimized === "true";

      const iconVisible =
        startsMinimized
          ? true
          : saved
            ? Boolean(saved.visible)
            : false;

      icon.style.display =
        iconVisible
        ? "flex"
        : "none";

      icon.innerHTML = `

<div class="desktop-icon-image">

  <img
    class="desktop-main-icon"
    src="${sourceIcon}"
    alt=""
  >

  <div class="desktop-shortcut">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 111.01 111.08"
    >

      <path
        fill="#ffffff"
        d="M110.65,0L13.28.57c-6.76,0-12.76,6.78-12.76,13.66l-.52,96.61,95.37.24c8.55.02,15.64-5.16,15.64-14.65l-.36-96.43Z"
      />

      <path
        fill="#000000"
        d="M110.65,0L13.28.57c-6.76,0-12.76,6.78-12.76,13.66l-.52,96.61,95.37.24c8.55.02,15.64-5.16,15.64-14.65l-.36-96.43ZM103.34,8.21l-.03,89.28c0,3.25-3.23,5.59-6.18,6l-89.28-.39.35-89.01c0-3.27,2.99-5.68,5.95-6.08l89.19.21Z"
      />

      <path
        fill="#000000"
        d="M90.57,21.02h-41.66c3.85,4.28,7.69,8.57,11.54,12.85C41.62,49.03.46,68.97,29.16,95.54c.27.25.8.02.68-.32-3.82-10.96,36.79-35.13,47.41-42.65h0c4.44,4.94,8.88,9.89,13.32,14.83V21.02Z"
      />

    </svg>

  </div>

</div>

<span>${title}</span>

`;

      desktop.appendChild(icon);

      if (iconVisible) {
        win.style.display =
          "none";
      }

      bindWindowShortcutDrag(
        desktop,
        icon,
        id
      );

      close.addEventListener(
        "click",
        () => {

          win.style.display =
            "none";

          icon.style.display =
            "flex";

          icon.classList.remove(
            "active"
          );

          setIconMemory(
            id,
            {
              left: icon.style.left,
              top: icon.style.top,
              visible: true
            }
          );

        }
      );

      icon.addEventListener(
        "dblclick",
        () => {

          if(
            icon.classList.contains(
              "active"
            )
          ){
            return;
          }

          window.restoreWindow(id);

        }
      );

      icon.addEventListener(
        "contextmenu",
        event => {
          event.preventDefault();
          event.stopPropagation();
        }
      );

    });

}

function bindWindowShortcutDrag(
  desktop,
  icon,
  id
){

  let dragging = false;

  let offsetX = 0;
  let offsetY = 0;

  let startLeft = 0;
  let startTop = 0;
  let groupDrag = false;
  let groupStart = [];

  icon.addEventListener(
    "pointerdown",
    e => {

      dragging = true;

      if(hasDesktopBundleSelection(icon)){
        groupDrag =
          true;

        groupStart =
          beginDesktopBundleDrag(desktop);
      }else{
        groupDrag =
          false;

        groupStart =
          [];

        icon.style.zIndex = 9999;
      }

      startLeft =
        icon.offsetLeft;

      startTop =
        icon.offsetTop;

      offsetX =
        e.clientX
        - icon.offsetLeft;

      offsetY =
        e.clientY
        - icon.offsetTop;

      icon.setPointerCapture?.(
        e.pointerId
      );

      e.preventDefault();

    }
  );

  icon.addEventListener(
    "pointermove",
    e => {

      if (!dragging) return;

      if(groupDrag){
        moveDesktopBundleDrag(
          groupStart,
          e.clientX - offsetX - startLeft,
          e.clientY - offsetY - startTop
        );

        return;
      }

      icon.style.left =
        (
          e.clientX
          - offsetX
        ) + "px";

      icon.style.top =
        (
          e.clientY
          - offsetY
        ) + "px";

    }
  );

  icon.addEventListener(
    "pointerup",
    e => {

      if (!dragging) return;

      dragging = false;

      cleanupDesktopBundleDrag();

      if(!groupDrag){
        icon.style.zIndex = "";
      }

      icon.releasePointerCapture?.(
        e.pointerId
      );

      if(groupDrag){
        groupStart.forEach(entry => {
          const snapped =
            clampToDesktop(
              desktop,
              {
                left: entry.icon.offsetLeft,
                top: entry.icon.offsetTop
              }
            );

          entry.icon.style.left =
            snapped.left + "px";

          entry.icon.style.top =
            snapped.top + "px";

          if(entry.windowId){
            setIconMemory(
              entry.windowId,
              {
                left: entry.icon.style.left,
                top: entry.icon.style.top,
                visible:
                  entry.icon.style.display !== "none"
              }
            );
          }
        });

        return;
      }

      const snapped =
        clampToDesktop(
          desktop,
          {
            left: icon.offsetLeft,
            top: icon.offsetTop
          }
        );

      icon.style.left =
        snapped.left + "px";

      icon.style.top =
        snapped.top + "px";

      if(iconCollides(icon)){

        icon.style.left =
          startLeft + "px";

        icon.style.top =
          startTop + "px";

      }

      setIconMemory(
        id,
        {
          left: icon.style.left,
          top: icon.style.top,
          visible:
            icon.style.display !== "none"
        }
      );

    }
  );

}

function bindRestoreWindow(){

  window.restoreWindow =
  function(id){

    const win =
      document.getElementById(id);

    if(!win){
      return;
    }

    bringWindowToFront(win);

    win.style.display = "";

    win.classList.remove(
      "collapsed"
    );

    const icon =
      document.querySelector(
        `.desktop-icon[data-window-id="${id}"]`
      );

    icon?.classList.add(
      "active"
    );

    if(icon){
      setIconMemory(
        id,
        {
          left: icon.style.left,
          top: icon.style.top,
          visible: true
        }
      );
    }

  };

}

function iconCollides(icon){

  const iconRect =
    icon.getBoundingClientRect();

  let collided = false;

  document
    .querySelectorAll(".window")
    .forEach(otherWin => {

      if (
        otherWin.style.display === "none"
      ) return;

      const rect =
        otherWin.getBoundingClientRect();

      const overlap =
        !(
          iconRect.right < rect.left ||
          iconRect.left > rect.right ||
          iconRect.bottom < rect.top ||
          iconRect.top > rect.bottom
        );

      if (overlap) {
        collided = true;
      }

    });

  document
    .querySelectorAll(".desktop-icon")
    .forEach(otherIcon => {

      if(
        otherIcon === icon ||
        otherIcon.style.display === "none"
      ){
        return;
      }

      const rect =
        otherIcon.getBoundingClientRect();

      const overlap =
        !(
          iconRect.right <= rect.left ||
          iconRect.left >= rect.right ||
          iconRect.bottom <= rect.top ||
          iconRect.top >= rect.bottom
        );

      if(overlap){
        collided = true;
      }

    });

  return collided;

}
