let runtimeBound = false;



export function bindMenuRuntime(root = document){

  if(runtimeBound){
    return;
  }

  runtimeBound = true;



  root.addEventListener(
    "pointermove",
    event => {

      const menu =
        event.target.closest(
          ".context-menu,.context-submenu"
        );



      if(!menu){
        return;
      }



      ensureChrome(menu);



      const item =
        event.target.closest(
          ".context-item"
        );



      if(
        !item ||
        !menu.contains(item)
      ){
        return;
      }



      clearActive(menu);



      item.classList.add(
        "active"
      );


      if(
        !item.classList.contains(
          "has-submenu"
        )
      ){

        const insideSubmenu =
          event.target.closest(
            ".context-submenu"
          );



        if(!insideSubmenu){

          closeSubmenus();

        }



        return;

      }



      openSubmenu(item);

    }
  );


root.addEventListener(
  "pointerdown",
  event => {

    const item =
      event.target.closest(
        ".context-item"
      );

    if(!item){
      return;
    }

    const action =
      item.dataset.action;

    if(!action){
      return;
    }

    runMenuAction(
      action,
      item
    );

    closeSubmenus();

    clearAllActive();

    if(window.closeDesktopContextMenu){

      window.closeDesktopContextMenu();

    }

  }
);



  root.addEventListener(
    "keydown",
    event => {

      if(
        event.key !== "Escape"
      ){
        return;
      }



      closeSubmenus();

      clearAllActive();

    }
  );

}



/* =========================
   ENSURE CHROME
========================= */

function ensureChrome(menu){

  if(
    !menu.querySelector(
      ":scope > .menu-glint"
    )
  ){

    const glint =
      document.createElement(
        "span"
      );



    glint.className =
      "menu-glint";



    menu.appendChild(glint);

  }



  if(
    !menu.querySelector(
      ":scope > .menu-contact"
    )
  ){

    const contact =
      document.createElement(
        "span"
      );



    contact.className =
      "menu-contact";



    menu.appendChild(contact);

  }

}



/* =========================
   OPEN SUBMENU
========================= */

function openSubmenu(trigger){

  const submenuId =
    trigger.dataset.submenu;



  if(!submenuId){
    return;
  }



  const submenu =
    document.getElementById(
      submenuId
    );



  if(!submenu){
    return;
  }



  ensureChrome(submenu);



  const parentMenu =
    trigger.closest(
      ".context-menu,.context-submenu"
    );



  closeSiblingSubmenus(
    submenu,
    parentMenu
  );



  const rect =
    trigger.getBoundingClientRect();



  submenu.style.setProperty(
    "--x",
    `${rect.right - 10}px`
  );



  submenu.style.setProperty(
    "--y",
    `${rect.top - 2}px`
  );



  submenu.classList.add(
    "is-open"
  );

}



/* =========================
   CLOSE SUBMENUS
========================= */

function closeSubmenus(){

  document
    .querySelectorAll(
      ".context-submenu"
    )
    .forEach(submenu => {

      submenu.classList.remove(
        "is-open"
      );

    });

}



/* =========================
   CLOSE SIBLINGS
========================= */

function closeSiblingSubmenus(
  current,
  parentMenu
){

  document
    .querySelectorAll(
      ".context-submenu.is-open"
    )
    .forEach(submenu => {

      if(submenu === current){
        return;
      }



      if(submenu === parentMenu){
        return;
      }



      submenu.classList.remove(
        "is-open"
      );

    });

}



/* =========================
   CLEAR ACTIVE
========================= */

function clearActive(menu){

  menu
    .querySelectorAll(
      ".context-item"
    )
    .forEach(item => {

      item.classList.remove(
        "active"
      );

    });

}



/* =========================
   CLEAR ALL ACTIVE
========================= */

function clearAllActive(){

  document
    .querySelectorAll(
      ".context-item.active"
    )
    .forEach(item => {

      item.classList.remove(
        "active"
      );

    });

}

function runMenuAction(action,item){

  switch(action){

    case "arrange-icons-name":

      window.desktopIconActions?.arrange?.(
        "name"
      );

      break;

    case "arrange-icons-type":

      window.desktopIconActions?.arrange?.(
        "type"
      );

      break;

    case "arrange-selected-icons-name":

      window.desktopIconActions?.arrangeSelected?.(
        "name"
      );

      break;

    case "arrange-selected-icons-type":

      window.desktopIconActions?.arrangeSelected?.(
        "type"
      );

      break;

    case "align-icons-8":

      window.desktopIconActions?.align?.(
        8
      );

      break;

    case "align-icons-16":

      window.desktopIconActions?.align?.(
        16
      );

      break;

    case "align-icons-32":

      window.desktopIconActions?.align?.(
        32
      );

      break;

    case "align-selected-icons-8":

      window.desktopIconActions?.alignSelected?.(
        8
      );

      break;

    case "align-selected-icons-16":

      window.desktopIconActions?.alignSelected?.(
        16
      );

      break;

    case "align-selected-icons-32":

      window.desktopIconActions?.alignSelected?.(
        32
      );

      break;

    case "refresh-desktop":

      window.desktopIconActions?.refresh?.();

      break;

    case "open-gallery":

      openGallery();

      break;

    case "new-folder":

      window.desktopIconActions?.newFolder?.();

      break;

    case "delete-desktop-item":

      window.desktopIconActions?.deleteItem?.(
        item?.dataset?.itemId
      );

      break;

    case "export-desktop-folder":

      window.desktopIconActions?.exportFolder?.(
        item?.dataset?.itemId
      );

      break;

    case "delete-folder-item":

      window.desktopIconActions?.deleteFolderItem?.(
        item?.dataset?.folderId,
        item?.dataset?.itemId
      );

      break;

    case "export-folder-item":

      window.desktopIconActions?.exportFolder?.(
        item?.dataset?.itemId
      );

      break;

  }

}


function openGallery(){

  window.restoreWindow?.(
    "gallery"
  );

}
