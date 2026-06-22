import {
  getDesktopItems,
  updateDesktopItem
}
from
"./desktopMemory.js";

import {
  GRID,
  resolveIconPosition
}
from
"./desktopGrid.js?v=desktop-window-shortcuts-1";

import {
  cssEscape,
  setIconLabel
}
from
"./desktopItemUtils.js?v=desktop-window-shortcuts-1";

export function renderDesktopItems(
  desktop,
  usedSlots,
  deps
){

  getDesktopItems()
    .forEach(item => {

      if(
        document.querySelector(
          `.desktop-icon[data-item-id="${cssEscape(item.id)}"]`
        )
      ){
        return;
      }

      const position =
        resolveIconPosition(
          desktop,
          item,
          usedSlots
        );

      const updatedItem =
        {
          ...item,
          left: position.left + "px",
          top: position.top + "px"
        };

      if(
        updatedItem.left !== item.left ||
        updatedItem.top !== item.top
      ){
        updateDesktopItem(
          item.id,
          {
            left: updatedItem.left,
            top: updatedItem.top
          }
        );
      }

      renderDesktopItemIcon(
        desktop,
        updatedItem,
        deps
      );

      usedSlots.push(position);

    });

}

export function renderDesktopItemIcon(
  desktop,
  item,
  deps
){

  const {
    renderDesktopGalleryImageShortcutIcon,
    renderDesktopFolderIcon,
    renderDesktopWorkstationSaveIcon
  } = deps;

  if(item.type === "folder"){
    return renderDesktopFolderIcon(
      desktop,
      item,
      deps
    );
  }

  if(item.type === "workstation-save"){
    return renderDesktopWorkstationSaveIcon(
      desktop,
      item
    );
  }

  if(item.type === "gallery-image-shortcut"){
    return renderDesktopGalleryImageShortcutIcon(
      desktop,
      item
    );
  }

  return null;

}

export function renderDesktopFolderIcon(
  desktop,
  item,
  deps
){

  const {
    bindDesktopItemDrag,
    folderIconSrc,
    openDesktopFolder
  } = deps;

  const existing =
    document.querySelector(
      `.desktop-icon[data-item-id="${cssEscape(item.id)}"]`
    );

  if(existing){
    return existing;
  }

  const icon =
    document.createElement("div");

  icon.className =
    "desktop-icon";

  icon.dataset.itemId =
    item.id;

  icon.dataset.itemType =
    item.type;

  icon.style.left =
    item.left || GRID.left + "px";

  icon.style.top =
    item.top || GRID.top + "px";

  icon.style.display =
    "flex";

  const image =
    document.createElement("div");

  image.className =
    "desktop-icon-image";

  const folder =
    document.createElement("img");

  folder.className =
    "desktop-folder-icon";

  folder.src =
    folderIconSrc;

  folder.alt =
    "";

  folder.draggable =
    false;

  image.appendChild(folder);

  const label =
    document.createElement("span");

  setIconLabel(
    label,
    item.name,
    "Folder"
  );

  icon.appendChild(image);
  icon.appendChild(label);

  desktop.appendChild(icon);

  bindDesktopItemDrag(
    desktop,
    icon,
    item
  );

  icon.addEventListener(
    "dblclick",
    event => {
      event.preventDefault();
      event.stopPropagation();
      const currentItem =
        getDesktopItems()
          .find(entry => entry.id === item.id)
        || item;

      openDesktopFolder(currentItem);
    }
  );

  icon.addEventListener(
    "contextmenu",
    event => {
      event.preventDefault();
      event.stopPropagation();
      window.openDesktopItemContextMenu?.(
        event.clientX,
        event.clientY,
        item.id
      );
    }
  );

  return icon;

}
