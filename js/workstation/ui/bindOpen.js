export function bindOpen(workstation){

  const open =
    document.getElementById("fileOpen");

  const dropTarget =
    workstation.canvasArea;

  const input =
    document.createElement("input");

  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";

  document.body.appendChild(input);



  function loadFiles(files){
    if(!files?.length) return;

    workstation.core.load(
      files,
      status => console.log(status),
      () => {
        workstation.core.progress = 0;
        const activeTool =
          document.querySelector(
            ".tool-cell.active"
          )?.dataset.tool;

        workstation.effects.setMode(
          workstation.effects.modules[activeTool]
            ? activeTool
            : "drift"
        );

        workstation.queueRender();
      }
    );
  }

  function loadImageSource(
    src,
    name = "gallery-image.png"
  ){

    if(!src){
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

      const activeTool =
        document.querySelector(
          ".tool-cell.active"
        )?.dataset.tool;

      workstation.effects.setMode(
        workstation.effects.modules[activeTool]
          ? activeTool
          : "drift"
      );

      workstation.queueRender();

      window.restoreWindow?.(
        "workstation"
      );

      window.dispatchEvent(
        new CustomEvent(
          "workstation:image-opened",
          {
            detail: {
              name,
              src
            }
          }
        )
      );

    };

    img.src =
      src;

  }

  window.openWorkstationImage =
    detail => {
      loadImageSource(
        detail?.src,
        detail?.name
      );
    };

  window.addEventListener(
    "workstation:open-image",
    event => {
      loadImageSource(
        event.detail?.src,
        event.detail?.name
      );
    }
  );



  if(open){
    open.addEventListener("click", () => {
      input.click();
    });
  }



  input.addEventListener("change", event => {
    loadFiles(event.target.files);

    input.value = "";
  });



  if(!dropTarget) return;

  dropTarget.addEventListener("dragover", event => {
    event.preventDefault();
    dropTarget.classList.add("is-drop-target");
  });

  dropTarget.addEventListener("dragleave", event => {
    if(
      event.relatedTarget &&
      dropTarget.contains(event.relatedTarget)
    ){
      return;
    }

    dropTarget.classList.remove("is-drop-target");
  });

  dropTarget.addEventListener("drop", event => {
    event.preventDefault();

    dropTarget.classList.remove("is-drop-target");

    loadFiles(
      event.dataTransfer?.files
    );
  });

}
