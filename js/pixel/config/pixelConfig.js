export const ACCEPTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp"
]);

export const ACCEPTED_EXTENSIONS =
  /\.(png|jpe?g|webp|gif|bmp)$/i;

export const REFINE_RECT_LIMIT =
  45000;

export const PALETTES = {
  original:{
    label:"Original",
    colors:null
  },
  monoPaper:{
    label:"Mono Paper",
    colors:[
      "#111111",
      "#f4f1ec"
    ]
  },
  greenDisplay:{
    label:"Green Display",
    colors:[
      "#07130b",
      "#1f5d2a",
      "#67b044",
      "#d6f36a"
    ]
  },
  nintendoOld:{
    label:"Old Nintendo",
    colors:[
      "#0f0f1b",
      "#7c3f58",
      "#d67848",
      "#f8e6a0",
      "#6bb1b5",
      "#355070"
    ]
  },
  cgaCandy:{
    label:"CGA Candy",
    colors:[
      "#000000",
      "#00aaaa",
      "#aa00aa",
      "#ffffff"
    ]
  },
  amberDisplay:{
    label:"Amber Display",
    colors:[
      "#140b02",
      "#6d3a0b",
      "#d58a26",
      "#ffd37a"
    ]
  },
  icePoster:{
    label:"Ice Poster",
    colors:[
      "#111827",
      "#4b6f89",
      "#65b8d0",
      "#f4f1ec",
      "#d789c9"
    ]
  }
};

export const MODES = {
  ultraClean:{
    label:"ULTRA CLEAN",
    gridFactor:1,
    sharpenAlpha:false,
    snapAlpha:false,
    alphaAdd:0
  },
  microHarden:{
    label:"MICRO HARDEN",
    gridFactor:1,
    sharpenAlpha:true,
    snapAlpha:false,
    alphaAdd:4
  },
  edgeSnap:{
    label:"EDGE SNAP",
    gridFactor:1,
    sharpenAlpha:true,
    snapAlpha:true,
    alphaAdd:8
  },
  softPixel:{
    label:"SOFT PIXEL",
    gridFactor:.985,
    sharpenAlpha:true,
    snapAlpha:false,
    alphaAdd:6
  },
  pixel:{
    label:"PIXEL",
    gridFactor:.94,
    sharpenAlpha:true,
    snapAlpha:false,
    alphaAdd:8
  }
};
