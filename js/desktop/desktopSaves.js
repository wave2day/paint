import {
  addDesktopItem,
  getDesktopItems
}
from
"./desktopMemory.js";

import {
  loadDesktopAsset,
  saveDesktopAsset
}
from
"./desktopAssetStore.js?v=desktop-start-minimized-1";

import {
  GRID,
  nextFreeSlotFromRight,
  resolveIconPosition
}
from
"./desktopGrid.js?v=desktop-window-shortcuts-1";

export async function createDesktopWorkstationSave(
  save,
  preferredPosition,
  deps
){

  const desktop =
    document.querySelector(".desktop");

  if(!desktop || !save){
    return null;
  }

  const items =
    getDesktopItems();

  const itemName =
    deps.uniqueDesktopItemName(
      deps.normalizeDesktopItemName(
        save.name || "Workstation Save"
      ),
      items
    );

  const occupied =
    deps.getDesktopIcons()
      .map(icon => ({
        left: icon.offsetLeft,
        top: icon.offsetTop
      }));

  const position =
    resolveIconPosition(
      desktop,
      preferredPosition ||
      nextFreeSlotFromRight(
        desktop,
        occupied
      ),
      occupied
    );

  const sourceAssetId =
    save.sourceImage
      ? deps.createDesktopItemId("workstation-source")
      : save.sourceAssetId || null;

  if(save.sourceImage && sourceAssetId){
    await saveDesktopAsset(
      sourceAssetId,
      save.sourceImage
    );
  }

  const storedSave =
    {
      ...save,
      name: itemName,
      sourceImage: "",
      sourceAssetId
    };

  const item =
    {
      id: deps.createDesktopItemId("workstation-save"),
      type: "workstation-save",
      name: itemName,
      left: position.left + "px",
      top: position.top + "px",
      previewImage: save.previewImage || "",
      save: storedSave,
      createdAt: Date.now()
    };

  addDesktopItem(item);

  deps.renderDesktopItemIcon(
    desktop,
    item
  );

  return item;

}

export function renderDesktopWorkstationSaveIcon(
  desktop,
  item,
  deps
){

  const existing =
    document.querySelector(
      `.desktop-icon[data-item-id="${deps.cssEscape(item.id)}"]`
    );

  if(existing){
    return existing;
  }

  const icon =
    document.createElement("div");

  icon.className =
    "desktop-icon desktop-save-item";

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
    "desktop-main-icon desktop-save-icon";

  preview.src =
    item.previewImage || deps.appIconSrc;

  preview.alt =
    "";

  preview.draggable =
    false;

  image.appendChild(preview);

  const label =
    document.createElement("span");

  deps.setIconLabel(
    label,
    item.name,
    "Save"
  );

  icon.appendChild(image);
  icon.appendChild(label);

  desktop.appendChild(icon);

  deps.bindDesktopItemDrag(
    desktop,
    icon,
    item
  );

  icon.addEventListener(
    "dblclick",
    event => {
      event.preventDefault();
      event.stopPropagation();
      openWorkstationSaveItem(item);
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

export async function openWorkstationSaveItem(item){

  const currentItem =
    findDesktopItemById(
      getDesktopItems(),
      item.id
    ) || item;

  const save =
    {
      ...(
        currentItem.save || currentItem
      )
    };

  if(
    !save.sourceImage &&
    save.sourceAssetId
  ){
    save.sourceImage =
      await loadDesktopAsset(
        save.sourceAssetId
      );
  }

  window.openWorkstationSave?.(
    save
  );

  window.restoreWindow?.(
    "workstation"
  );

}

function findDesktopItemById(
  items,
  id
){

  for(const item of items){
    if(item.id === id){
      return item;
    }

    const children =
      Array.isArray(item.items)
        ? item.items
        : [];

    const match =
      findDesktopItemById(
        children,
        id
      );

    if(match){
      return match;
    }
  }

  return null;

}
