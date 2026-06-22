export function openGalleryPreviewDialog({
  asset,
  escapeHtml,
  ensureImageName,
  onRename
}){

  const content =
    document.createElement("div");

  content.className =
    "gallery-preview-dialog";

  const previewDialogId =
    `gallery-preview-${asset.id}`;

  content.innerHTML = `
    <div class="gallery-preview-viewport">
      <img src="${asset.src}" alt="">
    </div>
    <div class="gallery-preview-dialog-name">
      ${escapeHtml(asset.name)}
    </div>
  `;

  const dialog =
    window.openDialogWindow?.({
    id:previewDialogId,
    title:asset.name,
    content,
    left:230,
    top:130,
    width:360,
    height:280,
    resizable:true
  });

  const img =
    content.querySelector("img");

  const viewport =
    content.querySelector(
      ".gallery-preview-viewport"
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

      openGalleryPreviewContextMenu({
        event,
        asset,
        dialogId:previewDialogId,
        dialog,
        img,
        escapeHtml,
        ensureImageName,
        onRename,
        getZoom:() => previewZoom,
        setZoom:value => {
          previewZoom =
            clampGalleryPreviewZoom(
              value
            );

          previewPan =
            clampGalleryPreviewPan(
              viewport,
              img,
              previewZoom <= 1
                ? { x:0, y:0 }
                : previewPan,
              previewZoom
            );

          applyGalleryPreviewZoom(
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
      fitGalleryPreviewDialog(
        dialog,
        img
      );

      syncGalleryPreviewImageToDialog(
        dialog,
        img
      );

      applyGalleryPreviewZoom(
        content,
        img,
        previewZoom,
        previewPan
      );

      if(dialog && "ResizeObserver" in window){
        previewResizeObserver =
          new ResizeObserver(() => {
            syncGalleryPreviewImageToDialog(
              dialog,
              img
            );

            previewPan =
              clampGalleryPreviewPan(
                viewport,
                img,
                previewPan,
                previewZoom
              );

            applyGalleryPreviewZoom(
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

  viewport?.addEventListener(
    "contextmenu",
    openPreviewMenu
  );

  bindGalleryPreviewPan({
    viewport,
    content,
    img,
    getZoom:() => previewZoom,
    getPan:() => previewPan,
    setPan:value => {
      previewPan =
        clampGalleryPreviewPan(
          viewport,
          img,
          value,
          previewZoom
        );

      applyGalleryPreviewZoom(
        content,
        img,
        previewZoom,
        previewPan
      );
    }
  });

  dialog?.addEventListener(
    "contextmenu",
    openPreviewMenu
  );

  return {
    dialog,
    dialogId:previewDialogId,
    cleanup(){
      previewResizeObserver?.disconnect?.();
    }
  };

}

function fitGalleryPreviewDialog(dialog, img){
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

  const maxDialogW =
    Math.max(
      260,
      Math.round(img.naturalWidth * baseRatio + chromeW)
    );

  const maxDialogH =
    Math.max(
      190,
      Math.round(img.naturalHeight * baseRatio + chromeH)
    );

  dialog.dataset.aspectLocked =
    "true";

  dialog.dataset.aspectRatio =
    String(img.naturalWidth / img.naturalHeight);

  dialog.dataset.aspectChromeW =
    String(chromeW);

  dialog.dataset.aspectChromeH =
    String(chromeH);

  dialog.dataset.aspectMaxWidth =
    String(maxDialogW);

  dialog.dataset.aspectMaxHeight =
    String(maxDialogH);

  dialog.style.width =
    Math.round(imageW + chromeW) + "px";

  dialog.style.height =
    Math.round(imageH + chromeH) + "px";
}

function syncGalleryPreviewImageToDialog(dialog, img){
  if(!dialog || !img?.naturalWidth || !img?.naturalHeight){
    return;
  }

  const viewport =
    dialog.querySelector(
      ".gallery-preview-viewport"
    );

  if(!viewport){
    return;
  }

  const viewportW =
    Math.max(
      80,
      viewport.clientWidth
    );

  const viewportH =
    Math.max(
      60,
      viewport.clientHeight
    );

  const ratio =
    Math.min(
      viewportW / img.naturalWidth,
      viewportH / img.naturalHeight,
      1
    );

  const imageW =
    Math.round(
      img.naturalWidth * ratio
    );

  const imageH =
    Math.round(
      img.naturalHeight * ratio
    );

  img.style.width =
    imageW + "px";

  img.style.height =
    imageH + "px";
}

function clampGalleryPreviewZoom(value){

  return Math.max(
    .25,
    Math.min(
      4,
      value
    )
  );

}

function applyGalleryPreviewZoom(
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

function clampGalleryPreviewPan(
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

function bindGalleryPreviewPan({
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

function openGalleryPreviewContextMenu({
  event,
  asset,
  dialogId,
  dialog,
  img,
  getZoom,
  setZoom,
  escapeHtml,
  ensureImageName,
  onRename
}){
  closeGalleryPreviewContextMenu();

  const menu =
    document.createElement("div");

  menu.className =
    "gallery-preview-context-menu context-menu";

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

      if(action === "rename"){
        openGalleryPreviewRenamePanel({
          asset,
          menu,
          dialog,
          dialogId,
          escapeHtml,
          ensureImageName,
          onRename
        });

        return;
      }

      if(action === "close"){
        window.closeDialogWindow?.(
          dialogId
        );
      }

      if(action === "zoom-out"){
        setZoom(
          getZoom() - .25
        );
      }

      if(action === "zoom-in"){
        setZoom(
          getZoom() + .25
        );
      }

      if(action === "zoom-reset"){
        setZoom(1);
      }

      closeGalleryPreviewContextMenu();
    }
  );

  requestAnimationFrame(() => {
    document.addEventListener(
      "pointerdown",
      closeGalleryPreviewContextMenu,
      {
        once:true
      }
    );
  });
}

function closeGalleryPreviewContextMenu(){
  document
    .querySelectorAll(".gallery-preview-context-menu")
    .forEach(menu => {
      menu.remove();
    });
}

function openGalleryPreviewRenamePanel({
  asset,
  menu,
  dialog,
  dialogId,
  escapeHtml,
  ensureImageName,
  onRename
}){

  closeGalleryPreviewRenamePanel();

  const rect =
    menu.getBoundingClientRect();

  closeGalleryPreviewContextMenu();

  const panel =
    createContextRenamePanel(
      asset.name || "Image",
      escapeHtml
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
    const nextName =
      ensureImageName(
        input.value.trim(),
        asset.name
      );

    if(!nextName){
      return;
    }

    onRename(
      asset,
      nextName,
      dialog,
      dialogId
    );

    closeGalleryPreviewRenamePanel();
    closeGalleryPreviewContextMenu();
  };

  panel
    .querySelector(".preview-rename-ok")
    ?.addEventListener("click", submit);

  panel
    .querySelector(".preview-rename-cancel")
    ?.addEventListener(
      "click",
      closeGalleryPreviewRenamePanel
    );

  input?.addEventListener("keydown", event => {
    if(event.key === "Enter"){
      submit();
    }

    if(event.key === "Escape"){
      closeGalleryPreviewRenamePanel();
    }
  });

  input?.focus();
  input?.select();

  requestAnimationFrame(() => {
    document.addEventListener(
      "pointerdown",
      closeGalleryPreviewRenamePanel,
      {
        once:true
      }
    );
  });

}

function closeGalleryPreviewRenamePanel(){
  document
    .querySelectorAll(".preview-rename-panel")
    .forEach(panel => {
      panel.remove();
    });
}

function createContextRenamePanel(name, escapeHtml){

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
        value="${escapeHtml(name)}"
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
