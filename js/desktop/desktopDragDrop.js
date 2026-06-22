import {
  updateDesktopItem
}
from
"./desktopMemory.js";

import {
  ICON_SIZE,
  clampToDesktop
}
from
"./desktopGrid.js?v=desktop-window-shortcuts-1";

const GALLERY_ASSET_DRAG_TYPE =
  "application/x-glitch-gallery-asset";

const FOLDER_ITEM_DRAG_TYPE =
  "application/x-glitch-folder-item";

const selectedDesktopIconKeys =
  new Set();

export function getDesktopIconKey(icon){
  if(icon?.dataset?.itemId){
    return icon.dataset.itemId;
  }

  if(icon?.dataset?.windowId){
    return `window:${icon.dataset.windowId}`;
  }

  return "";
}

function getDesktopIconByKey(desktop,key){
  if(!key){
    return null;
  }

  if(key.startsWith("window:")){
    return desktop.querySelector(
      `.desktop-icon[data-window-id="${cssEscape(key.slice(7))}"]`
    );
  }

  return desktop.querySelector(
    `.desktop-icon[data-item-id="${cssEscape(key)}"]`
  );
}

function cssEscape(value){
  if(window.CSS?.escape){
    return window.CSS.escape(value);
  }

  return String(value).replace(
    /["\\]/g,
    "\\$&"
  );
}

export function applyDesktopSelection(desktop){
  desktop
    .querySelectorAll(".desktop-icon")
    .forEach(icon => {
      icon.classList.toggle(
        "is-selected",
        selectedDesktopIconKeys.has(getDesktopIconKey(icon))
      );
    });
}

function clearDesktopSelection(desktop){
  selectedDesktopIconKeys.clear();
  applyDesktopSelection(desktop);
}

function getDesktopVisibleRect(icon){
  const parts =
    [
      icon.querySelector(".desktop-icon-image"),
      icon.querySelector("span")
    ].filter(Boolean);

  if(!parts.length){
    return icon.getBoundingClientRect();
  }

  const rects =
    parts.map(part => part.getBoundingClientRect());

  return {
    left: Math.min(...rects.map(rect => rect.left)),
    top: Math.min(...rects.map(rect => rect.top)),
    right: Math.max(...rects.map(rect => rect.right)),
    bottom: Math.max(...rects.map(rect => rect.bottom))
  };
}

export function hasDesktopBundleSelection(icon){
  return (
    selectedDesktopIconKeys.has(getDesktopIconKey(icon)) &&
    selectedDesktopIconKeys.size > 1
  );
}

export function getSelectedDesktopIcons(
  desktop = document.querySelector(".desktop")
){
  if(!desktop){
    return [];
  }

  return Array
    .from(selectedDesktopIconKeys)
    .map(key => getDesktopIconByKey(desktop,key))
    .filter(icon =>
      icon &&
      icon.style.display !== "none"
    );
}

export function beginDesktopBundleDrag(desktop){
  return Array
    .from(selectedDesktopIconKeys)
    .map(key => {
      const selectedIcon =
        getDesktopIconByKey(desktop,key);

      if(!selectedIcon || selectedIcon.style.display === "none"){
        return null;
      }

      selectedIcon.classList.add(
        "is-bundle-dragging"
      );

      selectedIcon.style.zIndex =
        9999;

      return {
        key,
        itemId:selectedIcon.dataset.itemId || "",
        windowId:selectedIcon.dataset.windowId || "",
        icon:selectedIcon,
        left:selectedIcon.offsetLeft,
        top:selectedIcon.offsetTop
      };
    })
    .filter(Boolean);
}

export function moveDesktopBundleDrag(groupStart,deltaX,deltaY){
  groupStart.forEach(entry => {
    entry.icon.style.left =
      (entry.left + deltaX) + "px";

    entry.icon.style.top =
      (entry.top + deltaY) + "px";
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

export function bindDesktopMarqueeSelection(desktop){
  if(!desktop || desktop.dataset.marqueeBound === "true"){
    return;
  }

  desktop.dataset.marqueeBound =
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

  desktop.addEventListener("pointerdown", event => {
    if(
      event.button !== 0 ||
      event.target.closest(".desktop-icon,.window,.dialog-window,.context-menu")
    ){
      return;
    }

    selecting =
      true;

    moved =
      false;

    startX =
      event.clientX;

    startY =
      event.clientY;

    clearDesktopSelection(desktop);

    marquee =
      document.createElement("div");

    marquee.className =
      "desktop-marquee";

    desktop.appendChild(marquee);

    desktop.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
  });

  desktop.addEventListener("pointermove", event => {
    if(!selecting || !marquee){
      return;
    }

    const desktopRect =
      desktop.getBoundingClientRect();

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
      `${left - desktopRect.left}px`;

    marquee.style.top =
      `${top - desktopRect.top}px`;

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

    selectedDesktopIconKeys.clear();

    desktop
      .querySelectorAll(".desktop-icon")
      .forEach(icon => {
        if(
          icon.style.display !== "none" &&
          rectsOverlap(selectionRect,getDesktopVisibleRect(icon))
        ){
          selectedDesktopIconKeys.add(getDesktopIconKey(icon));
        }
      });

    applyDesktopSelection(desktop);

    event.preventDefault();
  });

  desktop.addEventListener("pointerup", event => {
    if(!selecting){
      return;
    }

    selecting =
      false;

    if(moved){
      desktop.dataset.suppressNextDesktopClick =
        "true";
    }

    marquee?.remove();
    marquee =
      null;

    desktop.releasePointerCapture?.(
      event.pointerId
    );
  });

  desktop.addEventListener("click", event => {
    if(desktop.dataset.suppressNextDesktopClick === "true"){
      desktop.dataset.suppressNextDesktopClick =
        "false";

      return;
    }

    if(event.target.closest(".desktop-icon,.window,.dialog-window")){
      return;
    }

    clearDesktopSelection(desktop);
  });
}

export function bindDesktopItemDrag(
  desktop,
  icon,
  item,
  deps
){

  const {
    getFolderDropTargetId,
    iconCollides,
    moveDesktopItemIntoFolder,
    moveDesktopItemsIntoFolder
  } = deps;

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let startLeft = 0;
  let startTop = 0;
  let groupDrag = false;
  let groupStart = [];

  icon.addEventListener(
    "pointerdown",
    event => {

      dragging = true;

      if(
        hasDesktopBundleSelection(icon)
      ){
        groupDrag =
          true;

        groupStart =
          beginDesktopBundleDrag(desktop);
      }else{
        groupDrag =
          false;

        groupStart =
          [];

        clearDesktopSelection(desktop);

        icon.style.zIndex = 9999;
      }

      startLeft =
        icon.offsetLeft;

      startTop =
        icon.offsetTop;

      offsetX =
        event.clientX
        - icon.offsetLeft;

      offsetY =
        event.clientY
        - icon.offsetTop;

      icon.setPointerCapture?.(
        event.pointerId
      );

      event.preventDefault();

    }
  );

  icon.addEventListener(
    "pointermove",
    event => {

      if(!dragging){
        return;
      }

      if(groupDrag){
        const deltaX =
          event.clientX - offsetX - startLeft;

        const deltaY =
          event.clientY - offsetY - startTop;

        moveDesktopBundleDrag(
          groupStart,
          deltaX,
          deltaY
        );

        return;
      }

      icon.style.left =
        (event.clientX - offsetX) + "px";

      icon.style.top =
        (event.clientY - offsetY) + "px";

    }
  );

  icon.addEventListener(
    "pointerup",
    event => {

      if(!dragging){
        return;
      }

      const targetFolderId =
        getFolderDropTargetId(
          icon,
          item.id,
          event.clientX,
          event.clientY
        );

      const groupFolderItemIds =
        groupStart
          .map(entry => entry.itemId)
          .filter(Boolean);

      if(
        targetFolderId &&
        (
          groupDrag && groupStart.length > 1
            ? (
                groupFolderItemIds.length === groupStart.length &&
                moveDesktopItemsIntoFolder?.(
                  groupFolderItemIds,
                  targetFolderId
                )
              )
            : moveDesktopItemIntoFolder(
                item.id,
                targetFolderId
              )
        )
      ){
        dragging = false;

        cleanupDesktopBundleDrag();

        if(!groupDrag){
          icon.style.zIndex =
            "";
        }

        icon.releasePointerCapture?.(
          event.pointerId
        );

        return;
      }

      dragging = false;

      cleanupDesktopBundleDrag();

      if(!groupDrag){
        icon.style.zIndex =
          "";
      }

      icon.releasePointerCapture?.(
        event.pointerId
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

          if(entry.itemId){
            updateDesktopItem(
              entry.itemId,
              {
                left: entry.icon.style.left,
                top: entry.icon.style.top
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

      updateDesktopItem(
        item.id,
        {
          left: icon.style.left,
          top: icon.style.top
        }
      );

    }
  );

}

export function cleanupDesktopBundleDrag(){
  document
    .querySelectorAll(".desktop-icon.is-bundle-dragging")
    .forEach(icon => {
      icon.classList.remove(
        "is-bundle-dragging"
      );

      icon.style.zIndex =
        "";
    });
}

export function bindFolderItemDrag(
  entry,
  folder,
  child,
  options = {}
){

  entry.addEventListener("dragstart", event => {
    event.stopPropagation();

    const selectedIds =
      typeof options.getSelectedFolderItemIds === "function"
        ? options.getSelectedFolderItemIds(folder.id)
        : [];

    const itemIds =
      selectedIds.includes(child.id)
        ? selectedIds
        : [child.id];

    const folderBody =
      entry.closest(".desktop-folder-body");

    const draggingEntries =
      Array
        .from(
          folderBody?.querySelectorAll(".desktop-folder-item") || []
        )
        .filter(item => itemIds.includes(item.dataset.itemId));

    draggingEntries.forEach(item => {
      item.classList.add(
        "is-bundle-dragging"
      );
    });

    if(event.dataTransfer && itemIds.length > 1){
      const ghost =
        createFolderDragGhost(
          itemIds.length,
          child.name || "Folder Item"
        );

      event.dataTransfer.setDragImage(
        ghost,
        28,
        28
      );

      window.setTimeout(
        () => {
          ghost.remove();
        },
        0
      );
    }

    event.dataTransfer?.setData(
      FOLDER_ITEM_DRAG_TYPE,
      JSON.stringify({
        folderId:folder.id,
        itemId:child.id,
        itemIds
      })
    );

    event.dataTransfer?.setData(
      "text/plain",
      itemIds.length > 1
        ? `${itemIds.length} Folder Items`
        : child.name || "Folder Item"
    );

    if(event.dataTransfer){
      event.dataTransfer.effectAllowed =
        "move";
    }
  });

  entry.addEventListener("dragend", () => {
    document
      .querySelectorAll(".desktop-folder-item.is-bundle-dragging")
      .forEach(item => {
        item.classList.remove(
          "is-bundle-dragging"
        );
      });
  });

}

function createFolderDragGhost(count,label){
  const ghost =
    document.createElement("div");

  ghost.className =
    "desktop-folder-drag-ghost";

  ghost.innerHTML = `
    <div class="desktop-folder-drag-stack"></div>
    <span>${count} items</span>
  `;

  ghost.style.position =
    "fixed";

  ghost.style.left =
    "-9999px";

  ghost.style.top =
    "-9999px";

  ghost.setAttribute(
    "aria-label",
    label
  );

  document.body.appendChild(ghost);

  return ghost;
}

export function bindGalleryAssetDesktopDrop(
  desktop,
  deps
){

  const {
    createDesktopGalleryImageShortcut,
    moveFolderItemsToDesktop,
    moveFolderItemToDesktop
  } = deps;

  if(
    !desktop ||
    desktop.dataset.galleryDropBound === "true"
  ){
    return;
  }

  desktop.dataset.galleryDropBound =
    "true";

  desktop.addEventListener(
    "dragover",
    event => {
      if(
        !hasGalleryAssetDrag(event) &&
        !hasFolderItemDrag(event)
      ){
        return;
      }

      if(event.target.closest(".window,.dialog-window")){
        return;
      }

      event.preventDefault();

      if(event.dataTransfer){
        event.dataTransfer.dropEffect =
          hasFolderItemDrag(event)
            ? "move"
            : "copy";
      }
    }
  );

  desktop.addEventListener(
    "drop",
    event => {
      const asset =
        readGalleryDragAsset(event);

      const folderItem =
        readFolderItemDrag(event);

      if(!asset && !folderItem){
        return;
      }

      if(event.target.closest(".window,.dialog-window")){
        return;
      }

      event.preventDefault();

      if(folderItem){
        const position =
          getPointerDesktopPosition(
            desktop,
            event
          );

        if(
          folderItem.itemIds.length > 1 &&
          typeof moveFolderItemsToDesktop === "function"
        ){
          moveFolderItemsToDesktop(
            folderItem.folderId,
            folderItem.itemIds,
            position
          );
        }else{
          moveFolderItemToDesktop(
            folderItem.folderId,
            folderItem.itemId,
            position
          );
        }

        return;
      }

      createDesktopGalleryImageShortcut(
        asset,
        getPointerDesktopPosition(
          desktop,
          event
        )
      );
    }
  );

}

export function bindFolderFileDrop(
  body,
  folderId,
  deps
){
  const {
    addFilesToDesktopFolder,
    addGalleryAssetToDesktopFolder,
    moveFolderItemsIntoFolder,
    moveFolderItemIntoFolder
  } = deps;

  if(!body || body.dataset.dropBound === "true"){
    return;
  }

  body.dataset.dropBound =
    "true";

  body.addEventListener("dragover", event => {
    const types =
      Array.from(
        event.dataTransfer?.types || []
      );

    if(
      !types.includes("Files") &&
      !hasGalleryAssetDrag(event) &&
      !hasFolderItemDrag(event)
    ){
      return;
    }

    event.preventDefault();

    body.classList.add(
      "is-drop-target"
    );
  });

  body.addEventListener("dragleave", event => {
    if(body.contains(event.relatedTarget)){
      return;
    }

    body.classList.remove(
      "is-drop-target"
    );
  });

  body.addEventListener("drop", event => {
    const galleryAsset =
      readGalleryDragAsset(event);

    const folderItem =
      readFolderItemDrag(event);

    if(galleryAsset){
      event.preventDefault();

      body.classList.remove(
        "is-drop-target"
      );

      addGalleryAssetToDesktopFolder(
        folderId,
        galleryAsset
      );

      return;
    }

    if(folderItem){
      event.preventDefault();

      body.classList.remove(
        "is-drop-target"
      );

      if(
        folderItem.itemIds.length > 1 &&
        typeof moveFolderItemsIntoFolder === "function"
      ){
        moveFolderItemsIntoFolder(
          folderItem.folderId,
          folderItem.itemIds,
          folderId
        );
      }else{
        moveFolderItemIntoFolder?.(
          folderItem.folderId,
          folderItem.itemId,
          folderId
        );
      }

      return;
    }

    const files =
      Array.from(
        event.dataTransfer?.files || []
      );

    if(!files.length){
      return;
    }

    event.preventDefault();

    body.classList.remove(
      "is-drop-target"
    );

    addFilesToDesktopFolder(
      folderId,
      files
    );
  });
}

function hasGalleryAssetDrag(event){

  const types =
    Array.from(
      event.dataTransfer?.types || []
    );

  return types.includes(
    GALLERY_ASSET_DRAG_TYPE
  );

}

function hasFolderItemDrag(event){

  const types =
    Array.from(
      event.dataTransfer?.types || []
    );

  return types.includes(
    FOLDER_ITEM_DRAG_TYPE
  );

}

function readGalleryDragAsset(event){

  const raw =
    event.dataTransfer?.getData(
      GALLERY_ASSET_DRAG_TYPE
    );

  if(!raw){
    return null;
  }

  try{
    const asset =
      JSON.parse(raw);

    if(!asset?.src){
      return null;
    }

    return asset;
  }
  catch(_error){
    return null;
  }

}

function readFolderItemDrag(event){

  const raw =
    event.dataTransfer?.getData(
      FOLDER_ITEM_DRAG_TYPE
    );

  if(!raw){
    return null;
  }

  try{
    const data =
      JSON.parse(raw);

    if(!data?.folderId || !data?.itemId){
      return null;
    }

    const itemIds =
      Array.isArray(data.itemIds)
        ? data.itemIds.filter(Boolean)
        : [data.itemId];

    return {
      folderId:data.folderId,
      itemId:data.itemId,
      itemIds:itemIds.length
        ? itemIds
        : [data.itemId]
    };
  }
  catch(_error){
    return null;
  }

}

function getPointerDesktopPosition(
  desktop,
  event
){

  const rect =
    desktop.getBoundingClientRect();

  return clampToDesktop(
    desktop,
    {
      left:
        event.clientX -
        rect.left -
        Math.round(ICON_SIZE.width / 2),
      top:
        event.clientY -
        rect.top -
        Math.round(ICON_SIZE.height / 2)
    }
  );

}
