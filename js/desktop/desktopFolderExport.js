import {
  getDesktopItems
}
from
"./desktopMemory.js";

import {
  loadDesktopAsset
}
from
"./desktopAssetStore.js?v=desktop-start-minimized-1";

export async function exportDesktopFolder(folderId){

  if(!folderId){
    return;
  }

  const folder =
    findDesktopItemById(
      getDesktopItems(),
      folderId
    );

  if(
    !folder ||
    folder.type !== "folder"
  ){
    return;
  }

  const files = [];
  const manifest =
    folderExportManifest(folder);

  files.push({
    path:"manifest.json",
    blob:new Blob(
      [
        JSON.stringify(
          manifest,
          null,
          2
        )
      ],
      {type:"application/json"}
    )
  });

  await collectFolderExportFiles(
    folder,
    sanitizePathPart(folder.name || "Folder"),
    files
  );

  const zip =
    await createZipBlob(files);

  downloadBlob(
    zip,
    sanitizeFilename(folder.name || "Folder") + ".zip"
  );

}

function folderExportManifest(folder){

  return {
    exportedAt:new Date().toISOString(),
    folder:serializeFolderItemForExport(folder)
  };

}

function serializeFolderItemForExport(item){

  const copy = {
    id:item.id || "",
    type:item.type || "file",
    name:item.name || "Item",
    createdAt:item.createdAt || null
  };

  if(item.type === "workstation-save"){
    copy.save =
      item.save || null;
  }

  if(item.type === "gallery-image-shortcut"){
    copy.src =
      item.src || "";
    copy.galleryAssetId =
      item.galleryAssetId || "";
    copy.galleryLibrary =
      item.galleryLibrary || "";
  }

  if(item.mime){
    copy.mime =
      item.mime;
  }

  if(Number.isFinite(item.size)){
    copy.size =
      item.size;
  }

  if(Array.isArray(item.items)){
    copy.items =
      item.items.map(serializeFolderItemForExport);
  }

  return copy;

}

async function collectFolderExportFiles(folder,basePath,files){

  const children =
    Array.isArray(folder.items)
      ? folder.items
      : [];

  for(const child of children){
    const name =
      sanitizeFilename(
        child.name || child.type || "Item"
      );

    if(child.type === "folder"){
      await collectFolderExportFiles(
        child,
        basePath + "/" + sanitizePathPart(name),
        files
      );
      continue;
    }

    if(child.type === "workstation-save"){
      files.push({
        path:uniqueZipPath(
          files,
          basePath + "/" + replaceExtension(name,"json")
        ),
        blob:new Blob(
          [
            JSON.stringify(
              child.save || child,
              null,
              2
            )
          ],
          {type:"application/json"}
        )
      });

      if(child.previewImage){
        files.push({
          path:uniqueZipPath(
            files,
            basePath + "/" + replaceExtension(name,"preview.png")
          ),
          blob:dataUrlToBlobForExport(child.previewImage)
        });
      }

      if(child.save?.sourceAssetId){
        const source =
          await loadDesktopAsset(
            child.save.sourceAssetId
          );

        if(source){
          files.push({
            path:uniqueZipPath(
              files,
              basePath + "/" + replaceExtension(name,"source.png")
            ),
            blob:dataUrlToBlobForExport(source)
          });
        }
      }

      continue;
    }

    if(
      child.type === "gallery-image-shortcut" &&
      child.src
    ){
      const blob =
        await fetchExportBlob(child.src);

      if(blob){
        files.push({
          path:uniqueZipPath(
            files,
            basePath + "/" + ensureImageExtension(name,blob.type)
          ),
          blob
        });
      }
    }
  }

}

async function fetchExportBlob(src){

  try{
    const response =
      await fetch(src);

    if(!response.ok){
      return null;
    }

    return response.blob();
  }catch(error){
    return null;
  }

}

function dataUrlToBlobForExport(dataUrl){

  const [
    header,
    data
  ] =
    String(dataUrl || "").split(",");

  const mime =
    header
      ?.match(/data:(.*?);base64/)?.[1]
    || "application/octet-stream";

  const binary =
    atob(data || "");

  const bytes =
    new Uint8Array(binary.length);

  for(let i = 0; i < binary.length; i += 1){
    bytes[i] =
      binary.charCodeAt(i);
  }

  return new Blob(
    [bytes],
    {type:mime}
  );

}

async function createZipBlob(files){

  const encoder =
    new TextEncoder();

  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for(const file of files){
    const nameBytes =
      encoder.encode(file.path);

    const data =
      new Uint8Array(
        await file.blob.arrayBuffer()
      );

    const crc =
      crc32(data);

    const local =
      new Uint8Array(30 + nameBytes.length);

    const localView =
      new DataView(local.buffer);

    writeZipHeader(
      localView,
      0x04034b50,
      crc,
      data.length,
      nameBytes.length
    );

    local.set(nameBytes,30);
    localParts.push(local,data);

    const central =
      new Uint8Array(46 + nameBytes.length);

    const centralView =
      new DataView(central.buffer);

    writeZipCentralHeader(
      centralView,
      crc,
      data.length,
      nameBytes.length,
      offset
    );

    central.set(nameBytes,46);
    centralParts.push(central);

    offset +=
      local.length + data.length;
  }

  const centralSize =
    centralParts.reduce(
      (sum,part) => sum + part.length,
      0
    );

  const end =
    new Uint8Array(22);

  const endView =
    new DataView(end.buffer);

  endView.setUint32(0,0x06054b50,true);
  endView.setUint16(8,files.length,true);
  endView.setUint16(10,files.length,true);
  endView.setUint32(12,centralSize,true);
  endView.setUint32(16,offset,true);

  return new Blob(
    [
      ...localParts,
      ...centralParts,
      end
    ],
    {type:"application/zip"}
  );

}

function writeZipHeader(view,signature,crc,size,nameLength){

  view.setUint32(0,signature,true);
  view.setUint16(4,20,true);
  view.setUint16(6,0,true);
  view.setUint16(8,0,true);
  view.setUint16(10,0,true);
  view.setUint16(12,0,true);
  view.setUint32(14,crc,true);
  view.setUint32(18,size,true);
  view.setUint32(22,size,true);
  view.setUint16(26,nameLength,true);
  view.setUint16(28,0,true);

}

function writeZipCentralHeader(view,crc,size,nameLength,offset){

  view.setUint32(0,0x02014b50,true);
  view.setUint16(4,20,true);
  view.setUint16(6,20,true);
  view.setUint16(8,0,true);
  view.setUint16(10,0,true);
  view.setUint16(12,0,true);
  view.setUint16(14,0,true);
  view.setUint32(16,crc,true);
  view.setUint32(20,size,true);
  view.setUint32(24,size,true);
  view.setUint16(28,nameLength,true);
  view.setUint16(30,0,true);
  view.setUint16(32,0,true);
  view.setUint16(34,0,true);
  view.setUint16(36,0,true);
  view.setUint32(38,0,true);
  view.setUint32(42,offset,true);

}

function crc32(bytes){

  let crc = -1;

  for(const byte of bytes){
    crc =
      (crc >>> 8) ^
      CRC_TABLE[(crc ^ byte) & 0xff];
  }

  return (crc ^ -1) >>> 0;

}

const CRC_TABLE =
  (() => {
    const table =
      new Uint32Array(256);

    for(let i = 0; i < 256; i += 1){
      let value = i;

      for(let bit = 0; bit < 8; bit += 1){
        value =
          value & 1
            ? 0xedb88320 ^ (value >>> 1)
            : value >>> 1;
      }

      table[i] =
        value >>> 0;
    }

    return table;
  })();

function downloadBlob(blob,filename){

  const link =
    document.createElement("a");

  const url =
    URL.createObjectURL(blob);

  link.href =
    url;

  link.download =
    filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );

}

function sanitizeFilename(name){

  return String(name || "Item")
    .trim()
    .replace(/[\\/:*?"<>|]+/g,"-")
    .replace(/\s+/g," ")
    || "Item";

}

function sanitizePathPart(name){
  return sanitizeFilename(name).replace(/^\.+$/,"Item");
}

function replaceExtension(name,extension){

  const clean =
    sanitizeFilename(name);

  const suffix =
    "." + extension.replace(/^\./,"");

  return clean.includes(".")
    ? clean.replace(/\.[^.]+$/,suffix)
    : clean + suffix;

}

function ensureImageExtension(name,mime){

  const clean =
    sanitizeFilename(name);

  if(/\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(clean)){
    return clean;
  }

  const ext =
    mime === "image/jpeg"
      ? "jpg"
      : mime === "image/webp"
        ? "webp"
        : mime === "image/gif"
          ? "gif"
          : "png";

  return clean + "." + ext;

}

function uniqueZipPath(files,target){

  const used =
    new Set(files.map(file => file.path));

  if(!used.has(target)){
    return target;
  }

  const slash =
    target.lastIndexOf("/");

  const dir =
    slash >= 0
      ? target.slice(0,slash + 1)
      : "";

  const base =
    slash >= 0
      ? target.slice(slash + 1)
      : target;

  const dot =
    base.lastIndexOf(".");

  const stem =
    dot > 0
      ? base.slice(0,dot)
      : base;

  const ext =
    dot > 0
      ? base.slice(dot)
      : "";

  let index = 2;

  while(used.has(`${dir}${stem} ${index}${ext}`)){
    index += 1;
  }

  return `${dir}${stem} ${index}${ext}`;

}



function findDesktopItemById(
  items,
  id
){

  for(const item of items){
    if(item.id === id){
      return item;
    }

    const children =
      Array.isArray(item.items)
        ? item.items
        : [];

    const match =
      findDesktopItemById(
        children,
        id
      );

    if(match){
      return match;
    }
  }

  return null;

}
