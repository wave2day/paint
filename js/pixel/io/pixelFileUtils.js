import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_TYPES
}
from
"../config/pixelConfig.js?v=pixel-modules-3";

export function inferImageMimeType(name = ""){

  const clean =
    String(name).toLowerCase();

  if(clean.endsWith(".jpg") || clean.endsWith(".jpeg")){
    return "image/jpeg";
  }

  if(clean.endsWith(".webp")){
    return "image/webp";
  }

  if(clean.endsWith(".gif")){
    return "image/gif";
  }

  if(clean.endsWith(".bmp")){
    return "image/bmp";
  }

  return "image/png";

}

export function isAcceptedImage(file){
  if(file.type && ACCEPTED_TYPES.has(file.type)){
    return true;
  }

  return ACCEPTED_EXTENSIONS.test(
    file.name || ""
  );
}
