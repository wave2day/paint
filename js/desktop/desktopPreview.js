import {
  getDesktopItems,
  setDesktopItems
}
from
"./desktopMemory.js";

export function openDesktopImageShortcut(
  item,
  { refreshFolders } = {}
){

  if(!item?.src){
    return;
  }

  const content =
    document.createElement("div");

  content.className =
    "desktop-image-preview-dialog";

  const dialogId =
    `desktop-gallery-image-${item.id}`;

  content.innerHTML = `
    <div class="desktop-image-preview-viewport">
      <img src="${escapeAttribute(item.src)}" alt="">
    </div>
    <div class="desktop-image-preview-name">
      ${escapeHtml(item.name || "Image")}
    </div>
  `;

  const dialog =
    window.openDialogWindow?.({
    id:dialogId,
    title:item.name || "Image",
    content,
    left:240,
    top:130,
    width:520,
    height:390,
    resizable:true
  });

  const img =
    content.querySelector("img");

  const viewport =
    content.querySelector(
      ".desktop-image-preview-viewport"
    );

  let previewZoom =
    1;

  let previewPan =
    {
      x:0,
      y:0
    };

  let previewResizeObserver = null;

  const openPreviewMenu =
    event => {
      event.preventDefault();
      event.stopPropagation();

      openDesktopImagePreviewContextMenu({
        event,
        item,
        dialog,
        dialogId,
        content,
        img,
        getZoom:() => previewZoom,
        setZoom:value => {
          previewZoom =
            clampDesktopImagePreviewZoom(
              value
            );

          previewPan =
            clampDesktopImagePreviewPan(
              viewport,
              img,
              previewZoom <= 1
                ? { x:0, y:0 }
                : previewPan,
              previewZoom
            );

          applyDesktopImagePreviewZoom(
            content,
            img,
            previewZoom,
            previewPan
          );
        }
      });
    };

  img?.addEventListener(
    "load",
    () => {
      fitDesktopImagePreviewDialog(
        dialog,
        img
      );

      syncDesktopImagePreviewToDialog(
        dialog,
        img
      );

      applyDesktopImagePreviewZoom(
        content,
        img,
        previewZoom,
        previewPan
      );

      if(dialog && "ResizeObserver" in window){
        previewResizeObserver =
          new ResizeObserver(() => {
            syncDesktopImagePreviewToDialog(
              dialog,
              img
            );

            previewPan =
              clampDesktopImagePreviewPan(
                viewport,
                img,
                previewPan,
                previewZoom
              );

            applyDesktopImagePreviewZoom(
              content,
              img,
              previewZoom,
              previewPan
            );
          });

        previewResizeObserver.observe(dialog);
      }
    },
    {
      once:true
    }
  );

  content.addEventListener(
    "contextmenu",
    openPreviewMenu
  );

  dialog?.addEventListener(
    "contextmenu",
    openPreviewMenu
  );

  bindDesktopImagePreviewPan({
    viewport,
    getZoom:() => previewZoom,
    getPan:() => previewPan,
    setPan:value => {
      previewPan =
        clampDesktopImagePreviewPan(
          viewport,
          img,
          value,
          previewZoom
        );

      applyDesktopImagePreviewZoom(
        content,
        img,
        previewZoom,
        previewPan
      );
    }
  });

}

function fitDesktopImagePreviewDialog(dialog, img){
  if(!dialog || !img?.naturalWidth || !img?.naturalHeight){
    return;
  }

  const maxImageW =
    Math.max(
      180,
      window.innerWidth - 180
    );

  const maxImageH =
    Math.max(
      140,
      window.innerHeight - 190
    );

  const baseRatio =
    Math.min(
      maxImageW / img.naturalWidth,
      maxImageH / img.naturalHeight,
      1
    );

  const imageW =
    Math.max(
      80,
      Math.round(img.naturalWidth * baseRatio)
    );

  const imageH =
    Math.max(
      60,
      Math.round(img.naturalHeight * baseRatio)
    );

  const chromeW =
    42;

  const chromeH =
    104;

  dialog.dataset.aspectLocked =
    "true";

  dialog.dataset.aspectRatio =
    String(img.naturalWidth / img.naturalHeight);

  dialog.dataset.aspectChromeW =
    String(chromeW);

  dialog.dataset.aspectChromeH =
    String(chromeH);

  dialog.dataset.aspectMaxWidth =
    String(Math.max(260, imageW + chromeW));

  dialog.dataset.aspectMaxHeight =
    String(Math.max(190, imageH + chromeH));

  dialog.style.width =
    Math.round(imageW + chromeW) + "px";

  dialog.style.height =
    Math.round(imageH + chromeH) + "px";
}

function syncDesktopImagePreviewToDialog(dialog, img){
  if(!dialog || !img?.naturalWidth || !img?.naturalHeight){
    return;
  }

  const viewport =
    dialog.querySelector(
      ".desktop-image-preview-viewport"
    );

  if(!viewport){
    return;
  }

  const viewportW =
    Math.max(80, viewport.clientWidth);

  const viewportH =
    Math.max(60, viewport.clientHeight);

  const ratio =
    Math.min(
      viewportW / img.naturalWidth,
      viewportH / img.naturalHeight,
      1
    );

  img.style.width =
    Math.round(img.naturalWidth * ratio) + "px";

  img.style.height =
    Math.round(img.naturalHeight * ratio) + "px";
}

function clampDesktopImagePreviewZoom(value){
  return Math.max(
    .25,
    Math.min(4, value)
  );
}

function applyDesktopImagePreviewZoom(
  content,
  img,
  zoom,
  pan = { x:0, y:0 }
){
  if(!content || !img){
    return;
  }

  content.dataset.zoom =
    zoom.toFixed(2);

  img.style.transform =
    `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`;

  content.classList.toggle(
    "is-pannable",
    zoom > 1
  );
}

function clampDesktopImagePreviewPan(
  viewport,
  img,
  pan,
  zoom
){
  if(!viewport || !img || zoom <= 1){
    return {
      x:0,
      y:0
    };
  }

  const maxX =
    Math.max(
      0,
      (img.offsetWidth * zoom - viewport.clientWidth) / 2
    );

  const maxY =
    Math.max(
      0,
      (img.offsetHeight * zoom - viewport.clientHeight) / 2
    );

  return {
    x:Math.max(-maxX, Math.min(maxX, pan.x || 0)),
    y:Math.max(-maxY, Math.min(maxY, pan.y || 0))
  };
}

function bindDesktopImagePreviewPan({
  viewport,
  getZoom,
  getPan,
  setPan
}){
  if(!viewport){
    return;
  }

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startPan = { x:0, y:0 };

  viewport.addEventListener("pointerdown", event => {
    if(event.button !== 0 || getZoom() <= 1){
      return;
    }

    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startPan = getPan();

    viewport.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
    event.stopPropagation();
  });

  viewport.addEventListener("pointermove", event => {
    if(!dragging){
      return;
    }

    setPan({
      x:startPan.x + event.clientX - startX,
      y:startPan.y + event.clientY - startY
    });
  });

  viewport.addEventListener("pointerup", event => {
    dragging = false;
    viewport.releasePointerCapture?.(
      event.pointerId
    );
  });

  viewport.addEventListener("pointercancel", event => {
    dragging = false;
    viewport.releasePointerCapture?.(
      event.pointerId
    );
  });
}

function openDesktopImagePreviewContextMenu({
  event,
  item,
  dialog,
  dialogId,
  content,
  getZoom,
  setZoom,
  refreshFolders
}){
  closeDesktopImagePreviewContextMenu();

  const menu =
    document.createElement("div");

  menu.className =
    "desktop-image-preview-context-menu context-menu";

  menu.classList.add(
    "is-open"
  );

  menu.innerHTML = `
    <button class="context-item" data-preview-action="close">
      Close
    </button>
    <div class="context-separator"></div>
    <button class="context-item" data-preview-action="zoom-out">
      Zoom Out
    </button>
    <button class="context-item" data-preview-action="zoom-in">
      Zoom In
    </button>
    <button class="context-item" data-preview-action="zoom-reset">
      Actual Fit
    </button>
    <div class="context-separator"></div>
    <button class="context-item" data-preview-action="rename">
      Rename
    </button>
  `;

  document.body.appendChild(menu);

  const x =
    Math.min(
      event.clientX,
      window.innerWidth - menu.offsetWidth - 8
    );

  const y =
    Math.min(
      event.clientY,
      window.innerHeight - menu.offsetHeight - 8
    );

  menu.style.left =
    Math.max(8, x) + "px";

  menu.style.top =
    Math.max(8, y) + "px";

  menu.addEventListener(
    "pointerdown",
    actionEvent => {
      const action =
        actionEvent.target.closest("[data-preview-action]")?.dataset.previewAction;

      if(!action){
        return;
      }

      actionEvent.preventDefault();
      actionEvent.stopPropagation();

      if(action === "close"){
        window.closeDialogWindow?.(
          dialogId
        );
      }

      if(action === "rename"){
        openDesktopImagePreviewRenamePanel(
          item,
          menu,
          dialog,
          content,
          refreshFolders
        );

        return;
      }

      if(action === "zoom-out"){
        setZoom(getZoom() - .25);
      }

      if(action === "zoom-in"){
        setZoom(getZoom() + .25);
      }

      if(action === "zoom-reset"){
        setZoom(1);
      }

      closeDesktopImagePreviewContextMenu();
    }
  );

  requestAnimationFrame(() => {
    document.addEventListener(
      "pointerdown",
      closeDesktopImagePreviewContextMenu,
      { once:true }
    );
  });
}

function closeDesktopImagePreviewContextMenu(){
  document
    .querySelectorAll(".desktop-image-preview-context-menu")
    .forEach(menu => {
      menu.remove();
    });
}

function openDesktopImagePreviewRenamePanel(
  item,
  menu,
  dialog,
  content,
  refreshFolders
){
  if(!item?.id){
    return;
  }

  closeDesktopImagePreviewRenamePanel();

  const rect =
    menu.getBoundingClientRect();

  closeDesktopImagePreviewContextMenu();

  const panel =
    createDesktopImagePreviewRenamePanel(
      item.name || "Image"
    );

  panel.style.setProperty(
    "--x",
    `${rect.left}px`
  );

  panel.style.setProperty(
    "--y",
    `${rect.top}px`
  );

  panel.style.position =
    "fixed";

  panel.style.zIndex =
    999999;

  document.body.appendChild(panel);

  panel.classList.add(
    "is-open"
  );

  panel.addEventListener(
    "pointerdown",
    event => {
      event.stopPropagation();
    }
  );

  const input =
    panel.querySelector(
      ".preview-rename-input"
    );

  const submit = () => {
    const cleanName =
      input.value.trim();

    if(!cleanName){
      return;
    }

    renameDesktopImagePreviewItem(
      item,
      dialog,
      content,
      cleanName,
      refreshFolders
    );

    closeDesktopImagePreviewRenamePanel();
    closeDesktopImagePreviewContextMenu();
  };

  panel
    .querySelector(".preview-rename-ok")
    ?.addEventListener("click", submit);

  panel
    .querySelector(".preview-rename-cancel")
    ?.addEventListener(
      "click",
      closeDesktopImagePreviewRenamePanel
    );

  input?.addEventListener("keydown", event => {
    if(event.key === "Enter"){
      submit();
    }

    if(event.key === "Escape"){
      closeDesktopImagePreviewRenamePanel();
    }
  });

  input?.focus();
  input?.select();

  requestAnimationFrame(() => {
    document.addEventListener(
      "pointerdown",
      closeDesktopImagePreviewRenamePanel,
      {
        once:true
      }
    );
  });

}

function closeDesktopImagePreviewRenamePanel(){
  document
    .querySelectorAll(".preview-rename-panel")
    .forEach(panel => {
      panel.remove();
    });
}

function createDesktopImagePreviewRenamePanel(name){

  const panel =
    document.createElement("div");

  panel.className =
    "context-menu preview-rename-panel";

  panel.style.minWidth =
    "360px";

  panel.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    <div class="context-title">
      Rename
    </div>

    <div class="preview-rename-field">
      <input
        class="preview-rename-input"
        value="${escapeAttribute(name)}"
      >
    </div>

    <div class="preview-rename-actions">
      <button
        class="context-item preview-rename-cancel"
        type="button"
      >
        Cancel
      </button>

      <button
        class="context-item preview-rename-ok"
        type="button"
      >
        OK
      </button>
    </div>
  `;

  return panel;

}

function renameDesktopImagePreviewItem(
  item,
  dialog,
  content,
  cleanName,
  refreshFolders
){

  if(!cleanName){
    return;
  }

  item.name =
    cleanName;

  setDesktopItems(
    updateDesktopItemTree(
      getDesktopItems(),
      item.id,
      {
        name:cleanName
      }
    )
  );

  const title =
    dialog?.querySelector(
      ".dialog-title"
    );

  if(title){
    title.textContent =
      cleanName;
  }

  const previewName =
    content?.querySelector(
      ".desktop-image-preview-name"
    );

  if(previewName){
    previewName.textContent =
      cleanName;
  }

  const iconLabel =
    document.querySelector(
      `.desktop-icon[data-item-id="${cssEscape(item.id)}"] span`
    );

  if(iconLabel){
    iconLabel.textContent =
      cleanName;
  }

  refreshFolders?.();
}

function updateDesktopItemTree(
  items,
  id,
  patch
){

  return items.map(item => {
    if(item.id === id){
      return {
        ...item,
        ...patch
      };
    }

    if(Array.isArray(item.items)){
      return {
        ...item,
        items: updateDesktopItemTree(
          item.items,
          id,
          patch
        )
      };
    }

    return item;
  });

}

function cssEscape(value){

  if(window.CSS?.escape){
    return window.CSS.escape(
      String(value)
    );
  }

  return String(value)
    .replace(/["\\]/g,"\\$&");

}

function escapeHtml(value){

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");

}

function escapeAttribute(value){

  return escapeHtml(value);

}
