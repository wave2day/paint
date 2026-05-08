export function bindScrollbars(ui) {

  const scrollX =
    document.querySelector(".scroll-x span");

  const scrollY =
    document.querySelector(".scroll-y span");

  const trackX =
    document.querySelector(".scroll-x");

  const trackY =
    document.querySelector(".scroll-y");

  const viewport =
    document.querySelector(".canvas-area");

  if (
    !scrollX ||
    !scrollY ||
    !trackX ||
    !trackY ||
    !viewport
  ) {
    return;
  }

  ui.updateScrollbars = () => {

    const viewW = viewport.clientWidth;
    const viewH = viewport.clientHeight;

    const contentW = ui.engine.drawW;
    const contentH = ui.engine.drawH;

    trackX.style.display = "block";
    trackY.style.display = "block";

    if (!contentW || !contentH) {

      scrollX.style.width = "60px";
      scrollY.style.height = "60px";

      scrollX.style.transform =
        "translateX(0px)";

      scrollY.style.transform =
        "translateY(0px)";

      return;
    }

    const overflowX =
      Math.max(0, contentW - viewW);

    const overflowY =
      Math.max(0, contentH - viewH);

    const trackW =
      trackX.clientWidth;

    const trackH =
      trackY.clientHeight;

    const minSize = 20;

    const thumbW =
      overflowX > 0
        ? Math.max(
            minSize,
            (viewW / contentW) * trackW
          )
        : trackW;

    const thumbH =
      overflowY > 0
        ? Math.max(
            minSize,
            (viewH / contentH) * trackH
          )
        : trackH;

    scrollX.style.width =
      thumbW + "px";

    scrollY.style.height =
      thumbH + "px";

    if (overflowX > 0) {

      const maxX =
        trackW - thumbW;

      const ratioX =
        -ui.engine.offsetX / overflowX;

      ui.scrollPosX =
        ratioX * maxX;

    } else {

      ui.scrollPosX = 0;
    }

    if (overflowY > 0) {

      const maxY =
        trackH - thumbH;

      const ratioY =
        -ui.engine.offsetY / overflowY;

      ui.scrollPosY =
        ratioY * maxY;

    } else {

      ui.scrollPosY = 0;
    }

    scrollX.style.transform =
      `translateX(${ui.scrollPosX}px)`;

    scrollY.style.transform =
      `translateY(${ui.scrollPosY}px)`;
  };

  ui.updateScrollbars();

  scrollX.addEventListener("mousedown", () => {
    ui.draggingX = true;
  });

  scrollY.addEventListener("mousedown", () => {
    ui.draggingY = true;
  });

  window.addEventListener("mousemove", (e) => {

    const viewW = viewport.clientWidth;
    const viewH = viewport.clientHeight;

    const overflowX =
      Math.max(0, ui.engine.drawW - viewW);

    const overflowY =
      Math.max(0, ui.engine.drawH - viewH);

    if (ui.draggingX && overflowX > 0) {

      const max =
        trackX.clientWidth - scrollX.clientWidth;

      ui.scrollPosX += e.movementX;

      ui.scrollPosX =
        Math.max(
          0,
          Math.min(max, ui.scrollPosX)
        );

      scrollX.style.transform =
        `translateX(${ui.scrollPosX}px)`;

      const ratio =
        ui.scrollPosX / max;

      ui.engine.offsetX =
        -(overflowX * ratio);

      ui.engine2.draw(ui.progress);
    }

    if (ui.draggingY && overflowY > 0) {

      const max =
        trackY.clientHeight - scrollY.clientHeight;

      ui.scrollPosY += e.movementY;

      ui.scrollPosY =
        Math.max(
          0,
          Math.min(max, ui.scrollPosY)
        );

      scrollY.style.transform =
        `translateY(${ui.scrollPosY}px)`;

      const ratio =
        ui.scrollPosY / max;

      ui.engine.offsetY =
        -(overflowY * ratio);

      ui.engine2.draw(ui.progress);
    }
  });

  window.addEventListener("mouseup", () => {

    ui.draggingX = false;
    ui.draggingY = false;
  });
}
