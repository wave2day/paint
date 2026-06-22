export function bindCanvasContextMenu(workstation){

  const target =
    workstation.canvasArea;

  if(!target){
    return;
  }

  let activeMenu = null;
  let activeSubmenus = [];
  let activeRenamePanel = null;
  let activeCrop = null;
  const state = {
    undoStack: [],
    redoStack: [],
    name: "glitch-workstation.png"
  };

  workstation.canvasHistory =
    {
      canUndo:() => state.undoStack.length > 0,
      canRedo:() => state.redoStack.length > 0,
      undo:() => {
        undoCanvasAction(
          workstation,
          state
        );

        updateUndoRedoState(state);
      },
      redo:() => {
        redoCanvasAction(
          workstation,
          state
        );

        updateUndoRedoState(state);
      }
    };

  bindEditMenuUndoRedo(
    workstation,
    state
  );

  window.openWorkstationSave =
    save => {
      openWorkstationSave(
        workstation,
        save,
        state
      );
    };

  document
    .getElementById("fileSave")
    ?.addEventListener(
      "click",
      () => {
        saveCanvasState(
          workstation,
          state
        );
      }
    );

  target.addEventListener(
    "contextmenu",
    event => {

      if(activeCrop){
        event.preventDefault();
        return;
      }

      closeRenamePanel();

      event.preventDefault();

      closeMenu();

      const {
        menu,
        submenus
      } =
        createCanvasMenu();

      updateContextUndoRedoState(
        menu,
        state
      );

      menu.style.setProperty(
        "--x",
        `${event.clientX}px`
      );

      menu.style.setProperty(
        "--y",
        `${event.clientY}px`
      );

      menu.style.position =
        "fixed";

      menu.style.zIndex =
        999999;

      document.body.appendChild(
        menu
      );

      submenus.forEach(submenu => {

        submenu.style.position =
          "fixed";

        submenu.style.zIndex =
          999999;

        document.body.appendChild(
          submenu
        );

      });

      menu.classList.add(
        "is-open"
      );

      activeMenu =
        menu;

      activeSubmenus =
        submenus;

    }
  );

  document.addEventListener(
    "pointerdown",
    event => {

      if(
        event.target.closest(
          ".ws-rename-panel,.ws-crop-layer,.ws-crop-confirm"
        )
      ){
        return;
      }

      const item =
        event.target.closest(
          ".ws-canvas-context-menu .context-item[data-ws-action], .ws-canvas-context-submenu .context-item[data-ws-action]"
        );

      if(item){
        const action =
          item.dataset.wsAction;

        if(action === "rename"){
          const rect =
            item.getBoundingClientRect();

          closeMenu();

          openRenamePanel(
            state,
            rect
          );

          return;
        }

        runCanvasAction(
          action,
          workstation,
          state
        );

        closeMenu();

        return;
      }

      if(
        event.target.closest(
          ".ws-canvas-context-menu,.ws-canvas-context-submenu"
        )
      ){
        return;
      }

      closeMenu();
      closeRenamePanel();
      cancelCropMode();

    }
  );

  document.addEventListener(
    "keydown",
    event => {

      if(event.key !== "Escape"){
        return;
      }

      closeMenu();
      closeRenamePanel();
      cancelCropMode();

    }
  );

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

  function closeRenamePanel(){

    if(!activeRenamePanel){
      return;
    }

    activeRenamePanel.remove();
    activeRenamePanel = null;

  }

  function cancelCropMode(){

    if(!activeCrop){
      return;
    }

    activeCrop.layer.remove();
    activeCrop.panel?.remove();
    activeCrop = null;

    target.classList.remove(
      "is-cropping"
    );

  }

  window.startWorkstationCropMode =
    () => {
      startCropMode();
    };

  function startCropMode(){

    const image =
      getCurrentImage(
        workstation
      );

    if(!image){
      return;
    }

    cancelCropMode();
    closeMenu();
    closeRenamePanel();

    const layer =
      document.createElement(
        "div"
      );

    layer.className =
      "ws-crop-layer";

    const box =
      document.createElement(
        "div"
      );

    box.className =
      "ws-crop-box";

    layer.appendChild(box);
    target.appendChild(layer);

    target.classList.add(
      "is-cropping"
    );

    activeCrop = {
      layer,
      box,
      panel:null,
      rect:null,
      dragging:false,
      startX:0,
      startY:0
    };

    layer.addEventListener(
      "pointerdown",
      event => {
        if(event.button !== 0){
          return;
        }

        activeCrop.panel?.remove();
        activeCrop.panel = null;
        activeCrop.dragging = true;

        const point =
          getCropPoint(
            layer,
            event
          );

        activeCrop.startX =
          point.x;

        activeCrop.startY =
          point.y;

        activeCrop.rect = {
          left:point.x,
          top:point.y,
          width:0,
          height:0
        };

        renderCropBox(
          activeCrop.box,
          activeCrop.rect
        );

        layer.setPointerCapture?.(
          event.pointerId
        );

        event.preventDefault();
      }
    );

    layer.addEventListener(
      "pointermove",
      event => {
        if(!activeCrop?.dragging){
          return;
        }

        const point =
          getCropPoint(
            layer,
            event
          );

        activeCrop.rect =
          normalizeCropRect(
            activeCrop.startX,
            activeCrop.startY,
            point.x,
            point.y
          );

        renderCropBox(
          activeCrop.box,
          activeCrop.rect
        );
      }
    );

    layer.addEventListener(
      "pointerup",
      event => {
        if(!activeCrop?.dragging){
          return;
        }

        activeCrop.dragging = false;

        layer.releasePointerCapture?.(
          event.pointerId
        );

        if(
          !activeCrop.rect ||
          activeCrop.rect.width < 8 ||
          activeCrop.rect.height < 8
        ){
          cancelCropMode();
          return;
        }

        openCropConfirmPanel(
          activeCrop.rect
        );
      }
    );

  }

  function getCropPoint(layer,event){

    const rect =
      layer.getBoundingClientRect();

    return {
      x:Math.max(
        0,
        Math.min(
          rect.width,
          event.clientX - rect.left
        )
      ),
      y:Math.max(
        0,
        Math.min(
          rect.height,
          event.clientY - rect.top
        )
      )
    };

  }

  function normalizeCropRect(x1,y1,x2,y2){

    return {
      left:Math.min(x1,x2),
      top:Math.min(y1,y2),
      width:Math.abs(x2 - x1),
      height:Math.abs(y2 - y1)
    };

  }

  function renderCropBox(box,rect){

    box.style.left =
      rect.left + "px";

    box.style.top =
      rect.top + "px";

    box.style.width =
      rect.width + "px";

    box.style.height =
      rect.height + "px";

  }

  function openCropConfirmPanel(rect){

    activeCrop.panel?.remove();

    const panel =
      document.createElement(
        "div"
      );

    panel.className =
      "context-menu ws-crop-confirm";

    panel.classList.add(
      "is-open"
    );

    panel.innerHTML = `
      <div class="menu-contact"></div>
      <div class="menu-glint"></div>
      <button class="context-item" data-crop-action="apply">
        <span>Crop</span>
      </button>
      <button class="context-item" data-crop-action="cancel">
        <span>Cancel</span>
      </button>
    `;

    const areaRect =
      target.getBoundingClientRect();

    panel.style.setProperty(
      "--x",
      (areaRect.left + rect.left + rect.width + 8) + "px"
    );

    panel.style.setProperty(
      "--y",
      (areaRect.top + rect.top) + "px"
    );

    panel.style.position =
      "fixed";

    panel.style.zIndex =
      999999;

    document.body.appendChild(panel);

    activeCrop.panel =
      panel;

    panel.addEventListener(
      "pointerdown",
      event => {
        const action =
          event.target.closest("[data-crop-action]")?.dataset.cropAction;

        if(!action){
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if(action === "apply"){
          applyCropSelection(
            rect
          );
        }else{
          cancelCropMode();
        }
      }
    );

  }

  function applyCropSelection(rect){

    const image =
      getCurrentImage(
        workstation
      );

    if(!image){
      cancelCropMode();
      return;
    }

    const viewport =
      workstation.renderer.viewport;

    const scale =
      viewport.fitScale *
      viewport.scale;

    if(!scale){
      cancelCropMode();
      return;
    }

    const crop =
      screenRectToImageRect(
        rect,
        viewport,
        scale
      );

    if(crop.width < 1 || crop.height < 1){
      cancelCropMode();
      return;
    }

    snapshotCanvas(
      workstation,
      state
    );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      crop.width;

    canvas.height =
      crop.height;

    canvas
      .getContext("2d")
      .drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

    applyCanvasAsWorkstationSource(
      workstation,
      canvas
    );

    state.name =
      createCropName(
        state.name
      );

    cancelCropMode();

    workstation.queueRender();

  }

  function screenRectToImageRect(rect,viewport,scale){

    const x =
      Math.max(
        0,
        Math.floor(
          (rect.left - viewport.offsetX) / scale
        )
      );

    const y =
      Math.max(
        0,
        Math.floor(
          (rect.top - viewport.offsetY) / scale
        )
      );

    const right =
      Math.min(
        viewport.imageWidth,
        Math.ceil(
          (rect.left + rect.width - viewport.offsetX) / scale
        )
      );

    const bottom =
      Math.min(
        viewport.imageHeight,
        Math.ceil(
          (rect.top + rect.height - viewport.offsetY) / scale
        )
      );

    return {
      x,
      y,
      width:Math.max(0, right - x),
      height:Math.max(0, bottom - y)
    };

  }

  function openRenamePanel(
    state,
    rect
  ){

    const panel =
      createRenamePanel(
        state
      );

    panel.style.setProperty(
      "--x",
      `${rect.right - 10}px`
    );

    panel.style.setProperty(
      "--y",
      `${rect.top - 2}px`
    );

    panel.style.position =
      "fixed";

    panel.style.zIndex =
      999999;

    document.body.appendChild(
      panel
    );

    panel.classList.add(
      "is-open"
    );

    activeRenamePanel =
      panel;

    const input =
      panel.querySelector(
        ".ws-rename-input"
      );

    input.focus();
    input.select();

    panel
      .querySelector(
        ".ws-rename-ok"
      )
      .addEventListener(
        "click",
        () => {
          applyRename(
            state,
            input.value
          );

          closeRenamePanel();
        }
      );

    panel
      .querySelector(
        ".ws-rename-cancel"
      )
      .addEventListener(
        "click",
        closeRenamePanel
      );

    input.addEventListener(
      "keydown",
      event => {
        if(event.key === "Enter"){
          applyRename(
            state,
            input.value
          );

          closeRenamePanel();
        }

        if(event.key === "Escape"){
          closeRenamePanel();
        }
      }
    );

  }

}

function createCanvasMenu(){

  const menu =
    document.createElement(
      "div"
    );

  menu.className =
    "context-menu ws-canvas-context-menu";

  menu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    <button class="context-item" data-ws-action="undo">
      <span>Undo</span>
    </button>

    <button class="context-item" data-ws-action="redo">
      <span>Redo</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item" data-ws-action="rename">
      <span>Rename</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item" data-ws-action="zoom-out">
      <span>Zoom Out</span>
    </button>

    <button class="context-item" data-ws-action="zoom-in">
      <span>Zoom In</span>
    </button>

    <button class="context-item" data-ws-action="zoom-fit">
      <span>Actual Fit</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item" data-ws-action="crop">
      <span>Crop</span>
    </button>

    <button class="context-item has-submenu" data-submenu="wsTransformSubmenu">
      <span>Transform</span>
      <span class="context-arrow">›</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item has-submenu" data-submenu="wsSendToSubmenu">
      <span>Send To</span>
      <span class="context-arrow">›</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item" data-ws-action="save">
      <span>Save</span>
    </button>

    <button class="context-item" data-ws-action="export">
      <span>Export</span>
    </button>

    <div class="context-separator"></div>

    <button class="context-item" data-ws-action="delete">
      <span>Delete</span>
    </button>
  `;

  const transformSubmenu =
    createSubmenu(
      "wsTransformSubmenu",
      `
        <button class="context-item" data-ws-action="rotate-left">
          <span>Rotate Left</span>
        </button>

        <button class="context-item" data-ws-action="rotate-right">
          <span>Rotate Right</span>
        </button>

        <button class="context-item" data-ws-action="flip-horizontal">
          <span>Flip Horizontal</span>
        </button>

        <button class="context-item" data-ws-action="flip-vertical">
          <span>Flip Vertical</span>
        </button>
      `
    );

  const sendToSubmenu =
    createSubmenu(
      "wsSendToSubmenu",
      `
        <button class="context-item" data-ws-action="send-gallery">
          <span>Gallery</span>
        </button>

        <button class="context-item" data-ws-action="send-chain">
          <span>Chain Machine</span>
        </button>
      `
    );

  return {
    menu,
    submenus:[
      transformSubmenu,
      sendToSubmenu
    ]
  };

}

function createSubmenu(
  id,
  content
){

  const submenu =
    document.createElement(
      "div"
    );

  submenu.className =
    "context-submenu ws-canvas-context-submenu";

  submenu.id =
    id;

  submenu.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>
    ${content}
  `;

  return submenu;

}

function createRenamePanel(state){

  const panel =
    document.createElement(
      "div"
    );

  panel.className =
    "context-submenu ws-rename-panel";

  panel.style.minWidth =
    "360px";

  panel.innerHTML = `
    <div class="menu-contact"></div>
    <div class="menu-glint"></div>

    <div class="context-title">
      Rename
    </div>

    <div
      class="ws-rename-field"
      style="
        position:relative;
        z-index:2;
        padding:6px 8px 8px;
        box-sizing:border-box;
      "
    >
      <input
        class="ws-rename-input"
        value="${escapeAttribute(state.name)}"
        style="
          width:100%;
          height:30px;
          box-sizing:border-box;
          border:1px solid #8d73d8;
          background:#eee9ff;
          color:var(--text);
          font:500 12px/1 var(--font);
          padding:0 6px;
          outline:none;
        "
      >
    </div>

    <div
      class="ws-rename-actions"
      style="
        position:relative;
        z-index:2;
        display:flex;
        justify-content:flex-end;
        gap:8px;
        padding:2px 8px 6px;
        box-sizing:border-box;
      "
    >
      <button
        class="context-item ws-rename-cancel"
        type="button"
        style="
          width:96px;
          height:28px;
          justify-content:center;
        "
      >
        Cancel
      </button>

      <button
        class="context-item ws-rename-ok"
        type="button"
        style="
          width:72px;
          height:28px;
          justify-content:center;
        "
      >
        OK
      </button>
    </div>
  `;

  return panel;

}

function escapeAttribute(value){

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

}

function runCanvasAction(
  action,
  workstation,
  state
){

  switch(action){

    case "undo":
      undoCanvasAction(
        workstation,
        state
      );
      break;

    case "redo":
      redoCanvasAction(
        workstation,
        state
      );
      break;

    case "rename":
      renameCanvasAsset(
        state
      );
      break;

    case "zoom-out":
      zoomCanvasView(
        workstation,
        1 / 1.25
      );
      break;

    case "zoom-in":
      zoomCanvasView(
        workstation,
        1.25
      );
      break;

    case "zoom-fit":
      resetCanvasView(
        workstation
      );
      break;

    case "crop":
      window.startWorkstationCropMode?.();
      break;

    case "rotate-left":
      transformCanvasImage(
        workstation,
        state,
        "rotate-left"
      );
      break;

    case "rotate-right":
      transformCanvasImage(
        workstation,
        state,
        "rotate-right"
      );
      break;

    case "flip-horizontal":
      transformCanvasImage(
        workstation,
        state,
        "flip-horizontal"
      );
      break;

    case "flip-vertical":
      transformCanvasImage(
        workstation,
        state,
        "flip-vertical"
      );
      break;

    case "send-gallery":
      sendCanvasToGallery(
        workstation,
        state
      );
      break;

    case "send-chain":
      window.restoreWindow?.(
        "chainMachine"
      );
      break;

    case "save":
      saveCanvasState(
        workstation,
        state
      );
      break;

    case "export":
      exportCanvas(
        workstation,
        state
      );
      break;

    case "delete":
      deleteCanvasImage(
        workstation,
        state
      );
      break;

    default:
      console.log(
        "Workstation canvas action:",
        action
      );

  }

}

function zoomCanvasView(workstation,factor){

  const viewport =
    workstation.renderer?.viewport;

  if(!viewport){
    return;
  }

  viewport.scale =
    Math.max(
      .25,
      Math.min(
        8,
        viewport.scale * factor
      )
    );

  workstation.renderer.render();

}

function resetCanvasView(workstation){

  const viewport =
    workstation.renderer?.viewport;

  if(!viewport){
    return;
  }

  viewport.scale = 1;
  viewport.offsetX = 0;
  viewport.offsetY = 0;
  viewport.scrollX = 0;
  viewport.scrollY = 0;

  workstation.renderer.render();

}

function applyCanvasAsWorkstationSource(workstation,canvas){

  workstation.core.images =
    [canvas];

  workstation.core.loadedCount =
    1;

  workstation.core.progress =
    0;

  workstation.core.drawW =
    canvas.width;

  workstation.core.drawH =
    canvas.height;

  workstation.core.prepareSource(
    canvas
  );

  workstation.renderer.image =
    canvas;

  workstation.renderer.viewport.imageWidth =
    canvas.width;

  workstation.renderer.viewport.imageHeight =
    canvas.height;

  resetCanvasView(
    workstation
  );

}

function createCropName(name){

  const base =
    removePngExtension(
      name
    );

  if(/ crop$/i.test(base)){
    return ensurePngName(
      base
    );
  }

  return ensurePngName(
    base + " crop"
  );

}

function getCurrentImage(workstation){

  return (
    workstation.renderer.image ||
    workstation.canvas
  );

}

function cloneImageCanvas(image){

  if(!image){
    return null;
  }

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    image.width;

  canvas.height =
    image.height;

  canvas
    .getContext("2d")
    .drawImage(
      image,
      0,
      0
    );

  return canvas;

}

function snapshotCanvas(
  workstation,
  state
){

  const image =
    getCurrentImage(
      workstation
    );

  const snapshot =
    cloneImageCanvas(
      image
    );

  if(!snapshot){
    return;
  }

  state.undoStack.push({
    image: snapshot,
    name: state.name
  });

  if(state.undoStack.length > 12){
    state.undoStack.shift();
  }

  state.redoStack = [];

  updateUndoRedoState(state);

}

function restoreCanvasSnapshot(
  workstation,
  snapshot,
  state
){

  if(!snapshot?.image){
    return;
  }

  workstation.renderer.image =
    snapshot.image;

  workstation.renderer.viewport.imageWidth =
    snapshot.image.width;

  workstation.renderer.viewport.imageHeight =
    snapshot.image.height;

  state.name =
    snapshot.name ||
    state.name;

  workstation.renderer.render();

}

function undoCanvasAction(
  workstation,
  state
){

  const snapshot =
    state.undoStack.pop();

  if(!snapshot){
    return;
  }

  state.redoStack.push({
    image: cloneImageCanvas(
      getCurrentImage(
        workstation
      )
    ),
    name: state.name
  });

  restoreCanvasSnapshot(
    workstation,
    snapshot,
    state
  );

  updateUndoRedoState(state);

}

function redoCanvasAction(
  workstation,
  state
){

  const snapshot =
    state.redoStack.pop();

  if(!snapshot){
    return;
  }

  state.undoStack.push({
    image: cloneImageCanvas(
      getCurrentImage(
        workstation
      )
    ),
    name: state.name
  });

  restoreCanvasSnapshot(
    workstation,
    snapshot,
    state
  );

  updateUndoRedoState(state);

}

function bindEditMenuUndoRedo(
  workstation,
  state
){
  const undo =
    document.getElementById("editUndo");

  const redo =
    document.getElementById("editRedo");

  undo?.addEventListener(
    "click",
    () => {
      workstation.canvasHistory?.undo();
    }
  );

  redo?.addEventListener(
    "click",
    () => {
      workstation.canvasHistory?.redo();
    }
  );

  updateUndoRedoState(state);
}

function updateUndoRedoState(state){
  setMenuDisabled(
    document.getElementById("editUndo"),
    state.undoStack.length <= 0
  );

  setMenuDisabled(
    document.getElementById("editRedo"),
    state.redoStack.length <= 0
  );
}

function updateContextUndoRedoState(menu,state){
  setMenuDisabled(
    menu.querySelector('[data-ws-action="undo"]'),
    state.undoStack.length <= 0
  );

  setMenuDisabled(
    menu.querySelector('[data-ws-action="redo"]'),
    state.redoStack.length <= 0
  );
}

function setMenuDisabled(element,disabled){
  if(!element){
    return;
  }

  element.setAttribute(
    "aria-disabled",
    disabled
      ? "true"
      : "false"
  );

  element.classList.toggle(
    "is-disabled",
    disabled
  );

  if("disabled" in element){
    element.disabled =
      disabled;
  }
}

function renameCanvasAsset(state){

}

function applyRename(
  state,
  nextName
){

  if(!nextName){
    return;
  }

  state.name =
    ensurePngName(
      nextName.trim()
    );

}

function ensurePngName(name){

  if(!name){
    return "glitch-workstation.png";
  }

  if(
    name
      .toLowerCase()
      .endsWith(".png")
  ){
    return name;
  }

  return `${name}.png`;

}

function transformCanvasImage(
  workstation,
  state,
  type
){

  const image =
    getCurrentImage(
      workstation
    );

  if(!image){
    return;
  }

  snapshotCanvas(
    workstation,
    state
  );

  const rotated =
    type === "rotate-left" ||
    type === "rotate-right";

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    rotated
      ? image.height
      : image.width;

  canvas.height =
    rotated
      ? image.width
      : image.height;

  const ctx =
    canvas.getContext(
      "2d"
    );

  if(type === "rotate-left"){

    ctx.translate(
      0,
      canvas.height
    );

    ctx.rotate(
      -Math.PI / 2
    );

  }

  if(type === "rotate-right"){

    ctx.translate(
      canvas.width,
      0
    );

    ctx.rotate(
      Math.PI / 2
    );

  }

  if(type === "flip-horizontal"){

    ctx.translate(
      canvas.width,
      0
    );

    ctx.scale(
      -1,
      1
    );

  }

  if(type === "flip-vertical"){

    ctx.translate(
      0,
      canvas.height
    );

    ctx.scale(
      1,
      -1
    );

  }

  ctx.drawImage(
    image,
    0,
    0
  );

  applyCanvasAsWorkstationSource(
    workstation,
    canvas
  );

  workstation.queueRender();

}

function sendCanvasToGallery(
  workstation,
  state
){

  const image =
    getCurrentImage(
      workstation
    );

  if(!image){
    return;
  }

  const canvas =
    cloneImageCanvas(
      image
    );

  const src =
    canvas.toDataURL(
      "image/png"
    );

  window.dispatchEvent(
    new CustomEvent(
      "gallery:add-asset",
      {
        detail: {
          src,
          name: state.name,
          type: "PNG Image",
          source: "Glitch Workstation"
        }
      }
    )
  );

  window.restoreWindow?.(
    "gallery"
  );

}

function saveCanvasState(
  workstation,
  state
){

  const image =
    getCurrentImage(
      workstation
    );

  if(!image){
    return;
  }

  const preview =
    cloneImageCanvas(
      image
    );

  const sourceImage =
    workstation.core?.images?.[0];

  const sourceCanvas =
    workstation.core?.sourceBuffer?.canvas;

  const source =
    sourceImage
      ? cloneImageCanvas(sourceImage)
      : sourceCanvas?.width && sourceCanvas?.height
        ? cloneImageCanvas(sourceCanvas)
        : preview;

  if(!preview || !source){
    return;
  }

  const name =
    removePngExtension(
      state.name
    );

  window.dispatchEvent(
    new CustomEvent(
      "desktop:add-workstation-save",
      {
        detail: {
          type: "workstation-save",
          version: 1,
          name,
          createdAt: Date.now(),
          previewImage:
            createThumbnailDataUrl(
              preview,
              96
            ),
          sourceImage: source.toDataURL(
            "image/png"
          ),
          workstation: {
            activeTool:
              workstation.effects?.mode || "drift",
            effects:
              serializeEffectStates(
                workstation
              )
          }
        }
      }
    )
  );

}

function createThumbnailDataUrl(
  image,
  maxSize
){

  const scale =
    Math.min(
      1,
      maxSize / Math.max(
        image.width,
        image.height
      )
    );

  const canvas =
    document.createElement("canvas");

  canvas.width =
    Math.max(
      1,
      Math.round(image.width * scale)
    );

  canvas.height =
    Math.max(
      1,
      Math.round(image.height * scale)
    );

  canvas
    .getContext("2d")
    .drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

  return canvas.toDataURL(
    "image/png"
  );

}

function openWorkstationSave(
  workstation,
  save,
  state
){

  const data =
    save?.save || save;

  if(!data?.sourceImage){
    return;
  }

  const img =
    new Image();

  img.onload = () => {

    workstation.core.resizeCanvas();

    workstation.core.images =
      [img];

    workstation.core.loadedCount =
      1;

    workstation.core.progress =
      0;

    workstation.core.prepareImageSize(
      img
    );

    workstation.core.prepareSource(
      img
    );

    applyEffectStates(
      workstation,
      data.workstation?.effects
    );

    const mode =
      workstation.effects.modules[
        data.workstation?.activeTool
      ]
        ? data.workstation.activeTool
        : "drift";

    const button =
      document.querySelector(
        `.tool-cell[data-tool="${cssEscape(mode)}"]`
      );

    if(button){
      button.click();
    }else{
      workstation.effects.setMode(mode);
    }

    state.name =
      ensurePngName(
        data.name || state.name
      );

    workstation.queueRender();

    window.restoreWindow?.(
      "workstation"
    );

  };

  img.src =
    data.sourceImage;

}

function serializeEffectStates(workstation){

  const modules =
    workstation.effects?.modules || {};

  return Object.fromEntries(
    Object
      .entries(modules)
      .map(([key,module]) => {
        const serialized =
          typeof module.serialize === "function"
            ? module.serialize()
            : {
                type: key,
                ...clonePlainObject(module.state)
              };

        return [
          key,
          serialized
        ];
      })
  );

}

function applyEffectStates(
  workstation,
  effects
){

  if(!effects){
    return;
  }

  Object
    .entries(effects)
    .forEach(([key,value]) => {

      const module =
        workstation.effects?.modules?.[key];

      if(!module?.state || !value){
        return;
      }

      if(typeof module.deserialize === "function"){
        module.deserialize(value);

        restoreModuleProgress(
          workstation,
          key,
          module
        );

        if(key === "feedback"){
          module.initialized =
            false;
        }

        return;
      }

      const nextState =
        clonePlainObject(value);

      delete nextState.type;

      Object.assign(
        module.state,
        nextState
      );

      restoreModuleProgress(
        workstation,
        key,
        module
      );

      if(key === "feedback"){
        module.initialized =
          false;
      }

    });

}

function restoreModuleProgress(
  workstation,
  key,
  module
){

  if(
    key !== "drift" ||
    !Number.isFinite(module.state?.progress)
  ){
    return;
  }

  workstation.core.progress =
    Math.max(
      0,
      Math.min(
        1,
        module.state.progress
      )
    );

}

function clonePlainObject(value){

  return JSON.parse(
    JSON.stringify(
      value || {}
    )
  );

}

function removePngExtension(name){

  return String(name || "glitch-workstation")
    .replace(/\.png$/i,"")
    .trim()
    || "glitch-workstation";

}

function exportCanvas(
  workstation,
  state
){

  const image =
    getCurrentImage(
      workstation
    );

  if(!image){
    return;
  }

  const link =
    document.createElement(
      "a"
    );

  link.href =
    cloneImageCanvas(image)
      .toDataURL(
      "image/png"
    );

  link.download =
    state.name;

  link.click();

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

function deleteCanvasImage(
  workstation,
  state
){

  snapshotCanvas(
    workstation,
    state
  );

  workstation.renderer.image =
    null;

  workstation.core.clear();

  workstation.renderer.render();

}
