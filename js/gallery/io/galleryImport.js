const IMAGE_FILE_PATTERN =
  /\.(png|jpe?g|gif|webp)$/i;

export async function importGalleryImages({
  files,
  assets,
  library = "archive"
}){
  let added =
    0;

  for(const file of files){
    if(!isImageFile(file)){
      continue;
    }

    const src =
      await fileToDataUrl(file);

    assets.push({
      id:`import-${Date.now()}-${added}`,
      src,
      name:file.name,
      type:file.type || "Image",
      library,
      collections:[],
      date:
        new Date(file.lastModified || Date.now())
          .toISOString()
          .slice(0, 10),
      size:Math.round(file.size / 1024)
    });

    added += 1;
  }

  return added;
}

export function pickGalleryImages(){
  return pickFiles({
    multiple:true,
    webkitdirectory:false
  });
}

export function pickGalleryFolder(){
  return pickFiles({
    multiple:true,
    webkitdirectory:true
  });
}

function pickFiles({
  multiple,
  webkitdirectory
}){
  return new Promise(resolve => {
    const input =
      document.createElement("input");

    input.type =
      "file";

    input.accept =
      "image/png,image/jpeg,image/gif,image/webp";

    input.multiple =
      multiple;

    if(webkitdirectory){
      input.webkitdirectory =
        true;
    }

    input.addEventListener(
      "change",
      () => {
        resolve(
          Array.from(input.files || [])
        );
      },
      {
        once:true
      }
    );

    input.click();
  });
}

function isImageFile(file){
  return (
    file?.type?.startsWith("image/") ||
    IMAGE_FILE_PATTERN.test(file?.name || "")
  );
}

function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader =
      new FileReader();

    reader.onload =
      () => resolve(reader.result);

    reader.onerror =
      () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}


export function bindGalleryImportedAssetEvents({
  assets,
  onImported
}){

  if(
    window.galleryWorkstationEventsBound
  ){
    return;
  }

  window.galleryWorkstationEventsBound =
    true;

  window.addEventListener(
    "gallery:add-asset",
    event => {

      const asset =
        event.detail;

      if(!asset?.src){
        return;
      }

      const id =
        `workstation-${Date.now()}`;

      assets.push({
        id,
        src: asset.src,
        name:
          asset.name ||
          "glitch-workstation.png",
        type:
          asset.type ||
          "PNG Image",
        library:
          "glitch",
        collections:[
          "glitch-collection"
        ],
        date:
          new Date()
            .toISOString()
            .slice(0, 10),
        size:
          Math.round(
            asset.src.length / 1024
          )
      });

      onImported?.(id);

    }
  );

}
