export function openAssetInWorkstation(asset, source){
  if(!asset?.src){
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "workstation:open-image",
      {
        detail: {
          id: asset.id,
          src: asset.src,
          name: asset.name,
          type: asset.type,
          source
        }
      }
    )
  );

  window.restoreWindow?.(
    "workstation"
  );
}

export function openAssetInPixel(asset, source){
  if(!asset?.src){
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "pixel:open-image",
      {
        detail: {
          id: asset.id,
          src: asset.src,
          name: asset.name,
          type: asset.type,
          source
        }
      }
    )
  );

  window.restoreWindow?.(
    "pixel"
  );
}

export function moveAssetToDesktop(asset){
  if(!asset?.src){
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "desktop:add-gallery-image-shortcut",
      {
        detail: {
          id: asset.id,
          src: asset.src,
          name: asset.name,
          type: asset.type,
          library: asset.library
        }
      }
    )
  );
}
