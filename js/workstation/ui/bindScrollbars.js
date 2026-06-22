export function bindScrollbars(workstation){

  if(
    !workstation.scrollX ||
    !workstation.scrollY ||
    !workstation.trackX ||
    !workstation.trackY
  ){
    return;
  }

  const capSize = 18;
  const arrowStep = 3;
  const repeatDelay = 180;
  const repeatRate = 45;

  let repeatTimeout = null;
  let repeatInterval = null;



  function getMaxMove(axis){
    if(axis === "x"){
      return Math.max(
        0,
        workstation.trackX.clientWidth -
        workstation.scrollX.clientWidth -
        (capSize * 2)
      );
    }

    return Math.max(
      0,
      workstation.trackY.clientHeight -
      workstation.scrollY.clientHeight -
      (capSize * 2)
    );
  }



  function applyScroll(axis, next){
    const viewport =
      workstation.renderer.viewport;

    const maxMove =
      getMaxMove(axis);

    if(axis === "x"){
      viewport.scrollX =
        Math.max(
          0,
          Math.min(
            maxMove,
            next
          )
        );

      const ratio =
        maxMove > 0
          ? viewport.scrollX / maxMove
          : 0;

      viewport.offsetX =
        -(viewport.overflowX * ratio);
    }else{
      viewport.scrollY =
        Math.max(
          0,
          Math.min(
            maxMove,
            next
          )
        );

      const ratio =
        maxMove > 0
          ? viewport.scrollY / maxMove
          : 0;

      viewport.offsetY =
        -(viewport.overflowY * ratio);
    }

    workstation.renderer.render();
  }



  function nudgeScrollbar(axis, direction){
    const viewport =
      workstation.renderer.viewport;

    if(
      axis === "x" &&
      viewport.overflowX <= 0
    ){
      return;
    }

    if(
      axis === "y" &&
      viewport.overflowY <= 0
    ){
      return;
    }

    const current =
      axis === "x"
        ? viewport.scrollX
        : viewport.scrollY;

    applyScroll(
      axis,
      current + direction * arrowStep
    );
  }



  function stopArrowRepeat(){
    if(repeatTimeout){
      clearTimeout(repeatTimeout);
      repeatTimeout = null;
    }

    if(repeatInterval){
      clearInterval(repeatInterval);
      repeatInterval = null;
    }
  }



  function startArrowRepeat(axis, direction){
    stopArrowRepeat();

    nudgeScrollbar(axis, direction);

    repeatTimeout =
      setTimeout(() => {
        repeatInterval =
          setInterval(() => {
            nudgeScrollbar(axis, direction);
          }, repeatRate);
      }, repeatDelay);
  }

  workstation.scrollX.addEventListener(
    "pointerdown",
    (event) => {

      workstation.draggingX =
        true;

      if(workstation.scrollX.setPointerCapture){
        workstation.scrollX.setPointerCapture(
          event.pointerId
        );
      }

      event.preventDefault();
      event.stopPropagation();

    }
  );

  workstation.scrollY.addEventListener(
    "pointerdown",
    (event) => {

      workstation.draggingY =
        true;

      if(workstation.scrollY.setPointerCapture){
        workstation.scrollY.setPointerCapture(
          event.pointerId
        );
      }

      event.preventDefault();
      event.stopPropagation();

    }
  );

  workstation.trackX.addEventListener(
    "pointerdown",
    event => {
      if(event.target === workstation.scrollX){
        return;
      }

      const rect =
        workstation.trackX.getBoundingClientRect();

      const x =
        event.clientX - rect.left;

      if(x <= capSize){
        startArrowRepeat("x", -1);
      }else if(x >= rect.width - capSize){
        startArrowRepeat("x", 1);
      }

      event.preventDefault();
    }
  );

  workstation.trackY.addEventListener(
    "pointerdown",
    event => {
      if(event.target === workstation.scrollY){
        return;
      }

      const rect =
        workstation.trackY.getBoundingClientRect();

      const y =
        event.clientY - rect.top;

      if(y <= capSize){
        startArrowRepeat("y", -1);
      }else if(y >= rect.height - capSize){
        startArrowRepeat("y", 1);
      }

      event.preventDefault();
    }
  );

  window.addEventListener(
    "pointerup",
    event => {

      workstation.draggingX =
        false;

      workstation.draggingY =
        false;

      stopArrowRepeat();

      if(
        workstation.scrollX.hasPointerCapture &&
        workstation.scrollX.hasPointerCapture(
          event.pointerId
        )
      ){
        workstation.scrollX.releasePointerCapture(
          event.pointerId
        );
      }

      if(
        workstation.scrollY.hasPointerCapture &&
        workstation.scrollY.hasPointerCapture(
          event.pointerId
        )
      ){
        workstation.scrollY.releasePointerCapture(
          event.pointerId
        );
      }

    }
  );

  window.addEventListener(
    "pointercancel",
    () => {
      workstation.draggingX = false;
      workstation.draggingY = false;

      stopArrowRepeat();
    }
  );

  window.addEventListener(
    "pointermove",
    (event) => {

      const viewport =
        workstation.renderer.viewport;



      /* =========================
         X
      ========================== */

      if(
        workstation.draggingX &&
        viewport.overflowX > 0
      ){

        const maxMove =
          getMaxMove("x");

        const next =
          viewport.scrollX +
          event.movementX;

        applyScroll(
          "x",
          Math.max(
            0,
            Math.min(
              maxMove,
              next
            )
          )
        );

      }



      /* =========================
         Y
      ========================== */

      if(
        workstation.draggingY &&
        viewport.overflowY > 0
      ){

        const maxMove =
          getMaxMove("y");

        const next =
          viewport.scrollY +
          event.movementY;

        applyScroll(
          "y",
          Math.max(
            0,
            Math.min(
              maxMove,
              next
            )
          )
        );

      }

    }
  );

}
