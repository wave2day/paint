import {
  getDesktopItems
}
from
"./desktopMemory.js";

import {
  findDesktopItemById,
  getNextFolderWindowPosition
}
from
"./desktopFolderUtils.js?v=desktop-window-shortcuts-1";

import {
  cssEscape,
  setIconLabel
}
from
"./desktopItemUtils.js?v=desktop-window-shortcuts-1";

import {
  openDesktopImageShortcut
}
from
"./desktopPreview.js?v=desktop-window-shortcuts-1";

const folderSelections =
  new Map();

function getFolderSelection(folderId){
  if(!folderSelections.has(folderId)){
    folderSelections.set(
      folderId,
      new Set()
    );
  }

  return folderSelections.get(folderId);
}

function getSelectedFolderItemIds(folderId){
  return Array.from(
    getFolderSelection(folderId)
  );
}

function applyFolderSelection(body, folderId){
  const selection =
    getFolderSelection(folderId);

  body
    .querySelectorAll(".desktop-folder-item")
    .forEach(entry => {
      entry.classList.toggle(
        "is-selected",
        selection.has(entry.dataset.itemId)
      );
    });
}

function rectsOverlap(a,b){
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function bindFolderMarqueeSelection(body, folderId){
  if(body.dataset.marqueeBound === "true"){
    return;
  }

  body.dataset.marqueeBound =
    "true";

  let selecting =
    false;

  let startX =
    0;

  let startY =
    0;

  let marquee =
    null;

  let moved =
    false;

  body.addEventListener("pointerdown", event => {
    if(
      event.button !== 0 ||
      event.target.closest(".desktop-folder-item")
    ){
      return;
    }

    selecting =
      true;

    startX =
      event.clientX;

    startY =
      event.clientY;

    moved =
      false;

    getFolderSelection(folderId).clear();
    applyFolderSelection(
      body,
      folderId
    );

    marquee =
      document.createElement("div");

    marquee.className =
      "desktop-folder-marquee";

    body.appendChild(marquee);

    body.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
  });

  body.addEventListener("pointermove", event => {
    if(!selecting || !marquee){
      return;
    }

    const bodyRect =
      body.getBoundingClientRect();

    const left =
      Math.min(startX,event.clientX);

    const top =
      Math.min(startY,event.clientY);

    const width =
      Math.abs(event.clientX - startX);

    const height =
      Math.abs(event.clientY - startY);

    if(width > 3 || height > 3){
      moved =
        true;
    }

    marquee.style.left =
      `${left - bodyRect.left + body.scrollLeft}px`;

    marquee.style.top =
      `${top - bodyRect.top + body.scrollTop}px`;

    marquee.style.width =
      `${width}px`;

    marquee.style.height =
      `${height}px`;

    const selectionRect = {
      left,
      top,
      right:left + width,
      bottom:top + height
    };

    const selection =
      getFolderSelection(folderId);

    selection.clear();

    body
      .querySelectorAll(".desktop-folder-item")
      .forEach(entry => {
        if(rectsOverlap(selectionRect,entry.getBoundingClientRect())){
          selection.add(entry.dataset.itemId);
        }
      });

    applyFolderSelection(
      body,
      folderId
    );

    event.preventDefault();
  });

  body.addEventListener("pointerup", event => {
    if(!selecting){
      return;
    }

    selecting =
      false;

    if(moved){
      body.dataset.suppressNextFolderClick =
        "true";
    }

    marquee?.remove();
    marquee =
      null;

    body.releasePointerCapture?.(
      event.pointerId
    );
  });
}

export function openDesktopFolder(
  item,
  deps
){

  const {
    bindFolderFileDrop,
    bindFolderItemDrag,
    folderIconSrc,
    imageIconSrc,
    openWorkstationSaveItem,
    refreshAllOpenFolderWindows,
    workstationIconSrc
  } = deps;

  const content =
    document.createElement("div");

  content.className =
    "desktop-folder-window";

  content.dataset.folderId =
    item.id;

  const path =
    document.createElement("div");

  path.className =
    "desktop-folder-path";

  path.textContent =
    `Desktop > ${item.name || "Folder"}`;

  const body =
    document.createElement("div");

  body.className =
    "desktop-folder-body";

  body.dataset.folderId =
    item.id;

  renderFolderContents(
    body,
    item,
    {
      bindFolderFileDrop,
      bindFolderItemDrag,
      folderIconSrc,
      imageIconSrc,
      openDesktopFolder: nextItem => {
        openDesktopFolder(
          nextItem,
          deps
        );
      },
      openWorkstationSaveItem,
      refreshAllOpenFolderWindows,
      workstationIconSrc
    }
  );

  content.appendChild(path);
  content.appendChild(body);

  const position =
    getNextFolderWindowPosition();

  const dialog =
    window.openDialogWindow?.({
      id: `folder-window-${item.id}`,
      title: item.name || "Folder",
      content,
      left: position.left,
      top: position.top,
      width: 360,
      height: 280,
      resizable: true
    });

  if(dialog){
    dialog.dataset.folderId =
      item.id;
  }

  const icon =
    document.querySelector(
      `.desktop-icon[data-item-id="${cssEscape(item.id)}"]`
    );

  icon?.classList.add("active");

  if(
    dialog &&
    dialog.dataset.folderIconBound !== item.id
  ){
    dialog.dataset.folderIconBound =
      item.id;

    dialog
      .querySelector(".dialog-close")
      ?.addEventListener(
        "click",
        () => {
          icon?.classList.remove("active");
        }
      );
  }

}

export function renderFolderContents(
  body,
  item,
  deps
){

  const {
    bindFolderFileDrop,
    bindFolderItemDrag,
    folderIconSrc,
    imageIconSrc,
    openDesktopFolder,
    openWorkstationSaveItem,
    refreshAllOpenFolderWindows,
    workstationIconSrc
  } = deps;

  body.innerHTML = "";

  const children =
    Array.isArray(item.items)
      ? item.items
      : [];

  const validChildIds =
    new Set(
      children.map(child => child.id)
    );

  const selection =
    getFolderSelection(item.id);

  Array
    .from(selection)
    .forEach(id => {
      if(!validChildIds.has(id)){
        selection.delete(id);
      }
    });

  if(!children.length){
    const empty =
      document.createElement("div");

    empty.className =
      "desktop-folder-empty";

    empty.textContent =
      "Empty folder";

    body.appendChild(empty);
    selection.clear();

    bindFolderFileDrop(
      body,
      item.id
    );

    return;
  }

  const grid =
    document.createElement("div");

  grid.className =
    "desktop-folder-items";

  children.forEach(child => {

    const entry =
      document.createElement("div");

    entry.className =
      "desktop-folder-item";

    entry.dataset.itemType =
      child.type || "file";

    entry.dataset.itemId =
      child.id;

    entry.dataset.parentFolderId =
      item.id;

    entry.draggable =
      true;

    const image =
      document.createElement("img");

    image.className =
      "desktop-folder-item-icon";

    image.src =
      getDesktopItemIconSource(
        child,
        {
          folderIconSrc,
          imageIconSrc,
          workstationIconSrc
        }
      );

    image.alt =
      "";

    image.draggable =
      false;

    const label =
      document.createElement("span");

    setIconLabel(
      label,
      child.name,
      "Item"
    );

    entry.appendChild(image);
    entry.appendChild(label);

    bindFolderItemDrag(
      entry,
      item,
      child,
      {
        getSelectedFolderItemIds
      }
    );

    if(child.type === "folder"){
      entry.addEventListener("dblclick", event => {
        event.preventDefault();
        event.stopPropagation();

        openDesktopFolder(child);
      });
    }

    if(child.type === "workstation-save"){
      entry.addEventListener("dblclick", event => {
        event.preventDefault();
        event.stopPropagation();

        openWorkstationSaveItem(child);
      });
    }

    if(child.type === "gallery-image-shortcut"){
      entry.addEventListener("dblclick", event => {
        event.preventDefault();
        event.stopPropagation();

        openDesktopImageShortcut(
          child,
          {
            refreshFolders: refreshAllOpenFolderWindows
          }
        );
      });
    }

    entry.addEventListener("contextmenu", event => {
      event.preventDefault();
      event.stopPropagation();

      window.openFolderItemContextMenu?.(
        event.clientX,
        event.clientY,
        item.id,
        child.id
      );
    });

    grid.appendChild(entry);

  });

  body.appendChild(grid);

  bindFolderMarqueeSelection(
    body,
    item.id
  );

  applyFolderSelection(
    body,
    item.id
  );

  if(body.dataset.clearSelectionBound !== "true"){
    body.dataset.clearSelectionBound =
      "true";

    body.addEventListener(
      "click",
      event => {
        if(body.dataset.suppressNextFolderClick === "true"){
          body.dataset.suppressNextFolderClick =
            "false";

          return;
        }

        if(event.target.closest(".desktop-folder-item")){
          return;
        }

        getFolderSelection(item.id).clear();

        applyFolderSelection(
          body,
          item.id
        );
      }
    );
  }

  bindFolderFileDrop(
    body,
    item.id
  );

}

export function refreshOpenFolderWindow(
  folderId,
  deps
){

  const dialog =
    document.querySelector(
      `.dialog-window[data-dialog-id="folder-window-${cssEscape(folderId)}"]`
    );

  if(
    !dialog ||
    getComputedStyle(dialog).display === "none"
  ){
    return;
  }

  const folder =
    findDesktopItemById(
      getDesktopItems(),
      folderId
    );

  const body =
    dialog.querySelector(
      ".desktop-folder-body"
    );

  if(folder && body){
    renderFolderContents(
      body,
      folder,
      deps
    );
  }

}

export function getDesktopItemIconSource(
  item,
  deps
){

  const {
    folderIconSrc,
    imageIconSrc,
    workstationIconSrc
  } = deps;

  if(item.type === "folder"){
    return folderIconSrc;
  }

  if(
    item.type === "gallery-image-shortcut" ||
    item.type === "image"
  ){
    return imageIconSrc;
  }

  if(
    item.type === "workstation-save" &&
    item.previewImage
  ){
    return item.previewImage;
  }

  return workstationIconSrc;

}
