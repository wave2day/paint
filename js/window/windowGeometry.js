export function getWindowRect(
  win,
  SHADOW
) {

  const rawRect =
    win.getBoundingClientRect();

  return {

    left:
      Math.round(
        rawRect.left + SHADOW
      ),

    top:
      Math.round(
        rawRect.top + SHADOW
      ),

    right:
      Math.round(
        rawRect.right - SHADOW
      ),

    bottom:
      Math.round(
        rawRect.bottom - SHADOW
      ),

    width:
      Math.round(
        rawRect.width - SHADOW * 2
      ),

    height:
      Math.round(
        rawRect.height - SHADOW * 2
      )

  };

}
