export function bindTools(ui) {

  const driftPanel =
    document.querySelector('[data-panel="drift"]');

  const fmPanel =
    document.querySelector('[data-panel="fm"]');

  if (driftPanel) {
    driftPanel.classList.add("active");
  }

  if (fmPanel) {
    fmPanel.classList.remove("active");
  }

  const tools =
    document.querySelectorAll(".tool-cell");

  tools.forEach((btn) => {

    btn.onclick = () => {

      tools.forEach(b => {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      const tool = btn.dataset.tool;

      document
        .querySelectorAll(".panel")
        .forEach(panel => {
          panel.classList.remove("active");
        });

      if (tool === "fm") {

        if (ui.engine2) {
          ui.engine2.mode = "fm";
        }

        const panel =
          document.querySelector('[data-panel="fm"]');

        if (panel) {
          panel.classList.add("active");
        }

        if (ui.engine2) {
          ui.queueRender();
        }

        return;
      }

      if (ui.engine2) {
        ui.engine2.mode = "drift";
      }

      const panel =
        document.querySelector('[data-panel="drift"]');

      if (panel) {
        panel.classList.add("active");
      }

      ui.queueRender();
    };
  });
}
