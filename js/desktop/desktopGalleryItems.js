import {
  addDesktopItem,
  getDesktopItems
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
  openDesktopImageShortcut
}
from
"./desktopPreview.js?v=desktop-window-shortcuts-1";

import {
  createDesktopItemId,
  createShortcutBadge,
  cssEscape,
  normalizeDesktopItemName,
  setIconLabel,
  uniqueDesktopItemName
}
from
"./desktopItemUtils.js?v=desktop-window-shortcuts-1";

export function createDesktopGalleryImageShortcut(
  asset,
  preferredPosition,
  deps
){

  const {
    getDesktopIcons,
    renderDesktopItemIcon
  } = deps;

  const desktop =
    document.querySelector(".desktop");

  if(!desktop || !asset?.src){
    return null;
  }

  const items =
    getDesktopItems();

  const itemName =
    uniqueDesktopItemName(
      normalizeDesktopItemName(
        asset.name || "Gallery Image"
      ),
      items
    );

  const occupied =
    getDesktopIcons()
      .map(icon => ({
        left: icon.offsetLeft,
        top: icon.offsetTop
      }));

  const position =
    resolveIconPosition(
      desktop,
      preferredPosition || window.desktopMenuPosition,
      occupied
    );

  const item =
    createGalleryImageShortcutItem(
      asset,
      itemName,
      {
        left: position.left + "px",
        top: position.top + "px"
      }
    );

  addDesktopItem(item);

  renderDesktopItemIcon(
    desktop,
    item
  );

  return item;

}

export function renderDesktopGalleryImageShortcutIcon(
  desktop,
  item,
  deps
){

  const {
    bindDesktopItemDrag,
    imageIconSrc,
    refreshFolders
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
    "desktop-icon desktop-gallery-image-shortcut";

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

  const preview =
    document.createElement("img");

  preview.className =
    "desktop-main-icon desktop-gallery-image-icon";

  preview.src =
    imageIconSrc;

  preview.alt =
    "";

  preview.draggable =
    false;

  image.appendChild(preview);
  image.appendChild(
    createShortcutBadge()
  );

  const label =
    document.createElement("span");

  setIconLabel(
    label,
    item.name,
    "Image"
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
      openDesktopImageShortcut(
        item,
        {
          refreshFolders
        }
      );
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

export function createGalleryImageShortcutItem(
  asset,
  name,
  position = {}
){

  return {
    id: createDesktopItemId("gallery-image"),
    type: "gallery-image-shortcut",
    name:
      name ||
      normalizeDesktopItemName(
        asset.name || "Gallery Image"
      ),
    left: position.left || null,
    top: position.top || null,
    galleryAssetId: asset.id || "",
    galleryLibrary: asset.library || "",
    imageType: asset.type || "Image",
    src: asset.src,
    createdAt: Date.now()
  };

}
