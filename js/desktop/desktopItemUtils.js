const ICON_LABEL_HEAD = 13;
const ICON_LABEL_TOTAL = 26;
const ICON_LABEL_TAIL_VISIBLE = 9;

export function getCompactIconLabel(name, fallback = "Item"){

  const text =
    String(name || fallback).trim() || fallback;

  if(text.length <= ICON_LABEL_TOTAL){
    return text;
  }

  const dotIndex =
    text.lastIndexOf(".");

  const extensionLength =
    dotIndex > 0
      ? text.length - dotIndex
      : 0;

  const tailLength =
    extensionLength > 1 && extensionLength <= 6
      ? Math.max(
          ICON_LABEL_TAIL_VISIBLE,
          extensionLength + 4
        )
      : ICON_LABEL_TAIL_VISIBLE;

  const tail =
    text.slice(-tailLength);

  const head =
    text.slice(
      0,
      ICON_LABEL_HEAD
    );

  return `${head}\n...${tail}`;

}

export function setIconLabel(label, name, fallback){

  const text =
    String(name || fallback || "Item").trim() ||
    fallback ||
    "Item";

  label.textContent =
    getCompactIconLabel(
      text,
      fallback || "Item"
    );

  label.title =
    text;

}

export function normalizeFolderName(name){

  const clean =
    String(name || "")
      .trim()
      .replace(/\s+/g," ");

  return clean || "New Folder";

}

export function normalizeDesktopItemName(name){

  const clean =
    String(name || "")
      .trim()
      .replace(/\s+/g," ");

  return clean || "Desktop Item";

}

export function uniqueDesktopItemName(
  name,
  items
){

  const names =
    new Set(
      items
        .map(item => item.name)
    );

  if(!names.has(name)){
    return name;
  }

  let index = 2;

  while(names.has(`${name} ${index}`)){
    index += 1;
  }

  return `${name} ${index}`;

}

export function createDesktopItemId(prefix){

  return [
    prefix,
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2,8)
  ].join("-");

}

export function cssEscape(value){

  if(window.CSS?.escape){
    return window.CSS.escape(
      String(value)
    );
  }

  return String(value)
    .replace(/["\\]/g,"\\$&");

}

export function createShortcutBadge(){

  const badge =
    document.createElement("div");

  badge.className =
    "desktop-shortcut";

  badge.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 111.01 111.08"
    >
      <path
        fill="#ffffff"
        d="M110.65,0L13.28.57c-6.76,0-12.76,6.78-12.76,13.66l-.52,96.61,95.37.24c8.55.02,15.64-5.16,15.64-14.65l-.36-96.43Z"
      />
      <path
        fill="#000000"
        d="M110.65,0L13.28.57c-6.76,0-12.76,6.78-12.76,13.66l-.52,96.61,95.37.24c8.55.02,15.64-5.16,15.64-14.65l-.36-96.43ZM103.34,8.21l-.03,89.28c0,3.25-3.23,5.59-6.18,6l-89.28-.39.35-89.01c0-3.27,2.99-5.68,5.95-6.08l89.19.21Z"
      />
      <path
        fill="#000000"
        d="M90.57,21.02h-41.66c3.85,4.28,7.69,8.57,11.54,12.85C41.62,49.03.46,68.97,29.16,95.54c.27.25.8.02.68-.32-3.82-10.96,36.79-35.13,47.41-42.65h0c4.44,4.94,8.88,9.89,13.32,14.83V21.02Z"
      />
    </svg>
  `;

  return badge;

}
