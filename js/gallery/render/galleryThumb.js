export function createThumb(
  asset,
  {
    escapeHtml,
    onSelect
  }
){

  const thumb =
    document.createElement(
      "button"
    );

  thumb.className =
    "gallery-thumb";

  thumb.type =
    "button";

  thumb.dataset.assetId =
    asset.id;

  thumb.dataset.wallpaper =
    asset.src;

  thumb.draggable =
    true;

  thumb.style.webkitUserDrag =
    "element";

  const date =
    asset.date || "-";

  const size =
    typeof asset.size === "number"
      ? `${asset.size} KB`
      : "-";

  const type =
    asset.type || "Image";

  thumb.innerHTML = `
    <img src="${asset.src}" alt="">
    <div class="gallery-thumb-details">
      <div class="gallery-thumb-name">
        ${escapeHtml(asset.name)}
      </div>
      <div class="gallery-thumb-meta gallery-thumb-type">
        ${escapeHtml(type)}
      </div>
      <div class="gallery-thumb-meta gallery-thumb-date">
        ${escapeHtml(date)}
      </div>
      <div class="gallery-thumb-meta gallery-thumb-size">
        ${escapeHtml(size)}
      </div>
    </div>
  `;

  thumb.addEventListener(
    "click",
    () => {
      onSelect(
        asset,
        thumb
      );
    }
  );

  thumb.addEventListener(
    "dragstart",
    event => {
      onSelect(
        asset,
        thumb
      );

      const payload =
        JSON.stringify({
          id: asset.id,
          name: asset.name,
          src: asset.src,
          type: asset.type,
          library: asset.library
        });

      event.dataTransfer?.setData(
        "application/x-glitch-gallery-asset",
        payload
      );

      event.dataTransfer?.setData(
        "text/plain",
        asset.name || "Gallery Image"
      );

      if(event.dataTransfer){
        event.dataTransfer.effectAllowed =
          "copy";
      }
    }
  );

  return thumb;

}

export function createEmptyState(){

  const empty =
    document.createElement(
      "div"
    );

  empty.className =
    "gallery-empty";

  empty.textContent =
    "No items";

  return empty;

}
