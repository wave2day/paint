export const galleryLibraries = {

  wallpapers:{
    label:"Wallpapers",
    path:"Library > Wallpapers",
    type:"library"
  },

  camera:{
    label:"Camera",
    path:"Library > Camera",
    type:"library"
  },

  glitch:{
    label:"Glitch Outputs",
    path:"Library > Glitch Outputs",
    type:"library"
  },

  chain:{
    label:"Chain Outputs",
    path:"Library > Chain Outputs",
    type:"library"
  },

  textures:{
    label:"Textures",
    path:"Library > Textures",
    type:"library"
  },

  archive:{
    label:"Archive",
    path:"Library > Archive",
    type:"library"
  },

  favorites:{
    label:"Favorites",
    path:"Collections > Favorites",
    type:"collection"
  },

  recent:{
    label:"Recent Files",
    path:"Recent Files",
    type:"recent"
  },

  neon:{
    label:"Neon",
    path:"Collections > Neon",
    type:"collection"
  },

  purple:{
    label:"Purple",
    path:"Collections > Purple",
    type:"collection"
  },

  "glitch-collection":{
    label:"Glitch",
    path:"Collections > Glitch",
    type:"collection"
  }

};

export const galleryAssets = [

  {
    id:"wallpaper01",
    src:"./media/wallpapers/wallpaper01.jpg",
    name:"wallpaper01.jpg",
    type:"Wallpaper",
    library:"wallpapers",
    collections:[
      "favorites",
      "purple",
      "glitch-collection"
    ],
    date:"2026-06-01",
    size:1320
  },

  {
    id:"wallpaper02",
    src:"./media/wallpapers/wallpaper02.jpg",
    name:"wallpaper02.jpg",
    type:"Wallpaper",
    library:"wallpapers",
    collections:[
      "neon",
      "glitch-collection"
    ],
    date:"2026-06-02",
    size:1180
  },

  {
    id:"wallpaper03",
    src:"./media/wallpapers/wallpaper03.jpg",
    name:"wallpaper03.jpg",
    type:"Wallpaper",
    library:"wallpapers",
    collections:[
      "glitch-collection"
    ],
    date:"2026-06-03",
    size:960
  }

];

const glitchOutputFiles = [
  { file:"glitch-workstation (1) (kopie 2).png", date:"2026-06-11", size:1193 },
  { file:"glitch-workstation (1) (kopie 3).png", date:"2026-06-11", size:979 },
  { file:"glitch-workstation (1) (kopie 4).png", date:"2026-06-11", size:1758 },
  { file:"glitch-workstation (1) (kopie 5).png", date:"2026-06-11", size:2856 },
  { file:"glitch-workstation (1) (kopie 6).png", date:"2026-06-12", size:1621 },
  { file:"glitch-workstation (1) (kopie).png", date:"2026-06-10", size:1703 },
  { file:"glitch-workstation (1).png", date:"2026-06-10", size:672 },
  { file:"glitch-workstation (2) (kopie 2).png", date:"2026-06-11", size:1166 },
  { file:"glitch-workstation (2) (kopie 3).png", date:"2026-06-11", size:1963 },
  { file:"glitch-workstation (2) (kopie 4).png", date:"2026-06-11", size:3445 },
  { file:"glitch-workstation (2) (kopie).png", date:"2026-06-10", size:705 },
  { file:"glitch-workstation (2).png", date:"2026-06-10", size:778 },
  { file:"glitch-workstation (3) (kopie).png", date:"2026-06-12", size:1606 },
  { file:"glitch-workstation (3).png", date:"2026-06-11", size:1229 },
  { file:"glitch-workstation (4) (kopie).png", date:"2026-06-12", size:1345 },
  { file:"glitch-workstation (4).png", date:"2026-06-11", size:1408 },
  { file:"glitch-workstation (5).png", date:"2026-06-11", size:2855 },
  { file:"glitch-workstation (6).png", date:"2026-06-11", size:1862 },
  { file:"glitch-workstation (7).png", date:"2026-06-12", size:2009 },
  { file:"glitch-workstation (8).png", date:"2026-06-12", size:1215 },
  { file:"glitch-workstation (9).png", date:"2026-06-12", size:1339 },
  { file:"glitch-workstation (10).png", date:"2026-06-12", size:864 },
  { file:"glitch-workstation (kopie 2).png", date:"2026-06-10", size:533 },
  { file:"glitch-workstation (kopie 3).png", date:"2026-06-09", size:356 },
  { file:"glitch-workstation (kopie 4).png", date:"2026-06-09", size:629 },
  { file:"glitch-workstation (kopie 5).png", date:"2026-06-09", size:859 },
  { file:"glitch-workstation (kopie 6).png", date:"2026-06-10", size:1934 },
  { file:"glitch-workstation (kopie 7).png", date:"2026-06-11", size:462 },
  { file:"glitch-workstation (kopie 8).png", date:"2026-06-11", size:1898 },
  { file:"glitch-workstation (kopie 9).png", date:"2026-06-11", size:1981 },
  { file:"glitch-workstation (kopie 10).png", date:"2026-06-11", size:1549 },
  { file:"glitch-workstation (kopie).png", date:"2026-06-10", size:1175 },
  { file:"glitch-workstation-2 (kopie 2).png", date:"2026-06-10", size:1077 },
  { file:"glitch-workstation-2 (kopie 3).png", date:"2026-06-11", size:1093 },
  { file:"glitch-workstation-2 (kopie).png", date:"2026-06-09", size:1041 },
  { file:"glitch-workstation-2.png", date:"2026-06-09", size:666 },
  { file:"glitch-workstation-3 (kopie 2).png", date:"2026-06-11", size:1493 },
  { file:"glitch-workstation-3 (kopie 3).png", date:"2026-06-11", size:2992 },
  { file:"glitch-workstation-3 (kopie).png", date:"2026-06-10", size:1642 },
  { file:"glitch-workstation-3.png", date:"2026-06-09", size:754 },
  { file:"glitch-workstation-4.png", date:"2026-06-11", size:1241 }
];

galleryAssets.push(
  ...glitchOutputFiles.map((asset, index) => ({
    id:`glitch-output-${index + 1}`,
    src:`./media/img/${asset.file}`,
    name:asset.file,
    type:"Glitch Output",
    library:"glitch",
    collections:[
      "glitch-collection"
    ],
    date:asset.date,
    size:asset.size
  }))
);

export const wallpapers =
  galleryAssets
    .filter(asset => asset.library === "wallpapers")
    .map(asset => asset.src);
