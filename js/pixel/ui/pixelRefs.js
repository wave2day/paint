export function collectRefs(root){
  return {
    root,
    dropzone:root.querySelector("[data-pixel-dropzone]"),
    upload:root.querySelector("[data-pixel-upload]"),
    convert:root.querySelector("[data-pixel-convert]"),
    info:root.querySelector("[data-pixel-info]"),
    workspace:root.querySelector("[data-pixel-workspace]"),
    strip:root.querySelector("[data-pixel-strip]"),
    workflowButtons:[...root.querySelectorAll("[data-pixel-workflow-button]")],
    previews:Object.fromEntries(
      [...root.querySelectorAll("[data-pixel-preview]")]
        .map(item => [
          item.dataset.pixelPreview,
          item
        ])
    ),
    controls:Object.fromEntries(
      [...root.querySelectorAll("[data-pixel-control]")]
        .map(control => [
          control.dataset.pixelControl,
          control
        ])
    ),
    alphaCut:root.querySelector("[data-pixel-alpha-cut]"),
    badges:{
      original:root.querySelector('[data-pixel-badge="original"]'),
      svg:root.querySelector('[data-pixel-badge="svg"]')
    },
    stages:{
      original:root.querySelector('[data-pixel-stage="original"]'),
      svg:root.querySelector('[data-pixel-stage="svg"]')
    },
    mini:Object.fromEntries(
      [...root.querySelectorAll("[data-pixel-mini]")]
        .map(item => [
          item.dataset.pixelMini,
          item
        ])
    ),
    miniText:Object.fromEntries(
      [...root.querySelectorAll("[data-pixel-mini-text]")]
        .map(item => [
          item.dataset.pixelMiniText,
          item
        ])
    ),
    workflowPanels:[...root.querySelectorAll("[data-pixel-workflow-panel]")],
    ranges:[...root.querySelectorAll("[data-pixel-range]")],
    downloads:[...root.querySelectorAll("[data-pixel-download]")]
  };
}
