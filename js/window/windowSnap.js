export function applyWindowSnap(
  nextX,
  nextY,
  rect,
  windows,
  currentWindow,
  SNAP,
  SHADOW
) {

  let snappedX = false;
  let snappedY = false;

  for (const other of windows) {

    if (other === currentWindow) {
      continue;
    }

    const rawOtherRect =
      other.getBoundingClientRect();

    const otherRect = {

      left:
        rawOtherRect.left + SHADOW,

      top:
        rawOtherRect.top + SHADOW,

      right:
        rawOtherRect.right - SHADOW,

      bottom:
        rawOtherRect.bottom - SHADOW,

      width:
        rawOtherRect.width - SHADOW * 2,

      height:
        rawOtherRect.height - SHADOW * 2

    };

    const currentWidth =
      rect.width;

    const currentHeight =
      rect.height;

    const snapLeft =
      Math.abs(
        (nextX + currentWidth)
        - otherRect.left
      ) < SNAP;

    const snapRight =
      Math.abs(
        nextX
        - otherRect.right
      ) < SNAP;

    const snapTop =
      Math.abs(
        nextY
        - otherRect.top
      ) < SNAP;

    const snapBottom =
      Math.abs(
        (nextY + currentHeight)
        - otherRect.top
      ) < SNAP;



    /* =========================
       TOP RIGHT CORNER
    ========================== */

    if (
      snapLeft &&
      snapTop
    ) {

      nextX =
        otherRect.left
        - currentWidth;

      nextY =
        otherRect.top;

      snappedX = true;
      snappedY = true;

      break;

    }



    /* =========================
       BOTTOM RIGHT CORNER
    ========================== */

    if (
      snapLeft &&
      snapBottom
    ) {

      nextX =
        otherRect.left
        - currentWidth;

      nextY =
        otherRect.top
        - currentHeight;

      snappedX = true;
      snappedY = true;

      break;

    }



    /* =========================
       LEFT -> RIGHT
    ========================== */

    if (
      !snappedX &&
      snapLeft
    ) {

      nextX =
        otherRect.left
        - currentWidth;

      snappedX = true;

    }



    /* =========================
       RIGHT -> LEFT
    ========================== */

    if (
      !snappedX &&
      snapRight
    ) {

      nextX =
        otherRect.right;

      snappedX = true;

    }



    /* =========================
       LEFT -> LEFT
    ========================== */

    if (
      !snappedX &&
      Math.abs(
        nextX
        - otherRect.left
      ) < SNAP
    ) {

      nextX =
        otherRect.left - 16;

      snappedX = true;

    }



    /* =========================
       TOP -> TOP
    ========================== */

    if (
      !snappedY &&
      snapTop
    ) {

      nextY =
        otherRect.top - 16;

      snappedY = true;

    }



    /* =========================
       BOTTOM -> TOP
    ========================== */

    if (
      !snappedY &&
      Math.abs(
        (nextY + currentHeight)
        - otherRect.top
      ) < SNAP
    ) {

      nextY =
        otherRect.top
        - currentHeight;

      snappedY = true;

    }



    /* =========================
       TOP -> BOTTOM
    ========================== */

    if (
      !snappedY &&
      Math.abs(
        nextY
        - otherRect.bottom
      ) < SNAP
    ) {

      nextY =
        otherRect.bottom;

      snappedY = true;

    }

  }

  return {
    x: nextX,
    y: nextY
  };

}
