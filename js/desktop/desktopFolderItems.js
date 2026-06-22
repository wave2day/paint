import {
  getDesktopItems,
  setDesktopItems
}
from
"./desktopMemory.js";

import {
  createGalleryImageShortcutItem
}
from
"./desktopGalleryItems.js?v=desktop-window-shortcuts-1";

import {
  findDesktopItemById,
  uniqueFolderChildName,
  updateDesktopItemTree
}
from
"./desktopFolderUtils.js?v=desktop-window-shortcuts-1";

import {
  createDesktopItemId,
  cssEscape,
  normalizeDesktopItemName
}
from
"./desktopItemUtils.js?v=desktop-window-shortcuts-1";

export function addFilesToDesktopFolder(
  folderId,
  files,
  deps
){
  const {
    refreshOpenFolderWindow
  } = deps;

  const items =
    getDesktopItems();

  const folder =
    findDesktopItemById(
      items,
      folderId
    );

  if(
    !folder ||
    folder.type !== "folder"
  ){
    return;
  }

  const nextChildren =
    [
      ...(
        Array.isArray(folder.items)
          ? folder.items
          : []
      )
    ];

  files.forEach(file => {
    nextChildren.push({
      id: createDesktopItemId("file"),
      type: file.type?.startsWith("image/")
        ? "image"
        : "file",
      name: uniqueFolderChildName(
        file.name || "File",
        nextChildren
      ),
      size: file.size || 0,
      mime: file.type || "",
      createdAt: Date.now()
    });
  });

  setDesktopItems(
    updateDesktopItemTree(
      items,
      folderId,
      {
        items: nextChildren
      }
    )
  );

  refreshOpenFolderWindow(folderId);
}

export function addGalleryAssetToDesktopFolder(
  folderId,
  asset,
  deps
){

  const {
    refreshOpenFolderWindow
  } = deps;

  const items =
    getDesktopItems();

  const folder =
    findDesktopItemById(
      items,
      folderId
    );

  if(
    !folder ||
    folder.type !== "folder" ||
    !asset?.src
  ){
    return;
  }

  const nextChildren =
    [
      ...(
        Array.isArray(folder.items)
          ? folder.items
          : []
      )
    ];

  const child =
    createGalleryImageShortcutItem(
      asset,
      uniqueFolderChildName(
        normalizeDesktopItemName(
          asset.name || "Gallery Image"
        ),
        nextChildren
      )
    );

  nextChildren.push(child);

  setDesktopItems(
    updateDesktopItemTree(
      items,
      folderId,
      {
        items: nextChildren
      }
    )
  );

  refreshOpenFolderWindow(folderId);

}

export function deleteFolderChildItem(
  folderId,
  childId,
  deps
){
  const {
    closeFolderWindowsForItem,
    deleteAssetsForItem,
    refreshOpenFolderWindow
  } = deps;

  if(!folderId || !childId){
    return;
  }

  const items =
    getDesktopItems();

  const folder =
    findDesktopItemById(
      items,
      folderId
    );

  if(
    !folder ||
    folder.type !== "folder"
  ){
    return;
  }

  const children =
    Array.isArray(folder.items)
      ? folder.items
      : [];

  const child =
    children.find(item => item.id === childId);

  if(!child){
    return;
  }

  closeFolderWindowsForItem(child);

  deleteAssetsForItem(child);

  setDesktopItems(
    updateDesktopItemTree(
      items,
      folderId,
      {
        items: children.filter(item => {
          return item.id !== childId;
        })
      }
    )
  );

  refreshOpenFolderWindow(folderId);
}

export function moveFolderItemToDesktop(
  folderId,
  childId,
  position,
  deps
){

  return moveFolderItemsToDesktop(
    folderId,
    [childId],
    position,
    deps
  );

}

export function moveFolderItemsToDesktop(
  folderId,
  childIds,
  position,
  deps
){

  const {
    refreshOpenFolderWindow,
    renderDesktopItemIcon
  } = deps;

  const movingIds =
    Array.isArray(childIds)
      ? childIds.filter(Boolean)
      : [];

  if(!folderId || !movingIds.length){
    return false;
  }

  const desktop =
    document.querySelector(
      ".desktop"
    );

  if(!desktop){
    return false;
  }

  const items =
    getDesktopItems();

  const folder =
    findDesktopItemById(
      items,
      folderId
    );

  if(
    !folder ||
    folder.type !== "folder"
  ){
    return false;
  }

  const children =
    Array.isArray(folder.items)
      ? folder.items
      : [];

  const movingSet =
    new Set(movingIds);

  const movingItems =
    children.filter(item => movingSet.has(item.id));

  if(!movingItems.length){
    return false;
  }

  const desktopItems =
    movingItems.map((child,index) => ({
      ...child,
      left:`${position.left + index * 18}px`,
      top:`${position.top + index * 18}px`
    }));

  const nextItems =
    updateDesktopItemTree(
      items,
      folderId,
      {
        items: children.filter(item => {
          return !movingSet.has(item.id);
        })
      }
    );

  setDesktopItems([
    ...nextItems,
    ...desktopItems
  ]);

  desktopItems.forEach(desktopItem => {
    renderDesktopItemIcon(
      desktop,
      desktopItem
    );
  });

  refreshOpenFolderWindow(folderId);

  return true;

}

export function moveFolderItemIntoFolder(
  sourceFolderId,
  childId,
  targetFolderId,
  deps
){

  return moveFolderItemsIntoFolder(
    sourceFolderId,
    [childId],
    targetFolderId,
    deps
  );

}

export function moveFolderItemsIntoFolder(
  sourceFolderId,
  childIds,
  targetFolderId,
  deps
){

  const {
    closeFolderWindowsForItem,
    refreshOpenFolderWindow
  } = deps;

  if(
    !sourceFolderId ||
    !targetFolderId ||
    sourceFolderId === targetFolderId
  ){
    return false;
  }

  const movingIds =
    Array.isArray(childIds)
      ? childIds.filter(Boolean)
      : [];

  if(!movingIds.length){
    return false;
  }

  const items =
    getDesktopItems();

  const sourceFolder =
    findDesktopItemById(
      items,
      sourceFolderId
    );

  const targetFolder =
    findDesktopItemById(
      items,
      targetFolderId
    );

  if(
    !sourceFolder ||
    !targetFolder ||
    sourceFolder.type !== "folder" ||
    targetFolder.type !== "folder"
  ){
    return false;
  }

  const sourceChildren =
    Array.isArray(sourceFolder.items)
      ? sourceFolder.items
      : [];

  const requestedIds =
    new Set(movingIds);

  const movingItems =
    sourceChildren.filter(item => {
      if(!requestedIds.has(item.id)){
        return false;
      }

      if(item.id === targetFolder.id){
        return false;
      }

      return !findDesktopItemById(
        Array.isArray(item.items)
          ? item.items
          : [],
        targetFolder.id
      );
    });

  if(!movingItems.length){
    return false;
  }

  const movingSet =
    new Set(
      movingItems.map(item => item.id)
    );

  const withoutMoving =
    updateDesktopItemTree(
      items,
      sourceFolder.id,
      {
        items: sourceChildren.filter(item => {
          return !movingSet.has(item.id);
        })
      }
    );

  const refreshedTarget =
    findDesktopItemById(
      withoutMoving,
      targetFolder.id
    );

  const targetChildren =
    Array.isArray(refreshedTarget?.items)
      ? refreshedTarget.items
      : [];

  const movedItems =
    movingItems.reduce(
      (acc,item) => {
        const movedItem =
          {
            ...item,
            left:null,
            top:null,
            name: uniqueFolderChildName(
              item.name || "Item",
              [
                ...targetChildren,
                ...acc
              ]
            )
          };

        acc.push(movedItem);

        return acc;
      },
      []
    );

  setDesktopItems(
    updateDesktopItemTree(
      withoutMoving,
      targetFolder.id,
      {
        items:[
          ...targetChildren,
          ...movedItems
        ]
      }
    )
  );

  movingItems
    .filter(item => item.type === "folder")
    .forEach(item => {
      closeFolderWindowsForItem(item);
    });

  refreshOpenFolderWindow(sourceFolder.id);
  refreshOpenFolderWindow(targetFolder.id);

  return true;

}

export function getFolderDropTargetId(
  draggedIcon,
  sourceItemId,
  x,
  y
){

  const ignoredIcons =
    [
      draggedIcon,
      ...document.querySelectorAll(
        ".desktop-icon.is-bundle-dragging"
      )
    ].filter(Boolean);

  const previousPointerEvents =
    ignoredIcons.map(icon => ({
      icon,
      pointerEvents:icon.style.pointerEvents
    }));

  ignoredIcons.forEach(icon => {
    icon.style.pointerEvents =
      "none";
  });

  const target =
    document.elementFromPoint(x,y);

  previousPointerEvents.forEach(entry => {
    entry.icon.style.pointerEvents =
      entry.pointerEvents;
  });

  const folderIcon =
    target?.closest?.(
      '.desktop-icon[data-item-type="folder"]'
    );

  const iconFolderId =
    folderIcon?.dataset?.itemId;

  if(
    iconFolderId &&
    iconFolderId !== sourceItemId
  ){
    return iconFolderId;
  }

  const folderWindow =
    target?.closest?.(
      ".desktop-folder-window"
    );

  const windowFolderId =
    folderWindow?.dataset?.folderId;

  if(
    windowFolderId &&
    windowFolderId !== sourceItemId
  ){
    return windowFolderId;
  }

  return null;

}

export function moveDesktopItemIntoFolder(
  itemId,
  folderId,
  deps
){

  const {
    refreshOpenFolderWindow
  } = deps;

  const items =
    getDesktopItems();

  const moving =
    items.find(item => item.id === itemId);

  const targetFolder =
    findDesktopItemById(
      items,
      folderId
    );

  if(
    !moving ||
    !targetFolder ||
    targetFolder.type !== "folder" ||
    findDesktopItemById(
      Array.isArray(moving.items)
        ? moving.items
        : [],
      folderId
    ) ||
    moving.id === targetFolder.id
  ){
    return false;
  }

  const movedItem =
    {
      ...moving,
      left:null,
      top:null
    };

  const nextItems =
    updateDesktopItemTree(
      items.filter(item => item.id !== moving.id),
      targetFolder.id,
      {
        items:[
          ...(
            Array.isArray(targetFolder.items)
              ? targetFolder.items
              : []
          ),
          movedItem
        ]
      }
    );

  setDesktopItems(nextItems);

  document
    .querySelector(
      `.desktop-icon[data-item-id="${cssEscape(itemId)}"]`
    )
    ?.remove();

  window.closeDialogWindow?.(
    `folder-window-${itemId}`
  );

  refreshOpenFolderWindow(folderId);

  return true;

}
