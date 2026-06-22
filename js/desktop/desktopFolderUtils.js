export function findDesktopItemById(
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

export function updateDesktopItemTree(
  items,
  id,
  data
){
  return items.map(item => {
    if(item.id === id){
      return {
        ...item,
        ...data
      };
    }

    if(Array.isArray(item.items)){
      return {
        ...item,
        items: updateDesktopItemTree(
          item.items,
          id,
          data
        )
      };
    }

    return item;
  });
}

export function uniqueFolderChildName(
  name,
  children
){
  const baseName =
    String(name || "File").trim()
    || "File";

  const used =
    new Set(
      children.map(child => child.name)
    );

  if(!used.has(baseName)){
    return baseName;
  }

  const dotIndex =
    baseName.lastIndexOf(".");

  const stem =
    dotIndex > 0
      ? baseName.slice(0,dotIndex)
      : baseName;

  const extension =
    dotIndex > 0
      ? baseName.slice(dotIndex)
      : "";

  let index = 2;
  let candidate =
    `${stem} ${index}${extension}`;

  while(used.has(candidate)){
    index += 1;
    candidate =
      `${stem} ${index}${extension}`;
  }

  return candidate;
}

export function getNextFolderWindowPosition(){

  const desktop =
    document.querySelector(".desktop");

  const openFolderWindows =
    Array
      .from(
        document.querySelectorAll(
          '.dialog-window[data-dialog-id^="folder-window-"]'
        )
      )
      .filter(dialog => {
        return getComputedStyle(dialog).display !== "none";
      });

  const index =
    openFolderWindows.length;

  const baseLeft = 220;
  const baseTop = 140;
  const stepLeft = 32;
  const stepTop = 28;
  const cycle = 8;

  const offset =
    index % cycle;

  const rawLeft =
    baseLeft + offset * stepLeft;

  const rawTop =
    baseTop + offset * stepTop;

  if(!desktop){
    return {
      left: rawLeft,
      top: rawTop
    };
  }

  const maxLeft =
    Math.max(24, desktop.clientWidth - 380);

  const maxTop =
    Math.max(24, desktop.clientHeight - 300);

  return {
    left: Math.min(rawLeft, maxLeft),
    top: Math.min(rawTop, maxTop)
  };

}
