import {
  DELETED_KEY,
  FAVORITES_KEY,
  RECENT_KEY,
  RENAMES_KEY
}
from
"../data/galleryConfig.js?v=gallery-properties-blue-force-1";

export function readFavorites(){

  try{
    return new Set(
      JSON.parse(
        localStorage.getItem(FAVORITES_KEY) || "[]"
      )
    );
  }
  catch(_error){
    return new Set();
  }

}

export function readRecent(){
  return readJsonList(RECENT_KEY);
}

export function readRenames(){
  return readJsonMap(RENAMES_KEY);
}

export function writeFavorites(favorites){

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(
      Array.from(favorites)
    )
  );

}

export function writeRenames(renames){

  localStorage.setItem(
    RENAMES_KEY,
    JSON.stringify(renames)
  );

}

export function writeDeleted(){

  localStorage.removeItem(
    DELETED_KEY
  );

}

export function clearStoredDeletedAssets(){

  localStorage.removeItem(
    DELETED_KEY
  );

}

export function writeRecent(recent){

  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify(recent)
  );

}

function readJsonList(key){

  try{
    const value =
      JSON.parse(
        localStorage.getItem(key) || "[]"
      );

    return Array.isArray(value)
      ? value
      : [];
  }
  catch(_error){
    return [];
  }

}

function readJsonMap(key){

  try{
    const value =
      JSON.parse(
        localStorage.getItem(key) || "{}"
      );

    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  }
  catch(_error){
    return {};
  }

}
