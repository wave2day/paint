export function bindLoad(ui) {

  const upload =
    document.getElementById("upload");

  const pickBtn =
    document.getElementById("pickBtn");

  if (!upload || !pickBtn) return;

  pickBtn.onclick = () => {
    upload.click();
  };

  upload.onchange = (e) => {

    ui.stop();

    ui.progress = 0;

    ui.scrollPosX = 0;
    ui.scrollPosY = 0;

    ui.engine.load(

      e.target.files,

      () => {},

      () => {

        ui.progress = 0;

        ui.resetScrollbars();

        if (ui.updateScrollbars) {
          ui.updateScrollbars();
        }

        if (ui.engine2) {
          ui.engine2.mode = "drift";
        }

        if (ui.engine2) {
          ui.engine2.draw(0);
        }
      }
    );
  };
}
