export function openGalleryRenameDialog({
  asset,
  escapeHtml,
  ensureImageName,
  onRename
}){

  const content =
    document.createElement("form");

  content.className =
    "gallery-rename-dialog";

  content.innerHTML = `
    <label>
      Name
      <input
        class="gallery-rename-input"
        type="text"
        value="${escapeHtml(asset.name)}"
      >
    </label>
    <div class="gallery-rename-actions">
      <button type="button" class="gallery-rename-cancel">
        Cancel
      </button>
      <button type="submit">
        Rename
      </button>
    </div>
  `;

  window.openDialogWindow?.({
    id:"gallery-rename",
    title:"Rename",
    content,
    left:300,
    top:190,
    width:360,
    height:170
  });

  const input =
    content.querySelector(
      ".gallery-rename-input"
    );

  input?.focus();
  input?.select();

  content.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const nextName =
        ensureImageName(
          input.value.trim(),
          asset.name
        );

      if(!nextName){
        return;
      }

      onRename(
        asset,
        nextName
      );

      window.closeDialogWindow?.(
        "gallery-rename"
      );
    }
  );

  content
    .querySelector(".gallery-rename-cancel")
    ?.addEventListener(
      "click",
      () => {
        window.closeDialogWindow?.(
          "gallery-rename"
        );
      }
    );

}
