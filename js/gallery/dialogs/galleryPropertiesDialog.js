export function openGalleryPropertiesDialog({
  asset,
  escapeHtml,
  sourcePath
}){

  const content =
    document.createElement("div");

  content.className =
    "gallery-properties-dialog";

  content.innerHTML = `
    <div><b>Name:</b> ${escapeHtml(asset.name)}</div>
    <div><b>Type:</b> ${escapeHtml(asset.type)}</div>
    <div><b>Date:</b> ${escapeHtml(asset.date)}</div>
    <div><b>Size:</b> ${asset.size} KB</div>
    <div><b>Source:</b> ${escapeHtml(sourcePath)}</div>
  `;

  window.openDialogWindow?.({
    id:`gallery-properties-${asset.id}`,
    title:"Properties",
    content,
    left:310,
    top:170,
    width:390,
    height:210
  });

}
