export function createBuffer(w = 1, h = 1) {

  const canvas =
    document.createElement("canvas");

  canvas.width = w;
  canvas.height = h;

  const ctx =
    canvas.getContext(
      "2d",
      { willReadFrequently: true }
    );

  return {
    canvas,
    ctx
  };
}