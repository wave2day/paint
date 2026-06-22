const DB_NAME =
  "glitch-desktop-assets";

const DB_VERSION =
  1;

const STORE_NAME =
  "assets";

export async function saveDesktopAsset(
  id,
  dataUrl
){

  if(!id || !dataUrl){
    return null;
  }

  const db =
    await openAssetDatabase();

  const blob =
    dataUrlToBlob(dataUrl);

  await writeAsset(
    db,
    {
      id,
      blob,
      type: blob.type || "image/png",
      createdAt: Date.now()
    }
  );

  return id;

}

export async function loadDesktopAsset(
  id
){

  if(!id){
    return null;
  }

  const db =
    await openAssetDatabase();

  const record =
    await readAsset(
      db,
      id
    );

  if(!record?.blob){
    return null;
  }

  return blobToDataUrl(
    record.blob
  );

}

export async function deleteDesktopAsset(id){

  if(!id){
    return;
  }

  const db =
    await openAssetDatabase();

  await deleteAsset(
    db,
    id
  );

}

function openAssetDatabase(){

  return new Promise((resolve,reject) => {

    const request =
      indexedDB.open(
        DB_NAME,
        DB_VERSION
      );

    request.onupgradeneeded =
      () => {
        const db =
          request.result;

        if(!db.objectStoreNames.contains(STORE_NAME)){
          db.createObjectStore(
            STORE_NAME,
            {
              keyPath: "id"
            }
          );
        }
      };

    request.onsuccess =
      () => {
        resolve(
          request.result
        );
      };

    request.onerror =
      () => {
        reject(
          request.error
        );
      };

  });

}

function writeAsset(db,record){

  return new Promise((resolve,reject) => {

    const transaction =
      db.transaction(
        STORE_NAME,
        "readwrite"
      );

    transaction
      .objectStore(STORE_NAME)
      .put(record);

    transaction.oncomplete =
      resolve;

    transaction.onerror =
      () => {
        reject(
          transaction.error
        );
      };

  });

}

function readAsset(db,id){

  return new Promise((resolve,reject) => {

    const request =
      db
        .transaction(STORE_NAME)
        .objectStore(STORE_NAME)
        .get(id);

    request.onsuccess =
      () => {
        resolve(
          request.result || null
        );
      };

    request.onerror =
      () => {
        reject(
          request.error
        );
      };

  });

}

function deleteAsset(db,id){

  return new Promise((resolve,reject) => {

    const transaction =
      db.transaction(
        STORE_NAME,
        "readwrite"
      );

    transaction
      .objectStore(STORE_NAME)
      .delete(id);

    transaction.oncomplete =
      resolve;

    transaction.onerror =
      () => {
        reject(
          transaction.error
        );
      };

  });

}

function dataUrlToBlob(dataUrl){

  const [
    header,
    data
  ] =
    dataUrl.split(",");

  const mime =
    header
      .match(/data:(.*?);base64/)?.[1]
    || "application/octet-stream";

  const binary =
    atob(data);

  const bytes =
    new Uint8Array(binary.length);

  for(let i = 0; i < binary.length; i += 1){
    bytes[i] =
      binary.charCodeAt(i);
  }

  return new Blob(
    [bytes],
    {
      type: mime
    }
  );

}

function blobToDataUrl(blob){

  return new Promise((resolve,reject) => {

    const reader =
      new FileReader();

    reader.onload =
      () => {
        resolve(
          reader.result
        );
      };

    reader.onerror =
      () => {
        reject(
          reader.error
        );
      };

    reader.readAsDataURL(blob);

  });

}
