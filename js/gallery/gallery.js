import {
  galleryAssets,
  galleryLibraries
}
from
"./data/galleryData.js?v=gallery-properties-blue-force-1";

import {
  clearStoredDeletedAssets,
  readFavorites,
  readRecent,
  readRenames,
  writeDeleted,
  writeFavorites,
  writeRecent,
  writeRenames
}
from
"./core/galleryStore.js?v=gallery-properties-blue-force-1";

import {
  getGalleryAssetById,
  getVisibleAssets
}
from
"./core/gallerySelectors.js?v=gallery-properties-blue-force-1";

import {
  createEmptyState,
  createThumb
}
from
"./render/galleryThumb.js?v=gallery-properties-blue-force-1";

import {
  clearInspector,
  updateInspector
}
from
"./ui/galleryInspector.js?v=gallery-properties-blue-force-1";

import {
  applyGalleryViewState,
  bindGalleryViewControls
}
from
"./ui/galleryViewControls.js?v=gallery-properties-blue-force-1";

import {
  openAssetInPixel,
  openAssetInWorkstation,
  moveAssetToDesktop
}
from
"./actions/galleryAssetActions.js?v=gallery-properties-blue-force-1";

import {
  openGalleryPreviewDialog
}
from
"./dialogs/galleryPreviewDialog.js?v=gallery-properties-blue-force-1";

import {
  openGalleryPropertiesDialog
}
from
"./dialogs/galleryPropertiesDialog.js?v=gallery-properties-blue-force-1";

import {
  openGalleryHelpDialog
}
from
"./dialogs/galleryHelpDialog.js?v=gallery-help-structure-1";

import {
  openGalleryRenameDialog
}
from
"./dialogs/galleryRenameDialog.js?v=gallery-properties-blue-force-1";

import {
  bindGalleryLibraryMenuItems,
  bindGalleryLibraryNodes,
  setupGalleryLibraryOrdering,
  updateActiveLibrary,
  updateGalleryPath
}
from
"./library/galleryLibraryView.js?v=gallery-properties-blue-force-1";

import {
  scanProjectGalleryFolders
}
from
"./io/galleryScan.js?v=gallery-properties-blue-force-1";

import {
  bindGalleryImportedAssetEvents,
  importGalleryImages,
  pickGalleryFolder,
  pickGalleryImages
}
from
"./io/galleryImport.js?v=gallery-properties-blue-force-1";

import {
  requestWallpaper
}
from
"../wallpaper/wallpaper.js";


const state = {
  library:"wallpapers",
  sort:"date",
  search:"",
  view:"grid",
  thumbSize:"large",
  previewPanel:true,
  fullscreen:false
};

let selectedAsset = null;
let pendingSelectedAssetId = null;

let localFavorites =
  readFavorites();

let localRenames =
  readRenames();

let localDeleted =
  new Set();

let localRecent =
  readRecent();



export function initGallery(){

  clearStoredDeletedAssets();
  setupGalleryLibraryOrdering({
    state,
    libraries:galleryLibraries
  });
  bindGalleryLibraryNodes(setGalleryLibrary);
  bindGalleryLibraryMenuItems(setGalleryLibrary);
  bindGalleryControls();
  bindGalleryViewControls({
    state,
    onChange:() => applyGalleryViewState(state)
  });
  bindGalleryMenuActions();
  bindGalleryActions();
  bindFavoriteEvents();
  bindGalleryImportedAssetEvents({
    assets:galleryAssets,
    onImported:id => {
      state.library =
        "glitch";

      pendingSelectedAssetId =
        id;

      renderGallery();
    }
  });
  renderGallery();
  refreshProjectFolderAssets();

}



export function setGalleryLibrary(library){

  if(!galleryLibraries[library]){
    return;
  }

  state.library =
    library;

  renderGallery();

}



function bindGalleryControls(){

  const sort =
    document.querySelector(
      ".gallery-sort select"
    );

  if(sort && sort.dataset.bound !== "1"){
    sort.dataset.bound =
      "1";

    sort.value =
      state.sort;

    sort.addEventListener(
      "change",
      () => {
        state.sort =
          sort.value;

        renderGallery();
      }
    );
  }

  const search =
    document.querySelector(
      ".gallery-search"
    );

  if(search && search.dataset.bound !== "1"){
    search.dataset.bound =
      "1";

    search.addEventListener(
      "input",
      () => {
        state.search =
          search.value.trim().toLowerCase();

        renderGallery();
      }
    );
  }

}

function bindGalleryMenuActions(){

  document
    .querySelectorAll("[data-gallery-action]")
    .forEach(item => {

      if(item.dataset.bound === "1"){
        return;
      }

      item.dataset.bound =
        "1";

      item.addEventListener(
        "click",
        () => {
          runGalleryAction(
            item.dataset.galleryAction
          );
        }
      );

    });

}

function runGalleryAction(action){

  if(action === "about-gallery"){
    openGalleryHelpDialog();
    return;
  }

  if(action === "refresh-project-folders"){
    refreshProjectFolderAssets();
    return;
  }

  if(action === "import-images"){
    importPickedGalleryImages(pickGalleryImages);
    return;
  }

  if(action === "import-folder"){
    importPickedGalleryImages(pickGalleryFolder);
    return;
  }

  if(action === "recent"){
    setGalleryLibrary("recent");
    return;
  }

  if(action === "rename"){
    renameGalleryAsset(
      selectedAsset?.id
    );
    return;
  }

  if(action === "delete"){
    deleteGalleryAsset(
      selectedAsset?.id
    );
    return;
  }

  if(action === "properties"){
    showGalleryProperties(
      selectedAsset?.id
    );
    return;
  }

  if(action === "preview"){
    openGalleryPreview(
      selectedAsset?.id
    );
    return;
  }

  if(action === "open-workstation"){
    openGalleryAssetInWorkstation(
      selectedAsset?.id
    );
    return;
  }

  if(action === "open-pixel"){
    openGalleryAssetInPixel(
      selectedAsset?.id
    );
    return;
  }

  if(action === "move-desktop"){
    moveGalleryAssetToDesktop(
      selectedAsset?.id
    );
  }

}

async function refreshProjectFolderAssets(){

  const added =
    await scanProjectGalleryFolders({
      assets:galleryAssets,
      localDeleted
    });

  if(added > 0){
    renderGallery();
  }

}

async function importPickedGalleryImages(picker){

  const files =
    await picker();

  const targetLibrary =
    galleryLibraries[state.library]?.type === "library"
      ? state.library
      : "archive";

  const added =
    await importGalleryImages({
      files,
      assets:galleryAssets,
      library:targetLibrary
    });

  if(added > 0){
    renderGallery();
  }

}



function bindFavoriteEvents(){

  window.addEventListener(
    "gallery:addFavorite",
    event => {
      const id =
        event.detail && event.detail.id;

      if(!id){
        return;
      }

      addGalleryFavorite(id);
    }
  );

}

function renderGallery(){

  const grid =
    document.querySelector(
      ".gallery-grid"
    );

  const count =
    document.querySelector(
      ".gallery-count"
    );

  if(!grid){
    return;
  }

  updateActiveLibrary(
    state.library
  );
  updateGalleryPath(
    galleryLibraries[state.library].path
  );

  applyGalleryViewState(state);

  const assets =
    getVisibleAssets(
      state,
      {
        localDeleted,
        localFavorites,
        localRecent,
        localRenames
      }
    );

  grid.innerHTML = "";

  if(assets.length === 0){
    selectedAsset =
      null;

    grid.appendChild(
      createEmptyState()
    );

    clearInspector(
      galleryLibraries[state.library].path
    );
  }

  assets.forEach((asset, index) => {
    const thumb =
      createThumb(
      asset,
      {
        escapeHtml,
        onSelect:selectAsset
      }
    );

    grid.appendChild(
      thumb
    );

    if(
      asset.id === pendingSelectedAssetId ||
      (
        !pendingSelectedAssetId &&
        index === 0
      )
    ){
      selectAsset(
        asset,
        thumb
      );
    }
  });

  pendingSelectedAssetId =
    null;

  if(count){
    count.textContent =
      `${assets.length} ${assets.length === 1 ? "item" : "items"}`;
  }

}



function selectAsset(
  asset,
  thumb
){

  selectedAsset =
    asset;

  document
    .querySelectorAll(
      ".gallery-thumb"
    )
    .forEach(item => {
      item.classList.remove(
        "active"
      );
    });

  thumb.classList.add(
    "active"
  );

  updateInspector(
    asset,
    galleryLibraries
  );

}



function addRecentAsset(id){

  if(!id){
    return;
  }

  localRecent =
    [
      id,
      ...localRecent.filter(
        item => item !== id
      )
    ].slice(0, 18);

  writeRecent(localRecent);

}

export function markGalleryRecent(id){

  addRecentAsset(id);

  if(state.library === "recent"){
    renderGallery();
  }

}

export function addGalleryFavorite(id){

  if(!id){
    return;
  }

  localFavorites.add(id);
  writeFavorites(localFavorites);
  renderGallery();

}

export function openGalleryPreview(id){

  const asset =
    getGalleryAssetById(
      id,
      {
        localDeleted,
        localRenames
      }
    );

  if(!asset){
    return;
  }

  addRecentAsset(asset.id);

  openGalleryPreviewDialog({
    asset,
    escapeHtml,
    ensureImageName,
    onRename:applyGalleryAssetRename
  });

  pendingSelectedAssetId =
    asset.id;

  renderGallery();

}


export function openGalleryAssetInWorkstation(id){

  const asset =
    getGalleryAssetById(
      id,
      {
        localDeleted,
        localRenames
      }
    );

  if(!asset?.src){
    return;
  }

  addRecentAsset(
    asset.id
  );

  openAssetInWorkstation(
    asset,
    galleryLibraries[asset.library]?.path ||
      "Gallery"
  );

}


export function openGalleryAssetInPixel(id){

  const asset =
    getGalleryAssetById(
      id,
      {
        localDeleted,
        localRenames
      }
    );

  if(!asset?.src){
    return;
  }

  addRecentAsset(
    asset.id
  );

  openAssetInPixel(
    asset,
    galleryLibraries[asset.library]?.path ||
      "Gallery"
  );

}


export function moveGalleryAssetToDesktop(id){

  const asset =
    getGalleryAssetById(
      id,
      {
        localDeleted,
        localRenames
      }
    );

  if(!asset?.src){
    return;
  }

  addRecentAsset(
    asset.id
  );

  moveAssetToDesktop(
    asset
  );

}


function applyGalleryAssetRename(
  asset,
  nextName,
  dialog,
  dialogId
){

  localRenames[asset.id] =
    nextName;

  asset.name =
    nextName;

  writeRenames(localRenames);

  pendingSelectedAssetId =
    asset.id;

  renderGallery();

  const title =
    dialog?.querySelector(".dialog-title");

  if(title){
    title.textContent =
      nextName;
  }

  const previewName =
    dialog?.querySelector(
      ".gallery-preview-dialog-name"
    );

  if(previewName){
    previewName.textContent =
      nextName;
  }

  if(dialogId){
    dialog.dataset.dialogId =
      dialogId;
  }

}

export function renameGalleryAsset(id){

  const asset =
    getGalleryAssetById(
      id,
      {
        localDeleted,
        localRenames
      }
    );

  if(!asset){
    return;
  }

  openGalleryRenameDialog({
    asset,
    escapeHtml,
    ensureImageName,
    onRename:applyGalleryAssetRename
  });

}


export function deleteGalleryAsset(id){

  const asset =
    getGalleryAssetById(
      id,
      {
        localDeleted,
        localRenames
      }
    );

  if(!asset){
    return;
  }

  localDeleted.add(asset.id);

  localRecent =
    localRecent.filter(
      item => item !== asset.id
    );

  localFavorites.delete(asset.id);

  writeDeleted();
  writeRecent(localRecent);
  writeFavorites(localFavorites);

  if(selectedAsset?.id === asset.id){
    selectedAsset =
      null;
  }

  renderGallery();

}

export function showGalleryProperties(id){

  const asset =
    getGalleryAssetById(
      id,
      {
        localDeleted,
        localRenames
      }
    );

  if(!asset){
    return;
  }

  openGalleryPropertiesDialog({
    asset,
    escapeHtml,
    sourcePath:galleryLibraries[asset.library].path
  });

}




function bindGalleryActions(){

  const wallpaperButton =
    document.querySelector(
      ".gallery-action-wallpaper"
    );

  if(wallpaperButton && wallpaperButton.dataset.bound !== "1"){
    wallpaperButton.dataset.bound =
      "1";

    wallpaperButton.addEventListener(
      "click",
      event => {

        if(!selectedAsset){
          return;
        }

        requestWallpaper(
          selectedAsset.src,
          event.clientX,
          event.clientY
        );

        addRecentAsset(
          selectedAsset.id
        );

      }
    );
  }

  const favoriteButton =
    document.querySelector(
      ".gallery-action-favorite"
    );

  if(favoriteButton && favoriteButton.dataset.bound !== "1"){
    favoriteButton.dataset.bound =
      "1";

    favoriteButton.addEventListener(
      "click",
      () => {
        if(!selectedAsset){
          return;
        }

        addGalleryFavorite(
          selectedAsset.id
        );
      }
    );
  }

  const workstationButton =
    document.querySelector(
      ".gallery-action-workstation"
    );

  if(workstationButton && workstationButton.dataset.bound !== "1"){
    workstationButton.dataset.bound =
      "1";

    workstationButton.addEventListener(
      "click",
      () => {
        openGalleryAssetInWorkstation(
          selectedAsset?.id
        );
      }
    );
  }

}

function ensureImageName(name, previousName){

  if(!name){
    return "";
  }

  if(/\.[a-z0-9]{2,5}$/i.test(name)){
    return name;
  }

  const match =
    previousName.match(
      /(\.[a-z0-9]{2,5})$/i
    );

  return `${name}${match ? match[1] : ".png"}`;

}

function escapeHtml(value){

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

}
