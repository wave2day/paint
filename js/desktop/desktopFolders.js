import {
  addDesktopItem,
  getDesktopItems
}
from
"./desktopMemory.js";

import {
  resolveIconPosition
}
from
"./desktopGrid.js?v=desktop-window-shortcuts-1";

import {
  createDesktopItemId,
  normalizeFolderName,
  uniqueDesktopItemName
}
from
"./desktopItemUtils.js?v=desktop-window-shortcuts-1";

export function createDesktopFolder(
  name,
  preferredPosition,
  deps
){

  const {
    getDesktopIcons,
    openDesktopFolder,
    renderDesktopFolderIcon
  } = deps;

  const desktop =
    document.querySelector(".desktop");

  if(!desktop){
    return null;
  }

  const items =
    getDesktopItems();

  const folderName =
    uniqueDesktopItemName(
      normalizeFolderName(name),
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
      preferredPosition,
      occupied
    );

  const item =
    {
      id: createDesktopItemId("folder"),
      type: "folder",
      name: folderName,
      left: position.left + "px",
      top: position.top + "px",
      items: [],
      createdAt: Date.now()
    };

  addDesktopItem(item);

  renderDesktopFolderIcon(
    desktop,
    item
  );

  openDesktopFolder(item);

  return item;

}

export function openNewFolderDialog(deps){

  const {
    createDesktopFolder
  } = deps;

  const desktop =
    document.querySelector(".desktop");

  const position =
    window.desktopMenuPosition || null;

  const content =
    document.createElement("form");

  content.className =
    "desktop-folder-dialog";

  content.innerHTML = `
    <label>
      <span>Folder name</span>
      <input
        type="text"
        name="folderName"
        value="New Folder"
        autocomplete="off"
      >
    </label>
    <div class="desktop-folder-dialog-actions">
      <button type="button" data-folder-cancel>Cancel</button>
      <button type="submit">Create</button>
    </div>
  `;

  const dialog =
    window.openDialogWindow?.({
      id: "new-folder-dialog",
      title: "New Folder",
      content,
      left: Math.min(
        position?.left || 180,
        Math.max(24,(desktop?.clientWidth || 420) - 280)
      ),
      top: Math.min(
        position?.top || 120,
        Math.max(24,(desktop?.clientHeight || 320) - 170)
      )
    });

  const input =
    content.querySelector("input");

  input?.focus();
  input?.select();

  content.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      createDesktopFolder(
        input?.value,
        position
      );

      window.closeDialogWindow?.(
        "new-folder-dialog"
      );

    }
  );

  content
    .querySelector("[data-folder-cancel]")
    ?.addEventListener(
      "click",
      () => {
        window.closeDialogWindow?.(
          "new-folder-dialog"
        );
      }
    );

  return dialog || null;

}
