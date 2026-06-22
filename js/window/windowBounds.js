export function clampWindowPosition(
  nextX,
  nextY,
  rect,
  SAFE
) {

  const maxX =
    window.innerWidth
    - rect.width
    - SAFE;

  const maxY =
    window.innerHeight
    - rect.height
    - SAFE;

  return {

    x: Math.max(
      SAFE,
      Math.min(
        maxX,
        nextX
      )
    ),

    y: Math.max(
      SAFE,
      Math.min(
        maxY,
        nextY
      )
    )

  };

}