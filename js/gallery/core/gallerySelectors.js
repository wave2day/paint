import {
  galleryAssets,
  galleryLibraries
}
from
"../data/galleryData.js?v=gallery-properties-blue-force-1";

export function getVisibleAssets(
  state,
  {
    localDeleted,
    localFavorites,
    localRecent,
    localRenames
  }
){

  const library =
    galleryLibraries[state.library];

  let assets =
    getActiveAssets({
      localDeleted,
      localRenames
    }).filter(asset => {
      if(library.type === "recent"){
        return localRecent.includes(
          asset.id
        );
      }

      if(library.type === "collection"){
        return assetInCollection(
          asset,
          state.library,
          localFavorites
        );
      }

      return asset.library === state.library;
    });

  if(state.search){
    assets =
      assets.filter(asset => {
        const haystack =
          `${asset.name} ${asset.type} ${asset.library}`
            .toLowerCase();

        return haystack.includes(
          state.search
        );
      });
  }

  if(library.type === "recent"){
    return sortRecentAssets(
      assets,
      localRecent
    );
  }

  return sortAssets(
    assets,
    state.sort
  );

}

export function getActiveAssets({
  localDeleted,
  localRenames
}){

  return galleryAssets
    .filter(asset => !localDeleted.has(asset.id))
    .map(asset => ({
      ...asset,
      name:
        localRenames[asset.id] ||
        asset.name
    }));

}

export function getGalleryAssetById(
  id,
  {
    localDeleted,
    localRenames
  }
){

  if(!id){
    return null;
  }

  return getActiveAssets({
    localDeleted,
    localRenames
  })
    .find(asset => asset.id === id) ||
    null;

}

function assetInCollection(asset, collection, localFavorites){

  if(collection === "favorites"){
    return (
      asset.collections.includes("favorites") ||
      localFavorites.has(asset.id)
    );
  }

  return asset.collections.includes(
    collection
  );

}

function sortAssets(assets, sort){

  return [...assets].sort((a, b) => {
    if(sort === "size"){
      return b.size - a.size;
    }

    if(sort === "date"){
      return (
        Date.parse(b.date) -
        Date.parse(a.date)
      );
    }

    return a.name.localeCompare(
      b.name,
      undefined,
      {
        numeric:true,
        sensitivity:"base"
      }
    );
  });

}

function sortRecentAssets(assets, localRecent){

  const byId =
    new Map(
      assets.map(asset => [
        asset.id,
        asset
      ])
    );

  return localRecent
    .map(id => byId.get(id))
    .filter(Boolean);

}
