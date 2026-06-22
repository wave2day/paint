import { createBuffer }
from "./buffers/createBuffer.js";



export class ImageCore{

  constructor(canvas){

    this.canvas =
      canvas;

    this.ctx =
      canvas.getContext(
        "2d",
        {
          willReadFrequently:true
        }
      );



    /* =========================
       IMAGE
    ========================== */

    this.images =
      [];

    this.loadedCount =
      0;

    this.sourcePixels =
      null;



    /* =========================
       VIEW
    ========================== */

    this.offsetX =
      0;

    this.offsetY =
      0;

    this.drawW =
      0;

    this.drawH =
      0;



    /* =========================
       STATE
    ========================== */

    this.progress =
      0;

    this.bgColor =
      "#ffffff";



    /* =========================
       BUFFERS
    ========================== */

    this.sourceBuffer =
      createBuffer();

    this.tempBuffer =
      createBuffer();



    /* =========================
       OUTPUTS
    ========================== */

    this.outputs = {

      drift:
        createBuffer(),

	      fm:
	        createBuffer(),
	
	      ar:
	        createBuffer(),
	
	      fx:
	        createBuffer(),

      rgb:
        createBuffer(),

      dither:
        createBuffer(),

      feedback:
        createBuffer()

    };



    /* =========================
       INIT
    ========================== */

    this.resizeCanvas();

  }



  /* =========================
     CANVAS
  ========================== */

  resizeCanvas(){

    const view =
      this.canvas.parentElement;

    this.canvas.width =
      view.clientWidth;

    this.canvas.height =
      view.clientHeight;

  }



  clear(){

    this.ctx.clearRect(

      0,
      0,

      this.canvas.width,
      this.canvas.height

    );

  }



  /* =========================
     LOAD
  ========================== */

  load(
    files,
    onProgress,
    onDone
  ){

    this.images =
      [];

    this.loadedCount =
      0;

    this.progress =
      0;



    const imageFiles =

      Array.from(files)

        .filter(file =>

          file.type.startsWith(
            "image/"
          )

        );



    if(
      !imageFiles.length
    ){

      this.clear();

      onProgress?.(
        "no files"
      );

      return;

    }



    const img =
      new Image();



    img.onload = () => {

      this.resizeCanvas();

      this.images =
        [img];

      this.loadedCount =
        1;

      this.prepareImageSize(
        img
      );

      this.prepareSource(
        img
      );

      onProgress?.(
        "image ready"
      );

      onDone?.();

    };



    img.src =

      URL.createObjectURL(
        imageFiles[0]
      );

  }



  /* =========================
     IMAGE SIZE
  ========================== */

  prepareImageSize(img){

    const viewW =
      this.canvas.width;

    const viewH =
      this.canvas.height;



    const scale =

      Math.max(

        viewW / img.width,
        viewH / img.height

      );



    this.drawW =

      Math.ceil(
        img.width * scale
      );

    this.drawH =

      Math.ceil(
        img.height * scale
      );



    this.offsetX =

      (
        viewW -
        this.drawW
      ) / 2;



    this.offsetY =

      (
        viewH -
        this.drawH
      ) / 2;

  }



  /* =========================
     SOURCE
  ========================== */

  prepareSource(img){

    this.sourceBuffer.canvas.width =
      this.drawW;

    this.sourceBuffer.canvas.height =
      this.drawH;



    this.tempBuffer.canvas.width =
      this.drawW;

    this.tempBuffer.canvas.height =
      this.drawH;



    Object.values(
      this.outputs
    ).forEach(output => {

      output.canvas.width =
        this.drawW;

      output.canvas.height =
        this.drawH;

    });



    this.sourceBuffer.ctx.clearRect(

      0,
      0,

      this.drawW,
      this.drawH

    );



    this.sourceBuffer.ctx.drawImage(

      img,

      0,
      0,

      this.drawW,
      this.drawH

    );



    this.sourcePixels =

      this.sourceBuffer.ctx.getImageData(

        0,
        0,

        this.drawW,
        this.drawH

      );

  }



  /* =========================
     VIEWPORT
  ========================== */

  clampOffsets(){

    const viewW =
      this.canvas.width;

    const viewH =
      this.canvas.height;



    this.offsetX =

      Math.min(

        0,

        Math.max(

          this.offsetX,

          viewW -
          this.drawW

        )

      );



    this.offsetY =

      Math.min(

        0,

        Math.max(

          this.offsetY,

          viewH -
          this.drawH

        )

      );

  }



  moveImage(dx,dy){

    this.offsetX += dx;
    this.offsetY += dy;

    this.clampOffsets();

  }



  /* =========================
     BG
  ========================== */

  setBackground(color){

    this.bgColor =
      color;

  }

}
