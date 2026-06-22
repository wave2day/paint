const PROJECT_GALLERY_FOLDERS = [
  {
    url:"./media/wallpapers/",
    library:"wallpapers",
    type:"Wallpaper",
    collections:[
      "glitch-collection"
    ]
  },
  {
    url:"./media/img/",
    library:"glitch",
    type:"Glitch Output",
    collections:[
      "glitch-collection"
    ]
  }
];

const IMAGE_FILE_PATTERN =
  /\.(png|jpe?g|gif|webp)$/i;

export async function scanProjectGalleryFolders({
  assets,
  localDeleted
}){
  let added =
    0;

  for(const folder of PROJECT_GALLERY_FOLDERS){
    const files =
      await readDirectoryImageNames(folder.url);

    files.forEach(file => {
      if(
        addProjectFolderAsset({
          assets,
          localDeleted,
          folder,
          file
        })
      ){
        added += 1;
      }
    });
  }

  return added;
}

async function readDirectoryImageNames(url){
  try{
    const response =
      await fetch(
        url,
        {
          cache:"no-store"
        }
      );

    if(!response.ok){
      return [];
    }

    const html =
      await response.text();

    return Array
      .from(
        html.matchAll(/href="([^"]+)"/gi)
      )
      .map(match => decodeDirectoryFileName(match[1]))
      .filter(Boolean)
      .filter(file => IMAGE_FILE_PATTERN.test(file));
  }
  catch(_error){
    return [];
  }
}

function decodeDirectoryFileName(href){
  const cleanHref =
    href.split(/[?#]/)[0];

  if(
    !cleanHref ||
    cleanHref === "../" ||
    cleanHref.endsWith("/")
  ){
    return "";
  }

  try{
    return decodeURIComponent(
      cleanHref.split("/").pop()
    );
  }
  catch(_error){
    return cleanHref.split("/").pop();
  }
}

function addProjectFolderAsset({
  assets,
  localDeleted,
  folder,
  file
}){
  const src =
    `${folder.url}${encodeURIComponent(file)}`;

  const existing =
    assets.find(
      asset => normalizeAssetSrc(asset.src) === normalizeAssetSrc(src)
    );

  if(existing){
    localDeleted?.delete(existing.id);
    return false;
  }

  assets.push({
    id:createProjectAssetId(folder.library, file),
    src,
    name:file,
    type:folder.type,
    library:folder.library,
    collections:[
      ...folder.collections
    ],
    date:
      new Date()
        .toISOString()
        .slice(0, 10),
    size:0
  });

  return true;
}

function createProjectAssetId(library, file){
  return `${library}-${file}`
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeAssetSrc(src){
  return decodeURIComponent(
    String(src || "")
      .replace(/^\.\//, "")
  )
    .replace(/\/+/g, "/")
    .toLowerCase();
}
