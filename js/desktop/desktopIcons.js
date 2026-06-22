import {
  getDesktopItems,
  setIconMemory,
  updateDesktopItem
}
from
"./desktopMemory.js";

import {
  exportDesktopFolder
}
from
"./desktopFolderExport.js?v=desktop-window-shortcuts-1";

import {
  createDesktopWorkstationSave as createWorkstationSaveItem,
  openWorkstationSaveItem,
  renderDesktopWorkstationSaveIcon as renderWorkstationSaveIcon
}
from
"./desktopSaves.js?v=desktop-window-shortcuts-1";

import {
  createDesktopGalleryImageShortcut as createGalleryShortcutItem,
  renderDesktopGalleryImageShortcutIcon as renderGalleryShortcutIcon
}
from
"./desktopGalleryItems.js?v=desktop-window-shortcuts-1";

import {
  createDesktopItemId,
  cssEscape,
  normalizeDesktopItemName,
  setIconLabel,
  uniqueDesktopItemName
}
from
"./desktopItemUtils.js?v=desktop-window-shortcuts-1";

import {
  bindDesktopItemDrag as bindDesktopItemDragCore,
  bindDesktopMarqueeSelection,
  bindFolderFileDrop as bindFolderFileDropCore,
  bindFolderItemDrag as bindFolderItemDragCore,
  bindGalleryAssetDesktopDrop as bindGalleryAssetDesktopDropCore,
  getSelectedDesktopIcons
}
from
"./desktopDragDrop.js?v=desktop-selection-menu-1";

import {
  nextFreeSlot,
  resolveIconPosition,
  setIconPosition,
  snap
}
from
"./desktopGrid.js?v=desktop-selection-menu-1";

import {
  createDesktopFolder as createFolderItem,
  openNewFolderDialog as openNewFolderDialogWindow
}
from
"./desktopFolders.js?v=desktop-window-shortcuts-1";

import {
  openDesktopFolder as openFolderWindow,
  refreshOpenFolderWindow as refreshFolderWindow
}
from
"./desktopFolderWindows.js?v=folder-marquee-select-fix-1";

import {
  addFilesToDesktopFolder as addFilesToFolder,
  addGalleryAssetToDesktopFolder as addGalleryAssetToFolder,
  deleteFolderChildItem as deleteFolderChild,
  getFolderDropTargetId,
  moveDesktopItemIntoFolder as moveDesktopItemToFolder,
  moveFolderItemsIntoFolder as moveFolderItemsToFolder,
  moveFolderItemsToDesktop as moveFolderItemsOut,
  moveFolderItemIntoFolder as moveFolderItemToFolder,
  moveFolderItemToDesktop as moveFolderItemOut
}
from
"./desktopFolderItems.js?v=desktop-select-workstation-color-1";

import {
  closeFolderWindowsForItem as closeFolderWindowsForItemCore,
  deleteAssetsForItem as deleteAssetsForItemCore,
  deleteDesktopIconItem as deleteDesktopIconItemCore
}
from
"./desktopItemLifecycle.js?v=desktop-window-shortcuts-1";

import {
  renderDesktopFolderIcon as renderFolderIconCore,
  renderDesktopItemIcon as renderItemIconCore,
  renderDesktopItems as renderItemsCore
}
from
"./desktopIconRenderer.js?v=desktop-window-shortcuts-1";

import {
  alignDesktopIcons as alignIconsCore,
  arrangeDesktopIcons as arrangeIconsCore,
  repairDesktopIcons as repairIconsCore
}
from
"./desktopActions.js?v=desktop-window-shortcuts-1";

import {
  bindDesktopWindowShortcuts
}
from
"./desktopWindowShortcuts.js?v=desktop-selection-menu-1";

const FOLDER_ICON_SRC =
  "./js/icons/folder.svg";

const APP_ICON_SRC =
  "./js/icons/appicon.svg";

const IMAGE_ICON_SRC =
  "./js/icons/image.svg";

export function bindDesktopIcons() {

  const desktop =
    document.querySelector(
      ".desktop"
    );

  if (!desktop) return;

  window.desktopIconActions = {
    arrange: arrangeDesktopIcons,
    arrangeSelected: arrangeSelectedDesktopIcons,
    align: alignDesktopIcons,
    alignSelected: alignSelectedDesktopIcons,
    refresh: refreshDesktop,
    repair: repairDesktopIcons,
    newFolder: openNewFolderDialog,
    deleteItem: deleteDesktopIconItemCore,
    deleteFolderItem: deleteFolderChildItem,
    exportFolder: exportDesktopFolder
  };

  if(window.desktopSaveItemsBound !== true){
    window.desktopSaveItemsBound =
      true;

    window.addEventListener(
      "desktop:add-workstation-save",
      event => {
        createDesktopWorkstationSave(
          event.detail
        );
      }
    );
  }

  if(window.desktopGalleryImageShortcutsBound !== true){
    window.desktopGalleryImageShortcutsBound =
      true;

    window.addEventListener(
      "desktop:add-gallery-image-shortcut",
      event => {
        createDesktopGalleryImageShortcut(
          event.detail
        );
      }
    );
  }

  bindGalleryAssetDesktopDrop(
    desktop
  );

  bindDesktopMarqueeSelection(
    desktop
  );


  const usedSlots =
    [];

  bindDesktopWindowShortcuts(
    desktop,
    usedSlots
  );

  renderDesktopItems(
    desktop,
    usedSlots
  );

}



export function createDesktopFolder(
  name,
  preferredPosition
){

  return createFolderItem(
    name,
    preferredPosition,
    {
      getDesktopIcons,
      openDesktopFolder,
      renderDesktopFolderIcon
    }
  );

}

export async function createDesktopWorkstationSave(
  save,
  preferredPosition
){

  return createWorkstationSaveItem(
    save,
    preferredPosition,
    getDesktopSaveDeps()
  );

}


export function createDesktopGalleryImageShortcut(
  asset,
  preferredPosition
){

  return createGalleryShortcutItem(
    asset,
    preferredPosition,
    getDesktopGalleryDeps()
  );

}



function openNewFolderDialog(){

  return openNewFolderDialogWindow(
    {
      createDesktopFolder
    }
  );

}



export function arrangeDesktopIcons(
  mode = "name"
){

  return arrangeIconsCore(mode);

}



export function alignDesktopIcons(
  size = 32
){

  return alignIconsCore(size);

}



export function arrangeSelectedDesktopIcons(
  mode = "name"
){

  const desktop =
    document.querySelector(
      ".desktop"
    );

  if(!desktop){
    return;
  }

  const selected =
    getSelectedDesktopIcons();

  if(selected.length <= 1){
    return;
  }

  const selectedSet =
    new Set(selected);

  const occupied =
    getDesktopIcons()
      .filter(icon => !selectedSet.has(icon))
      .map(getIconSlot)
      .filter(Boolean);

  const sorted =
    [...selected].sort((a,b) => {
      if(mode === "type"){
        return getIconType(a)
          .localeCompare(getIconType(b));
      }

      return getIconLabel(a)
        .localeCompare(getIconLabel(b));
    });

  sorted.forEach(icon => {
    const position =
      nextFreeSlot(
        desktop,
        occupied
      );

    setIconPosition(
      icon,
      position
    );

    occupied.push(position);
  });

}



export function alignSelectedDesktopIcons(
  size = 32
){

  const desktop =
    document.querySelector(
      ".desktop"
    );

  if(!desktop){
    return;
  }

  const selected =
    getSelectedDesktopIcons();

  if(selected.length <= 1){
    return;
  }

  const selectedSet =
    new Set(selected);

  const occupied =
    getDesktopIcons()
      .filter(icon => !selectedSet.has(icon))
      .map(getIconSlot)
      .filter(Boolean);

  selected.forEach(icon => {
    const current =
      {
        left: snap(
          icon.offsetLeft,
          size
        ),
        top: snap(
          icon.offsetTop,
          size
        )
      };

    const safe =
      resolveIconPosition(
        desktop,
        current,
        occupied
      );

    setIconPosition(
      icon,
      safe
    );

    occupied.push(safe);
  });

}



export function repairDesktopIcons(){

  repairIconsCore();

  refreshAllOpenFolderWindows();

}



export function refreshDesktop(){

  const desktop =
    document.querySelector(
      ".desktop"
    );

  if(!desktop){
    return;
  }

  syncDesktopIconPositions();

  document
    .querySelectorAll(
      ".desktop-icon.is-selected"
    )
    .forEach(icon => {
      icon.classList.remove(
        "is-selected"
      );
    });

  const usedSlots =
    getDesktopIcons()
      .map(getIconSlot)
      .filter(Boolean);

  renderDesktopItems(
    desktop,
    usedSlots
  );

  refreshAllOpenFolderWindows();

  window.dispatchEvent(
    new Event("resize")
  );

}



function getDesktopIcons(){

  return Array.from(
    document.querySelectorAll(
      ".desktop-icon"
    )
  );

}

function getDesktopRendererDeps(){

  return {
    bindDesktopItemDrag,
    folderIconSrc: FOLDER_ICON_SRC,
    openDesktopFolder,
    renderDesktopFolderIcon,
    renderDesktopGalleryImageShortcutIcon,
    renderDesktopWorkstationSaveIcon
  };

}



function renderDesktopItems(
  desktop,
  usedSlots
){

  return renderItemsCore(
    desktop,
    usedSlots,
    getDesktopRendererDeps()
  );

}

function renderDesktopItemIcon(
  desktop,
  item
){

  return renderItemIconCore(
    desktop,
    item,
    getDesktopRendererDeps()
  );

}



function renderDesktopFolderIcon(
  desktop,
  item
){

  return renderFolderIconCore(
    desktop,
    item,
    getDesktopRendererDeps()
  );

}

function getDesktopSaveDeps(){

  return {
    appIconSrc: APP_ICON_SRC,
    bindDesktopItemDrag,
    createDesktopItemId,
    cssEscape,
    getDesktopIcons,
    normalizeDesktopItemName,
    renderDesktopItemIcon,
    setIconLabel,
    uniqueDesktopItemName
  };

}


function renderDesktopWorkstationSaveIcon(
  desktop,
  item
){

  return renderWorkstationSaveIcon(
    desktop,
    item,
    getDesktopSaveDeps()
  );

}

function getDesktopGalleryDeps(){

  return {
    bindDesktopItemDrag,
    getDesktopIcons,
    imageIconSrc: IMAGE_ICON_SRC,
    refreshFolders: refreshAllOpenFolderWindows,
    renderDesktopItemIcon
  };

}


function renderDesktopGalleryImageShortcutIcon(
  desktop,
  item
){

  return renderGalleryShortcutIcon(
    desktop,
    item,
    getDesktopGalleryDeps()
  );

}



function bindDesktopItemDrag(
  desktop,
  icon,
  item
){

  return bindDesktopItemDragCore(
    desktop,
    icon,
    item,
    {
      getFolderDropTargetId,
      iconCollides,
      moveDesktopItemIntoFolder: (itemId, folderId) => {
        return moveDesktopItemToFolder(
          itemId,
          folderId,
          getDesktopFolderItemDeps()
        );
      },
      moveDesktopItemsIntoFolder: (itemIds, folderId) => {
        return moveDesktopItemsToFolder(
          itemIds,
          folderId
        );
      }
    }
  );

}

function refreshAllOpenFolderWindows(){
  document
    .querySelectorAll(
      '.dialog-window[data-dialog-id^="folder-window-"]'
    )
    .forEach(dialog => {
      const folderId =
        dialog.dataset.folderId;

      if(folderId){
        refreshOpenFolderWindow(folderId);
      }
    });
}

function syncDesktopIconPositions(){

  getDesktopIcons()
    .forEach(icon => {

      if(icon.dataset.windowId){
        setIconMemory(
          icon.dataset.windowId,
          {
            left: icon.style.left,
            top: icon.style.top,
            visible:
              icon.style.display !== "none"
          }
        );

        return;
      }

      if(icon.dataset.itemId){
        updateDesktopItem(
          icon.dataset.itemId,
          {
            left: icon.style.left,
            top: icon.style.top
          }
        );
      }

    });

}

function getIconSlot(icon){

  const left =
    parseFloat(
      icon.style.left
    );

  const top =
    parseFloat(
      icon.style.top
    );

  if(
    !Number.isFinite(left) ||
    !Number.isFinite(top)
  ){
    return null;
  }

  return {
    left,
    top
  };

}

function getIconLabel(icon){

  return icon
    .querySelector("span")
    ?.textContent
    ?.trim()
    ?.toLowerCase()
    || "";

}

function getIconType(icon){

  if(icon.dataset.itemType){
    return icon.dataset.itemType;
  }

  if(icon.dataset.windowId){
    return "window";
  }

  const src =
    icon
      .querySelector("img")
      ?.getAttribute("src")
      || "";

  return src
    .split(".")
    .pop()
    .toLowerCase();

}

function iconCollides(icon){

  const iconRect =
    icon.getBoundingClientRect();

  let collided = false;

  document
    .querySelectorAll(".window")
    .forEach(otherWin => {

      if(
        otherWin.style.display === "none"
      ){
        return;
      }

      const rect =
        otherWin.getBoundingClientRect();

      const overlap =
        !(
          iconRect.right < rect.left ||
          iconRect.left > rect.right ||
          iconRect.bottom < rect.top ||
          iconRect.top > rect.bottom
        );

      if(overlap){
        collided = true;
      }

    });

  getDesktopIcons()
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


function getDesktopFolderWindowDeps(){

  return {
    bindFolderFileDrop,
    bindFolderItemDrag: bindFolderItemDragCore,
    folderIconSrc: FOLDER_ICON_SRC,
    imageIconSrc: IMAGE_ICON_SRC,
    openWorkstationSaveItem,
    refreshAllOpenFolderWindows,
    workstationIconSrc: APP_ICON_SRC
  };

}

function getDesktopFolderItemDeps(){

  return {
    closeFolderWindowsForItem: closeFolderWindowsForItemCore,
    deleteAssetsForItem: deleteAssetsForItemCore,
    refreshOpenFolderWindow,
    renderDesktopItemIcon
  };

}


function openDesktopFolder(item){

  return openFolderWindow(
    item,
    getDesktopFolderWindowDeps()
  );

}

function bindGalleryAssetDesktopDrop(desktop){

  return bindGalleryAssetDesktopDropCore(
    desktop,
    {
      createDesktopGalleryImageShortcut,
      moveFolderItemsToDesktop,
      moveFolderItemToDesktop
    }
  );

}

function bindFolderFileDrop(
  body,
  folderId
){

  return bindFolderFileDropCore(
    body,
    folderId,
    {
      addFilesToDesktopFolder,
      addGalleryAssetToDesktopFolder,
      moveFolderItemsIntoFolder,
      moveFolderItemIntoFolder
    }
  );

}

function addFilesToDesktopFolder(
  folderId,
  files
){

  return addFilesToFolder(
    folderId,
    files,
    getDesktopFolderItemDeps()
  );

}

function addGalleryAssetToDesktopFolder(
  folderId,
  asset
){

  return addGalleryAssetToFolder(
    folderId,
    asset,
    getDesktopFolderItemDeps()
  );

}

function deleteFolderChildItem(
  folderId,
  childId
){

  return deleteFolderChild(
    folderId,
    childId,
    getDesktopFolderItemDeps()
  );
}

function moveFolderItemToDesktop(
  folderId,
  childId,
  position
){

  return moveFolderItemOut(
    folderId,
    childId,
    position,
    getDesktopFolderItemDeps()
  );

}

function moveFolderItemsToDesktop(
  folderId,
  childIds,
  position
){

  return moveFolderItemsOut(
    folderId,
    childIds,
    position,
    getDesktopFolderItemDeps()
  );

}

function moveFolderItemIntoFolder(
  sourceFolderId,
  childId,
  targetFolderId
){

  return moveFolderItemToFolder(
    sourceFolderId,
    childId,
    targetFolderId,
    getDesktopFolderItemDeps()
  );

}

function moveFolderItemsIntoFolder(
  sourceFolderId,
  childIds,
  targetFolderId
){

  return moveFolderItemsToFolder(
    sourceFolderId,
    childIds,
    targetFolderId,
    getDesktopFolderItemDeps()
  );

}

function moveDesktopItemsToFolder(
  itemIds,
  folderId
){

  let moved =
    false;

  itemIds.forEach(itemId => {
    if(
      moveDesktopItemToFolder(
        itemId,
        folderId,
        getDesktopFolderItemDeps()
      )
    ){
      moved =
        true;
    }
  });

  return moved;

}


function refreshOpenFolderWindow(folderId){

  return refreshFolderWindow(
    folderId,
    getDesktopFolderWindowDeps()
  );

}
