import {
  deleteDesktopItem,
  getDesktopItems
}
from
"./desktopMemory.js";

import {
  deleteDesktopAsset
}
from
"./desktopAssetStore.js?v=desktop-start-minimized-1";

import {
  findDesktopItemById
}
from
"./desktopFolderUtils.js?v=desktop-window-shortcuts-1";

import {
  cssEscape
}
from
"./desktopItemUtils.js?v=desktop-window-shortcuts-1";

export function deleteDesktopIconItem(id){

  if(!id){
    return;
  }

  const item =
    findDesktopItemById(
      getDesktopItems(),
      id
    );

  window.closeDialogWindow?.(
    `folder-window-${id}`
  );

  closeFolderWindowsForItem(item);

  deleteAssetsForItem(item);

  const icon =
    document.querySelector(
      `.desktop-icon[data-item-id="${cssEscape(id)}"]`
    );

  deleteDesktopItem(id);

  icon?.remove();

}

export function deleteAssetsForItem(item){

  if(!item){
    return;
  }

  const save =
    item.save || item;

  if(save.sourceAssetId){
    deleteDesktopAsset(
      save.sourceAssetId
    );
  }

  if(Array.isArray(item.items)){
    item.items.forEach(child => {
      deleteAssetsForItem(child);
    });
  }

}

export function closeFolderWindowsForItem(item){
  if(!item){
    return;
  }

  window.closeDialogWindow?.(
    `folder-window-${item.id}`
  );

  if(!Array.isArray(item.items)){
    return;
  }

  item.items.forEach(child => {
    closeFolderWindowsForItem(child);
  });
}
