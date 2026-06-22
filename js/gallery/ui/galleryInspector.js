export function clearInspector(libraryPath){

  const preview =
    document.querySelector(
      ".gallery-preview-image"
    );

  const name =
    document.querySelector(
      ".gallery-selected-name"
    );

  const meta =
    document.querySelector(
      ".gallery-selected-meta"
    );

  const source =
    document.querySelector(
      ".gallery-selected-source"
    );

  if(preview){
    preview.removeAttribute("src");
  }

  if(name){
    name.textContent =
      "No item selected";
  }

  if(meta){
    meta.textContent =
      "Select an asset from the library.";
  }

  if(source){
    source.textContent =
      `Source: ${libraryPath}`;
  }

}

export function updateInspector(asset, galleryLibraries){

  const preview =
    document.querySelector(
      ".gallery-preview-image"
    );

  const name =
    document.querySelector(
      ".gallery-selected-name"
    );

  const meta =
    document.querySelector(
      ".gallery-selected-meta"
    );

  const source =
    document.querySelector(
      ".gallery-selected-source"
    );

  if(preview){
    preview.src =
      asset.src;
  }

  if(name){
    name.textContent =
      asset.name;
  }

  if(meta){
    meta.textContent =
      `${asset.type}\nDate: ${asset.date}\nSize: ${asset.size} KB`;
  }

  if(source){
    source.textContent =
      `Source: ${galleryLibraries[asset.library].path}`;
  }

}
