function setPressed(element, active){
  if(element.tagName !== "BUTTON"){
    element.classList.remove(
      "active"
    );
    return;
  }

  element.classList.toggle(
    "active",
    active
  );

  if(element.tagName === "BUTTON"){
    element.setAttribute(
      "aria-pressed",
      active ? "true" : "false"
    );
  }
}

function applyActiveState(state){
  document
    .querySelectorAll("[data-gallery-view]")
    .forEach(item => {
      setPressed(
        item,
        item.dataset.galleryView === state.view
      );
    });

  document
    .querySelectorAll("[data-gallery-thumb-size]")
    .forEach(item => {
      setPressed(
        item,
        item.dataset.galleryThumbSize === state.thumbSize
      );
    });

  document
    .querySelectorAll("[data-gallery-toggle-panel]")
    .forEach(item => {
      setPressed(
        item,
        state.previewPanel
      );
    });

  document
    .querySelectorAll("[data-gallery-toggle-fullscreen]")
    .forEach(item => {
      setPressed(
        item,
        state.fullscreen
      );
    });
}

export function applyGalleryViewState(state){
  const root =
    document.querySelector(".gallery");

  const grid =
    document.querySelector(".gallery-grid");

  if(root){
    root.dataset.galleryView =
      state.view;

    root.dataset.galleryThumbSize =
      state.thumbSize;

    root.classList.toggle(
      "gallery-preview-panel-hidden",
      !state.previewPanel
    );

    root.classList.toggle(
      "gallery-fullscreen-mode",
      state.fullscreen
    );
  }

  if(grid){
    grid.dataset.galleryView =
      state.view;

    grid.dataset.galleryThumbSize =
      state.thumbSize;
  }

  applyActiveState(state);
}

export function bindGalleryViewControls({
  state,
  onChange
}){
  const apply = () => {
    if(typeof onChange === "function"){
      onChange();
      return;
    }

    applyGalleryViewState(state);
  };

  document
    .querySelectorAll("[data-gallery-view]")
    .forEach(item => {
      if(item.dataset.bound === "1"){
        return;
      }

      item.dataset.bound =
        "1";

      item.addEventListener(
        "click",
        () => {
          state.view =
            item.dataset.galleryView === "list"
              ? "list"
              : "grid";

          apply();
        }
      );
    });

  document
    .querySelectorAll("[data-gallery-thumb-size]")
    .forEach(item => {
      if(item.dataset.bound === "1"){
        return;
      }

      item.dataset.bound =
        "1";

      item.addEventListener(
        "click",
        () => {
          state.thumbSize =
            item.dataset.galleryThumbSize === "small"
              ? "small"
              : "large";

          apply();
        }
      );
    });

  document
    .querySelectorAll("[data-gallery-toggle-panel]")
    .forEach(item => {
      if(item.dataset.bound === "1"){
        return;
      }

      item.dataset.bound =
        "1";

      item.addEventListener(
        "click",
        () => {
          state.previewPanel =
            !state.previewPanel;

          apply();
        }
      );
    });

  document
    .querySelectorAll("[data-gallery-toggle-fullscreen]")
    .forEach(item => {
      if(item.dataset.bound === "1"){
        return;
      }

      item.dataset.bound =
        "1";

      item.addEventListener(
        "click",
        () => {
          state.fullscreen =
            !state.fullscreen;

          apply();
        }
      );
    });

  applyGalleryViewState(state);
}
