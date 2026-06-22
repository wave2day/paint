export function buildResizeGrip(grip) {

  if (!grip) return;

  if (
    grip.dataset.ready === "1"
  ) return;

  grip.dataset.ready = "1";

  const size = 4;
  const scale = 0.5;

  const rows = [
    { count: 4,  x: 48 },
    { count: 8,  x: 32 },
    { count: 12, x: 16 },
    { count: 16, x: 0  }
  ];



  function addPixel(
    x,
    y,
    cls
  ) {

    const p =
      document.createElement("i");

    p.className =
      "pixel " + cls;

    p.style.left =
      x + "px";

    p.style.bottom =
      y + "px";

    grip.appendChild(p);

  }



  rows.forEach(row => {

    for (
      let i = 0;
      i < row.count;
      i++
    ) {

      const baseX =
        row.x + i * size;

      const baseY =
        i * size;

      const x =
        baseX * scale;

      const y =
        baseY * scale;

      addPixel(
        x,
        y,
        "white"
      );

      if (
        i !== row.count - 1
      ) {

        addPixel(
          x + size * scale,
          y,
          "dark-main"
        );

        addPixel(
          x + size * scale,
          y - size * scale,
          "dark-flat"
        );

      }

    }

  });

}