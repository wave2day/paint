import {
  bindWindows
}
from
"./window/windowDrag.js?v=window-snap-cache-1";

import {
  initDialogWindows
}
from
"./window/dialogWindow.js?v=window-stack-1";

import {
  bindDesktopIcons
}
from
"./desktop/desktopIcons.js?v=desktop-selection-menu-1";

import {
  bindDesktopContextMenu
}
from
"./desktop/desktopContextMenu.js?v=desktop-selection-menu-1";

import {
  bindMenuRuntime
}
from
"./components/menu/submenuRuntime.js?v=desktop-selection-menu-1";

import {
  initWallpaper
}
from
"./wallpaper/wallpaper.js";

import {
  initGallery
}
from
"./gallery/gallery.js?v=gallery-help-structure-1";

import {
  bindGalleryContextMenu
}
from
"./gallery/galleryContextMenu.js?v=gallery-final-cache-check-1";

import {
  initGlitchGraphicsWindow
}
from
"./glitchgraphics/glitchGraphicsWindow.js?v=refresh-actions-1";

import {
  initPixel
}
from
"./pixel/pixel.js?v=pixel-modules-3";

import {
  initPaletteDialog
}
from
"./workstation/palette/paletteDialog.js";



bindWindows();

initDialogWindows();

bindDesktopIcons();

bindDesktopContextMenu();

initWallpaper();

initGallery();

bindGalleryContextMenu();

initGlitchGraphicsWindow();

initPixel();

initPaletteDialog();

bindMenuRuntime(document);
