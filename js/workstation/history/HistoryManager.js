export class HistoryManager {

  constructor(workstation){

    this.workstation =
      workstation;

    this.snapshots = [];

  }



  /* =========================
     SAVE
  ========================== */

  saveSnapshot(){

    const viewport =

      this.workstation
        .renderer
        .viewport;



    const snapshot = {

      /* =========================
         EFFECT
      ========================== */

      mode:
        this.workstation
          .effects
          .mode,



      /* =========================
         VIEWPORT
      ========================== */

      offsetX:
        viewport.offsetX,

      offsetY:
        viewport.offsetY,



      /* =========================
         CORE
      ========================== */

      progress:
        this.workstation
          .core
          .progress,



      /* =========================
         PALETTE
      ========================== */

      paletteColor:

        this.workstation
          .effects
          .paletteColor,



      /* =========================
         FM STATE
      ========================== */

      fm: {

        freq:
          this.workstation
            .effects
            .fm?.freq,

        depth:
          this.workstation
            .effects
            .fm?.depth,

        angle:
          this.workstation
            .effects
            .fm?.angle,

        smooth:
          this.workstation
            .effects
            .fm?.smooth,

        threshold:
          this.workstation
            .effects
            .fm?.threshold,

        flow:
          this.workstation
            .effects
            .fm?.flow,

        blend:
          this.workstation
            .effects
            .fm?.blend,

        colorize:
          this.workstation
            .effects
            .fm?.colorize

      }

    };



    this.snapshots.push(
      snapshot
    );



    console.log(

      "SNAPSHOT SAVED",

      snapshot

    );

  }



  /* =========================
     RESTORE
  ========================== */

  restoreSnapshot(index){

    const snapshot =

      this.snapshots[index];



    if(!snapshot){
      return;
    }



    /* =========================
       MODE
    ========================== */

    this.workstation
      .effects
      .mode =

        snapshot.mode;



    /* =========================
       VIEWPORT
    ========================== */

    this.workstation
      .renderer
      .viewport
      .offsetX =

        snapshot.offsetX;



    this.workstation
      .renderer
      .viewport
      .offsetY =

        snapshot.offsetY;



    /* =========================
       PROGRESS
    ========================== */

    this.workstation
      .core
      .progress =

        snapshot.progress;



    /* =========================
       PALETTE
    ========================== */

    this.workstation
      .effects
      .paletteColor =

        snapshot.paletteColor;



    /* =========================
       FM
    ========================== */

    if(snapshot.fm){

      Object.assign(

        this.workstation
          .effects
          .fm,

        snapshot.fm

      );

    }



    /* =========================
       RENDER
    ========================== */

    this.workstation
      .queueRender();




    console.log(

      "SNAPSHOT RESTORED",

      snapshot

    );

  }

}