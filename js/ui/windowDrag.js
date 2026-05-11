export function bindWindowDrag(ui) {

  const win =
    document.getElementById("window");

  const dragbar =
    document.getElementById("dragbar");

  if (!win || !dragbar) return;

  dragbar.addEventListener("pointerdown", (e) => {

    ui.draggingWindow = true;

    const rect =
      win.getBoundingClientRect();

    ui.winOffsetX =
      e.clientX - rect.left;

    ui.winOffsetY =
      e.clientY - rect.top;

    win.style.position = "fixed";

    win.style.left =
      rect.left + "px";

    win.style.top =
      rect.top + "px";

    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {

    if (!ui.draggingWindow) {
      return;
    }

    win.style.left =
      (e.clientX - ui.winOffsetX) + "px";

    win.style.top =
      (e.clientY - ui.winOffsetY) + "px";
  });

  window.addEventListener("pointerup", () => {

    ui.draggingWindow = false;
  });

  const minimize =
    document.querySelector(".minimize");

  if (minimize) {

    minimize.addEventListener("click", () => {

      win.classList.toggle("collapsed");
    });
  }
}