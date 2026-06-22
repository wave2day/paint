import {
  alignDesktopIcons,
  alignSelectedDesktopIcons,
  arrangeDesktopIcons,
  arrangeSelectedDesktopIcons,
  refreshDesktop,
  repairDesktopIcons
}
from
"./desktopIcons.js?v=desktop-selection-menu-1";

import {
  getDesktopItems
}
from
"./desktopMemory.js";

export function bindDesktopContextMenu(){

  const desktop =
    document.querySelector(".desktop");

  if(!desktop){
    return;
  }

  window.desktopIconActions = {
    ...(window.desktopIconActions || {}),
    arrange: arrangeDesktopIcons,
    arrangeSelected: arrangeSelectedDesktopIcons,
    align: alignDesktopIcons,
    alignSelected: alignSelectedDesktopIcons,
    refresh: refreshDesktop,
    repair: repairDesktopIcons
  };

  let activeMenu = null;
  let activeSubmenus = [];

  window.closeDesktopContextMenu =
  closeMenu;

  desktop.addEventListener(
    "contextmenu",
    event => {

      const selectedIcon =
        event.target.closest(
          ".desktop-icon.is-selected"
        );

      if(
        !selectedIcon ||
        getSelectedDesktopIconCount() <= 1
      ){
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      openSelectionMenu(
        event.clientX,
        event.clientY
      );

    },
    true
  );

  desktop.addEventListener("contextmenu", e => {

    if(e.target.closest(".dialog-window")){
      e.preventDefault();
      closeMenu();
      return;
    }

    if(
      e.target.closest(
        ".window,.desktop-icon"
      )
    ){
      return;
    }

    e.preventDefault();

    closeMenu();

    const desktopRect =
      desktop.getBoundingClientRect();

    window.desktopMenuPosition = {
      left: e.clientX - desktopRect.left,
      top: e.clientY - desktopRect.top
    };

   const { menu, submenus } =
  createDesktopMenu();

menu.style.setProperty("--x", `${e.clientX}px`);
menu.style.setProperty("--y", `${e.clientY}px`);

menu.classList.add("is-open");

menu.style.position = "fixed";
menu.style.zIndex = 999999;

document.body.appendChild(menu);

submenus.forEach(submenu => {

  submenu.style.position = "fixed";
  submenu.style.zIndex = 999999;

  document.body.appendChild(submenu);

});

    activeMenu = menu;
    activeSubmenus = submenus;

  });

  window.openDesktopItemContextMenu =
  (x,y,itemId) => {

    closeMenu();

    const menu =
      createDesktopItemMenu(itemId);

    menu.style.setProperty("--x", `${x}px`);
    menu.style.setProperty("--y", `${y}px`);

    menu.classList.add("is-open");

    menu.style.position = "fixed";
    menu.style.zIndex = 999999;

    document.body.appendChild(menu);

    activeMenu = menu;
    activeSubmenus = [];

  };

  window.openDesktopSelectionContextMenu =
  openSelectionMenu;

  window.openFolderItemContextMenu =
  (x,y,folderId,itemId) => {

    closeMenu();

    const menu =
      createFolderItemMenu(
        folderId,
        itemId
      );

    menu.style.setProperty("--x", `${x}px`);
    menu.style.setProperty("--y", `${y}px`);

    menu.classList.add("is-open");

    menu.style.position = "fixed";
    menu.style.zIndex = 999999;

    document.body.appendChild(menu);

    activeMenu = menu;
    activeSubmenus = [];

  };

  document.addEventListener("pointerdown", e => {

    if(e.target.closest(".context-menu,.context-submenu")){
      return;
    }

    closeMenu();

  });

  document.addEventListener("keydown", e => {

    if(e.key !== "Escape"){
      return;
    }

    closeMenu();

  });

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

  function openSelectionMenu(x,y){

    closeMenu();

    const { menu, submenus } =
      createDesktopSelectionMenu();

    menu.style.setProperty("--x", `${x}px`);
    menu.style.setProperty("--y", `${y}px`);

    menu.classList.add("is-open");

    menu.style.position = "fixed";
    menu.style.zIndex = 999999;

    document.body.appendChild(menu);

    submenus.forEach(submenu => {
      submenu.style.position = "fixed";
      submenu.style.zIndex = 999999;
      document.body.appendChild(submenu);
    });

    activeMenu = menu;
    activeSubmenus = submenus;

  }

}

function createDesktopItemMenu(itemId){

  const menu =
    document.createElement("div");

  menu.className =
    "context-menu";

  menu.id =
    "desktopItemMenu";

  const item =
    findMenuItemById(
      getDesktopItems(),
      itemId
    );

  const exportAction =
    item?.type === "folder"
      ? `
    <button class="context-item" data-action="export-desktop-folder" data-item-id="${itemId}">
      <span>Export Folder</span>
    </button>
      `
      : "";

  menu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    ${exportAction}

    <button class="context-item" data-action="delete-desktop-item" data-item-id="${itemId}">
      <span>Delete</span>
    </button>
  `;

  return menu;

}

function createFolderItemMenu(
  folderId,
  itemId
){

  const menu =
    document.createElement("div");

  menu.className =
    "context-menu";

  menu.id =
    "folderItemMenu";

  const folder =
    findMenuItemById(
      getDesktopItems(),
      folderId
    );

  const item =
    findMenuItemById(
      Array.isArray(folder?.items)
        ? folder.items
        : [],
      itemId
    );

  const exportAction =
    item?.type === "folder"
      ? `
    <button
      class="context-item"
      data-action="export-folder-item"
      data-folder-id="${folderId}"
      data-item-id="${itemId}"
    >
      <span>Export Folder</span>
    </button>
      `
      : "";

  menu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    ${exportAction}

    <button
      class="context-item"
      data-action="delete-folder-item"
      data-folder-id="${folderId}"
      data-item-id="${itemId}"
    >
      <span>Delete</span>
    </button>
  `;

  return menu;

}

function createDesktopMenu(){

  const menu = document.createElement("div");

  menu.className = "context-menu";
  menu.id = "desktopMenu";

  menu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    <button class="context-item has-submenu" data-submenu="arrangeSubmenu">
      <span class="context-icon context-columns"></span>
      <span>Arrange Icons</span>
      <span class="context-arrow">›</span>
    </button>

    <button class="context-item has-submenu" data-submenu="alignSubmenu">
      <span class="context-icon context-grid"></span>
      <span>Align to Grid</span>
      <span class="context-arrow">›</span>
    </button>

    <button class="context-item" data-action="refresh-desktop">
      <span class="context-icon context-refresh"></span>
      <span>Refresh</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item has-submenu" data-submenu="wallpaperSubmenu">
      <span class="context-icon context-image"></span>
      <span>Change Wallpaper</span>
      <span class="context-arrow">›</span>
    </button>

    <button class="context-item">
      <span class="context-icon context-settings"></span>
      <span>Workspace Settings</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item has-submenu" data-submenu="newSubmenu">
      <span class="context-icon context-plus"></span>
      <span>New</span>
      <span class="context-arrow">›</span>
    </button>
  `;

  const arrangeSubmenu =
    createSubmenu("arrangeSubmenu", `
      <button class="context-item" data-action="arrange-icons-name">Name</button>
      <button class="context-item" data-action="arrange-icons-type">Type</button>
      <button class="context-item" data-action="arrange-icons-name">Date</button>
    `);

  const alignSubmenu =
    createSubmenu("alignSubmenu", `
      <button class="context-item checked" data-action="align-icons-8">
        <span class="context-icon context-grid"></span>
        <span>8px Grid</span>
      </button>
      <button class="context-item" data-action="align-icons-16">
        <span class="context-icon context-grid"></span>
        <span>16px Grid</span>
      </button>
      <button class="context-item" data-action="align-icons-32">
        <span class="context-icon context-grid"></span>
        <span>32px Grid</span>
      </button>
    `);

const wallpaperSubmenu =
  createSubmenu("wallpaperSubmenu", `
    <button
      class="context-item"
      data-action="open-gallery"
    >
      <span class="context-icon context-image"></span>
      <span>Gallery...</span>
    </button>

    <button class="context-item">
      <span class="context-icon context-color"></span>
      <span>Solid Color...</span>
    </button>

    <button class="context-item">
      <span class="context-icon context-play"></span>
      <span>Slideshow...</span>
    </button>
  `);

  const newSubmenu =
    createSubmenu("newSubmenu", `
      <button class="context-item" data-action="new-folder">
        <span class="context-icon context-folder"></span>
        <span>Folder</span>
      </button>
      <button class="context-item">
        <span>Workspace</span>
      </button>
    `);

  return {
    menu,
    submenus:[
      arrangeSubmenu,
      alignSubmenu,
      wallpaperSubmenu,
      newSubmenu
    ]
  };

}

function createDesktopSelectionMenu(){

  const menu =
    document.createElement("div");

  menu.className =
    "context-menu";

  menu.id =
    "desktopSelectionMenu";

  menu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    <button class="context-item has-submenu" data-submenu="arrangeSelectedSubmenu">
      <span class="context-icon context-columns"></span>
      <span>Arrange Icons</span>
      <span class="context-arrow">›</span>
    </button>

    <button class="context-item has-submenu" data-submenu="alignSelectedSubmenu">
      <span class="context-icon context-grid"></span>
      <span>Align to Grid</span>
      <span class="context-arrow">›</span>
    </button>
  `;

  const arrangeSubmenu =
    createSubmenu("arrangeSelectedSubmenu", `
      <button class="context-item" data-action="arrange-selected-icons-name">Name</button>
      <button class="context-item" data-action="arrange-selected-icons-type">Type</button>
      <button class="context-item" data-action="arrange-selected-icons-name">Date</button>
    `);

  const alignSubmenu =
    createSubmenu("alignSelectedSubmenu", `
      <button class="context-item checked" data-action="align-selected-icons-8">
        <span class="context-icon context-grid"></span>
        <span>8px Grid</span>
      </button>
      <button class="context-item" data-action="align-selected-icons-16">
        <span class="context-icon context-grid"></span>
        <span>16px Grid</span>
      </button>
      <button class="context-item" data-action="align-selected-icons-32">
        <span class="context-icon context-grid"></span>
        <span>32px Grid</span>
      </button>
    `);

  return {
    menu,
    submenus:[
      arrangeSubmenu,
      alignSubmenu
    ]
  };

}

function getSelectedDesktopIconCount(){

  return document
    .querySelectorAll(
      ".desktop-icon.is-selected"
    )
    .length;

}

function createSubmenu(id, content){

  const submenu =
    document.createElement("div");

  submenu.className = "context-submenu";
  submenu.id = id;

  submenu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>
    ${content}
  `;

  return submenu;

}


function findMenuItemById(items,id){

  for(const item of items || []){
    if(item.id === id){
      return item;
    }

    if(Array.isArray(item.items)){
      const child =
        findMenuItemById(
          item.items,
          id
        );

      if(child){
        return child;
      }
    }
  }

  return null;

}
