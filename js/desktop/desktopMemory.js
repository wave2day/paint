const STORAGE_KEY =
  "glitch-desktop-memory";

export function loadDesktopMemory() {

  return JSON.parse(
    localStorage.getItem(
      STORAGE_KEY
    ) || "{}"
  );

}

export function saveDesktopMemory(memory) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(memory)
  );

}

export function getIconMemory(id) {

  const memory =
    loadDesktopMemory();

  return memory.icons?.[id] || null;

}

export function setIconMemory(id, data) {

  const memory =
    loadDesktopMemory();

  if (!memory.icons) {
    memory.icons = {};
  }

  memory.icons[id] = {
    ...memory.icons[id],
    ...data
  };

  saveDesktopMemory(memory);

}

export function getDesktopItems(){

  const memory =
    loadDesktopMemory();

  return Array.isArray(memory.items)
    ? memory.items
    : [];

}

export function setDesktopItems(items){

  const memory =
    loadDesktopMemory();

  memory.items =
    Array.isArray(items)
      ? items
      : [];

  saveDesktopMemory(memory);

}

export function addDesktopItem(item){

  const items =
    getDesktopItems();

  setDesktopItems([
    ...items,
    item
  ]);

}

export function updateDesktopItem(id,data){

  const items =
    getDesktopItems()
      .map(item => {

        if(item.id !== id){
          return item;
        }

        return {
          ...item,
          ...data
        };

      });

  setDesktopItems(items);

}

export function deleteDesktopItem(id){

  const items =
    getDesktopItems()
      .filter(item => item.id !== id);

  setDesktopItems(items);

}

export function getWallpaperMemory(){

  const memory =
    loadDesktopMemory();

  return memory.wallpaper || null;

}



export function setWallpaperMemory(data){

  const memory =
    loadDesktopMemory();

  memory.wallpaper = data;

  saveDesktopMemory(memory);

}
