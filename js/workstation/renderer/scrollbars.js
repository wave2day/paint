export function updateScrollbars(renderer){

  const viewport =
    renderer.viewport;

  const workstation =
    renderer.workstation;

  const trackX =
    workstation.trackX;

  const trackY =
    workstation.trackY;

  const thumbX =
    workstation.scrollX;

  const thumbY =
    workstation.scrollY;

  if(
    !trackX ||
    !trackY ||
    !thumbX ||
    !thumbY
  ){
    return;
  }

  const thumbSize = 60;

  const capSize = 18;



  /* =========================
     X
  ========================== */

  if(viewport.overflowX > 0){

    const maxMove =
      trackX.clientWidth -
      thumbSize -
      (capSize * 2);

    thumbX.style.width =
      `${thumbSize}px`;

    thumbX.style.opacity =
      "1";

    thumbX.style.pointerEvents =
      "auto";

    viewport.scrollX =
      Math.max(
        0,
        Math.min(
          maxMove,
          viewport.scrollX
        )
      );

    thumbX.style.transform =
      `translateX(${viewport.scrollX}px)`;

  }else{

    viewport.scrollX = 0;

    thumbX.style.width =
      `${thumbSize}px`;

    thumbX.style.opacity =
      ".35";

    thumbX.style.pointerEvents =
      "none";

    thumbX.style.transform =
      "translateX(0px)";

  }



  /* =========================
     Y
  ========================== */

  if(viewport.overflowY > 0){

    const maxMove =
      trackY.clientHeight -
      thumbSize -
      (capSize * 2);

    thumbY.style.height =
      `${thumbSize}px`;

    thumbY.style.opacity =
      "1";

    thumbY.style.pointerEvents =
      "auto";

    viewport.scrollY =
      Math.max(
        0,
        Math.min(
          maxMove,
          viewport.scrollY
        )
      );

    thumbY.style.transform =
      `translateY(${viewport.scrollY}px)`;

  }else{

    viewport.scrollY = 0;

    thumbY.style.height =
      `${thumbSize}px`;

    thumbY.style.opacity =
      ".35";

    thumbY.style.pointerEvents =
      "none";

    thumbY.style.transform =
      "translateY(0px)";

  }

}
