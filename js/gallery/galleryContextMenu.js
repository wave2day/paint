let activeMenu = null;
let activeSubmenus = [];

let activeWallpaper = null;

let activeAssetId = null;

import {
  requestWallpaper
}
from
"../wallpaper/wallpaper.js";

import {
  addGalleryFavorite,
  deleteGalleryAsset,
  markGalleryRecent,
  moveGalleryAssetToDesktop,
  openGalleryPreview,
  openGalleryAssetInWorkstation,
  openGalleryAssetInPixel,
  renameGalleryAsset,
  showGalleryProperties
}
from
"./gallery.js?v=gallery-properties-blue-force-1";

export function bindGalleryContextMenu(){

  const gallery =
    document.querySelector(
      ".gallery-grid"
    );



  if(!gallery){
    return;
  }



  gallery.addEventListener(
    "contextmenu",
    event => {

      const thumb =
        event.target.closest(
          ".gallery-thumb"
        );



      if(!thumb){
        return;
      }



      event.preventDefault();



      activeWallpaper =
        thumb.dataset.wallpaper;

      activeAssetId =
        thumb.dataset.assetId;



      closeMenu();



      const {
        menu,
        submenus
      } =
        createGalleryContextMenu();



      menu.style.setProperty(
        "--x",
        `${event.clientX}px`
      );



      menu.style.setProperty(
        "--y",
        `${event.clientY}px`
      );



      menu.style.position =
        "fixed";



      menu.style.zIndex =
        999999;



      menu.classList.add(
        "is-open"
      );



      document.body.appendChild(
        menu
      );

      submenus.forEach(submenu => {

        submenu.style.position =
          "fixed";

        submenu.style.zIndex =
          999999;

        document.body.appendChild(
          submenu
        );

      });



      activeMenu =
        menu;

      activeSubmenus =
        submenus;

    }
  );



  document.addEventListener(
    "pointerdown",
    event => {

      if(
        event.target.closest(
          ".context-menu,.context-submenu"
        )
      ){
        return;
      }



      closeMenu();

    }
  );



  document.addEventListener(
    "keydown",
    event => {

      if(
        event.key !== "Escape"
      ){
        return;
      }



      closeMenu();

    }
  );

}



/* =========================
   CREATE MENU
========================= */

function createGalleryContextMenu(){

  const menu =
    document.createElement(
      "div"
    );



  menu.className =
    "context-menu";



  menu.innerHTML = `
  
    <div class="menu-contact"></div>

    <div class="menu-glint"></div>



    <button class="context-item rename-gallery-asset">
      Rename
    </button>

    <button
      class="context-item has-submenu"
      data-submenu="galleryMoveToSubmenu"
    >
      <span>Move To</span>
      <span class="context-arrow">›</span>
    </button>

    <button class="context-item add-favorite">
      Add To Favorites
    </button>



    <div class="context-separator"></div>



    <button class="context-item open-preview">
      Open Preview
    </button>

    <button
      class="context-item set-wallpaper"
    >
      Set As Wallpaper
    </button>



    <div class="context-separator"></div>



    <button class="context-item delete-gallery-asset">
      Delete
    </button>

    <button class="context-item show-properties">
      Properties
    </button>

  `;



  const moveToSubmenu =
    createSubmenu(
      "galleryMoveToSubmenu",
      `
        <button class="context-item move-to-workstation">
          Workstation
        </button>
        <button class="context-item move-to-pixel">
          Pixel
        </button>
        <button class="context-item move-to-desktop">
          Desktop
        </button>
      `
    );

  bindMenuActions(
    menu,
    [moveToSubmenu]
  );

  return {
    menu,
    submenus:[
      moveToSubmenu
    ]
  };

}

function createSubmenu(
  id,
  content
){

  const submenu =
    document.createElement(
      "div"
    );

  submenu.className =
    "context-submenu";

  submenu.id =
    id;

  submenu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>
    ${content}
  `;

  return submenu;

}



/* =========================
   ACTIONS
========================= */

function bindMenuActions(
  menu,
  submenus = []
){

  const setWallpaper =
    menu.querySelector(
      ".set-wallpaper"
    );

  const addFavorite =
    menu.querySelector(
      ".add-favorite"
    );

  const renameAsset =
    menu.querySelector(
      ".rename-gallery-asset"
    );

  const openPreview =
    menu.querySelector(
      ".open-preview"
    );

  const deleteAsset =
    menu.querySelector(
      ".delete-gallery-asset"
    );

  const showProperties =
    menu.querySelector(
      ".show-properties"
    );

  const moveToWorkstation =
    [
      menu,
      ...submenus
    ]
      .map(root => root.querySelector(
        ".move-to-workstation"
      ))
      .find(Boolean);

  const moveToPixel =
    [
      menu,
      ...submenus
    ]
      .map(root => root.querySelector(
        ".move-to-pixel"
      ))
      .find(Boolean);

  const moveToDesktop =
    [
      menu,
      ...submenus
    ]
      .map(root => root.querySelector(
        ".move-to-desktop"
      ))
      .find(Boolean);

  if(addFavorite){

    addFavorite.addEventListener(
      "pointerdown",
      () => {

        if(activeAssetId){
          addGalleryFavorite(
            activeAssetId
          );
        }

        closeMenu();

      }
    );

  }

  if(renameAsset){
    renameAsset.addEventListener(
      "pointerdown",
      () => {
        renameGalleryAsset(activeAssetId);
        closeMenu();
      }
    );
  }

  if(openPreview){
    openPreview.addEventListener(
      "pointerdown",
      () => {
        openGalleryPreview(activeAssetId);
        closeMenu();
      }
    );
  }

  if(moveToWorkstation){
    moveToWorkstation.addEventListener(
      "pointerdown",
      () => {
        openGalleryAssetInWorkstation(
          activeAssetId
        );
        closeMenu();
      }
    );
  }

  if(moveToPixel){
    moveToPixel.addEventListener(
      "pointerdown",
      () => {
        openGalleryAssetInPixel(
          activeAssetId
        );
        closeMenu();
      }
    );
  }

  if(moveToDesktop){
    moveToDesktop.addEventListener(
      "pointerdown",
      () => {
        moveGalleryAssetToDesktop(
          activeAssetId
        );
        closeMenu();
      }
    );
  }

  if(deleteAsset){
    deleteAsset.addEventListener(
      "pointerdown",
      () => {
        deleteGalleryAsset(activeAssetId);
        closeMenu();
      }
    );
  }

  if(showProperties){
    showProperties.addEventListener(
      "pointerdown",
      () => {
        showGalleryProperties(activeAssetId);
        closeMenu();
      }
    );
  }



  if(setWallpaper){

    setWallpaper.addEventListener(
      "pointerdown",
      event => {

        applyWallpaper(
          event.clientX,
          event.clientY
        );

        closeMenu();

      }
    );

  }

}



/* =========================
   APPLY WALLPAPER
========================= */

function applyWallpaper(
  x,
  y
){

  if(!activeWallpaper){
    return;
  }

  requestWallpaper(
    activeWallpaper,
    x,
    y
  );

  markGalleryRecent(
    activeAssetId
  );

}



/* =========================
   CLOSE
========================= */

function closeMenu(){

  if(activeMenu){
    activeMenu.remove();
    activeMenu = null;
  }

  activeSubmenus.forEach(submenu => {
    submenu.remove();
  });

  activeSubmenus = [];

}
