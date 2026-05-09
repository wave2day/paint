export function createBuffer(w, h) {

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
