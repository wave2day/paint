const LIBRARY_ORDER_KEY =
  "glitchGalleryLibraryOrder";

function readLibraryOrder(libraries){
  try{
    const stored =
      JSON.parse(
        window.localStorage.getItem(
          LIBRARY_ORDER_KEY
        ) || "[]"
      );

    if(Array.isArray(stored)){
      return stored.filter(id => libraries[id]);
    }
  }catch(_error){}

  return [];
}

function writeLibraryOrder(order){
  try{
    window.localStorage.setItem(
      LIBRARY_ORDER_KEY,
      JSON.stringify(order)
    );
  }catch(_error){}
}

function getPrimaryLibraryNodes(list){
  return Array
    .from(
      list.querySelectorAll(
        ".library-node[data-library]"
      )
    );
}

function clearDropState(list){
  getPrimaryLibraryNodes(list)
    .forEach(node => {
      node.classList.remove(
        "is-drop-before",
        "is-drop-after"
      );
    });
}

function syncLibraryOrder(list){
  writeLibraryOrder(
    getPrimaryLibraryNodes(list)
      .map(node => node.dataset.library)
      .filter(Boolean)
  );
}

export function setupGalleryLibraryOrdering({
  state,
  libraries
}){
  const list =
    document.querySelector(
      "[data-gallery-library-list]"
    );

  if(!list){
    return;
  }

  const nodes =
    getPrimaryLibraryNodes(list);

  const order =
    readLibraryOrder(libraries);

  order
    .map(id => nodes.find(node => node.dataset.library === id))
    .filter(Boolean)
    .forEach(node => {
      list.appendChild(node);
    });

  const firstNode =
    getPrimaryLibraryNodes(list)[0];

  if(firstNode && libraries[firstNode.dataset.library]){
    state.library =
      firstNode.dataset.library;
  }

  if(list.dataset.reorderBound === "1"){
    return;
  }

  list.dataset.reorderBound =
    "1";

  let draggingNode =
    null;

  let dragStartY =
    0;

  let didReorder =
    false;

  const moveNodeAtPoint = event => {
    if(!draggingNode){
      return;
    }

    const target =
      document
        .elementFromPoint(
          event.clientX,
          event.clientY
        )
        ?.closest(
          "[data-gallery-library-list] .library-node"
        );

    if(!target || target === draggingNode){
      return;
    }

    const rect =
      target.getBoundingClientRect();

    const after =
      event.clientY > rect.top + rect.height / 2;

    clearDropState(list);

    target.classList.add(
      after
        ? "is-drop-after"
        : "is-drop-before"
    );

    list.insertBefore(
      draggingNode,
      after
        ? target.nextSibling
        : target
    );

    didReorder =
      true;
  };

  const finishPointerDrag = () => {
    if(!draggingNode){
      return;
    }

    draggingNode.classList.remove(
      "is-dragging"
    );

    draggingNode =
      null;

    clearDropState(list);
    syncLibraryOrder(list);

    window.setTimeout(
      () => {
        didReorder =
          false;
      },
      0
    );

    document.removeEventListener(
      "pointermove",
      handlePointerMove
    );

    document.removeEventListener(
      "pointerup",
      finishPointerDrag
    );
  };

  function handlePointerMove(event){
    if(!draggingNode){
      return;
    }

    if(Math.abs(event.clientY - dragStartY) < 4){
      return;
    }

    event.preventDefault();
    moveNodeAtPoint(event);
  }

  getPrimaryLibraryNodes(list)
    .forEach(node => {
      node.draggable =
        true;

      node.addEventListener(
        "pointerdown",
        event => {
          if(event.button !== 0){
            return;
          }

          draggingNode =
            node;

          dragStartY =
            event.clientY;

          node.classList.add(
            "is-dragging"
          );

          document.addEventListener(
            "pointermove",
            handlePointerMove
          );

          document.addEventListener(
            "pointerup",
            finishPointerDrag
          );
        }
      );

      node.addEventListener(
        "click",
        event => {
          if(!didReorder){
            return;
          }

          event.preventDefault();
          event.stopImmediatePropagation();
        },
        true
      );

      node.addEventListener(
        "dragstart",
        event => {
          node.classList.add(
            "is-dragging"
          );

          event.dataTransfer?.setData(
            "text/plain",
            node.dataset.library
          );

          if(event.dataTransfer){
            event.dataTransfer.effectAllowed =
              "move";
          }
        }
      );

      node.addEventListener(
        "dragend",
        () => {
          node.classList.remove(
            "is-dragging"
          );

          clearDropState(list);
          syncLibraryOrder(list);
        }
      );

      node.addEventListener(
        "dragover",
        event => {
          const dragging =
            list.querySelector(
              ".library-node.is-dragging"
            );

          if(!dragging || dragging === node){
            return;
          }

          event.preventDefault();

          const rect =
            node.getBoundingClientRect();

          const after =
            event.clientY > rect.top + rect.height / 2;

          clearDropState(list);

          node.classList.add(
            after
              ? "is-drop-after"
              : "is-drop-before"
          );

          list.insertBefore(
            dragging,
            after
              ? node.nextSibling
              : node
          );
        }
      );
    });
}

export function bindGalleryLibraryNodes(onSelectLibrary){

  document
    .querySelectorAll(".gallery .library-node")
    .forEach(node => {

      if(node.dataset.bound === "1"){
        return;
      }

      node.dataset.bound =
        "1";

      node.addEventListener(
        "click",
        () => {
          onSelectLibrary(
            node.dataset.library
          );
        }
      );

    });

}

export function bindGalleryLibraryMenuItems(onSelectLibrary){

  document
    .querySelectorAll("[data-gallery-library]")
    .forEach(item => {

      if(item.dataset.bound === "1"){
        return;
      }

      item.dataset.bound =
        "1";

      item.addEventListener(
        "click",
        () => {
          onSelectLibrary(
            item.dataset.galleryLibrary
          );
        }
      );

    });

}

export function updateActiveLibrary(library){

  document
    .querySelectorAll(".gallery .library-node")
    .forEach(node => {
      node.classList.toggle(
        "active",
        node.dataset.library === library
      );
    });

}

export function updateGalleryPath(pathText){

  const path =
    document.querySelector(
      ".gallery-path"
    );

  if(!path){
    return;
  }

  path.textContent =
    pathText;

}
