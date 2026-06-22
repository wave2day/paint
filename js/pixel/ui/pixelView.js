export function renderOriginalPreview(refs, src){
  refs.stages.original.innerHTML = "";

  const img =
    document.createElement("img");

  img.src = src;
  img.alt = "Original image";

  refs.stages.original.appendChild(img);
}

export function renderMini(target, svg){
  target.innerHTML =
    svg;
}

export function renderCanvasMini(target, canvas){
  target.innerHTML = "";

  const copy =
    document.createElement("canvas");

  copy.width = canvas.width;
  copy.height = canvas.height;
  copy.getContext("2d").drawImage(canvas, 0, 0);

  target.appendChild(copy);
}

export function clearMini(refs){
  Object.values(refs.mini)
    .forEach(item => {
      item.innerHTML = "";
    });

  Object.values(refs.miniText)
    .forEach(item => {
      item.textContent = "-";
    });
}

export function setDownloads(refs, enabled){
  refs.downloads.forEach(button => {
    button.disabled = !enabled;
  });
}

export function setInfo(refs, values){
  refs.info.innerHTML =
    Object.entries(values)
      .map(([key, value]) => (
        `<span>${escapeHtml(key)}</span><span>${escapeHtml(value)}</span>`
      ))
      .join("");

  const status =
    document.querySelector("[data-pixel-status]");

  if(status && values.Status){
    status.textContent =
      values.Status;
  }
}

function escapeHtml(value){
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
