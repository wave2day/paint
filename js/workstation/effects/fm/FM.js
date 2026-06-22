import { fmState }
from "./fmState.js";



export class FM{

  constructor(options = {}){

    this.state =
      options.state || fmState;

    this.outputKey =
      options.outputKey || "fm";

  }



  get freq(){
    return this.state.freq;
  }

  set freq(value){
    this.state.freq = value;
  }

  get depth(){
    return this.state.depth;
  }

  set depth(value){
    this.state.depth = value;
  }

  get angle(){
    return this.state.angle;
  }

  set angle(value){
    this.state.angle = value;
  }

  get smooth(){
    return this.state.smooth;
  }

  set smooth(value){
    this.state.smooth = value;
  }

  get threshold(){
    return this.state.threshold;
  }

  set threshold(value){
    this.state.threshold = value;
  }

  get lineWidth(){
    return this.state.lineWidth ?? 50;
  }

  set lineWidth(value){
    this.state.lineWidth = value;
  }

  get contourDensity(){
    return this.state.contourDensity || 0;
  }

  set contourDensity(value){
    this.state.contourDensity = value;
  }

  get dotBreakup(){
    return this.state.dotBreakup || 0;
  }

  set dotBreakup(value){
    this.state.dotBreakup = value;
  }

  get noiseAmount(){
    return this.state.noiseAmount || 0;
  }

  set noiseAmount(value){
    this.state.noiseAmount = value;
  }

  get signalTear(){
    return this.state.signalTear || 0;
  }

  set signalTear(value){
    this.state.signalTear = value;
  }

  get lineMode(){
    return this.state.lineMode || "solid";
  }

  set lineMode(value){
    this.state.lineMode = value;
  }

  get linePolarity(){
    return this.state.linePolarity || "light";
  }

  set linePolarity(value){
    this.state.linePolarity = value;
  }

  get fmMode(){
    return this.state.fmMode || "classic";
  }

  set fmMode(value){
    this.state.fmMode = value;
  }

  get flow(){
    return this.state.flow;
  }

  set flow(value){
    this.state.flow = value;
  }

  get flowMode(){
    return this.state.flowMode || "vertical";
  }

  set flowMode(value){
    this.state.flowMode = value;
  }

  get warp(){
    return this.state.warp || 0;
  }

  set warp(value){
    this.state.warp = value;
  }

  get blend(){
    return this.state.blend;
  }

  set blend(value){
    this.state.blend = value;
  }

  get blendMode(){
    return this.state.blendMode || "full";
  }

  set blendMode(value){
    this.state.blendMode = value;
  }

  get colorize(){
    return this.state.colorize;
  }

  set colorize(value){
    this.state.colorize = value;
  }

  get paletteColor(){
    return this.state.paletteColor || "#ff00ff";
  }

  set paletteColor(value){
    this.state.paletteColor = value;
  }

  get colorSpread(){
    return this.state.colorSpread || 0;
  }

  set colorSpread(value){
    this.state.colorSpread = value;
  }

  get glow(){
    return this.state.glow || 0;
  }

  set glow(value){
    this.state.glow = value;
  }

  get phaseDrift(){
    return this.state.phaseDrift;
  }

  set phaseDrift(value){
    this.state.phaseDrift = value;
  }

  get motionAmount(){
    return this.state.motionAmount ?? 100;
  }

  set motionAmount(value){
    this.state.motionAmount = value;
  }

  get sourceMode(){
    return this.state.sourceMode || "luminance";
  }

  set sourceMode(value){
    this.state.sourceMode = value;
  }



  getSourceValue(data,w,h,x,y,r,g,b,brightness,mode){

    if(mode === "edge"){

      const right =
        this.brightnessAt(
          data,
          w,
          h,
          Math.min(w - 1,x + 1),
          y
        );

      const down =
        this.brightnessAt(
          data,
          w,
          h,
          x,
          Math.min(h - 1,y + 1)
        );

      return Math.min(
        1,
        Math.abs(brightness - right) * 4 +
        Math.abs(brightness - down) * 4
      );

    }

    if(mode === "saturation"){

      const max =
        Math.max(r,g,b);

      const min =
        Math.min(r,g,b);

      return max === 0
        ? 0
        : (max - min) / max;

    }

    if(mode === "red"){
      return r / 255;
    }

    if(mode === "green"){
      return g / 255;
    }

    if(mode === "blue"){
      return b / 255;
    }

    return brightness;

  }



  getContourSourceValue(data,w,h,x,y,sourceValue,mode,smooth){

    const amount =
      Math.max(
        0,
        Math.min(
          1,
          smooth
        )
      );

    if(amount <= 0){
      return sourceValue;
    }

    const radius =
      amount > 0.65
        ? 2
        : 1;

    let sum =
      0;

    let count =
      0;

    for(
      let oy = -radius;
      oy <= radius;
      oy++
    ){

      const sy =
        Math.max(
          0,
          Math.min(
            h - 1,
            y + oy
          )
        );

      for(
        let ox = -radius;
        ox <= radius;
        ox++
      ){

        const sx =
          Math.max(
            0,
            Math.min(
              w - 1,
              x + ox
            )
          );

        const i =
          (sy * w + sx) * 4;

        const r =
          data[i];

        const g =
          data[i + 1];

        const b =
          data[i + 2];

        const brightness =
          (
            r +
            g +
            b
          ) / 3 / 255;

        sum +=
          this.getSourceValue(
            data,
            w,
            h,
            sx,
            sy,
            r,
            g,
            b,
            brightness,
            mode
          );

        count++;

      }

    }

    const averaged =
      count
        ? sum / count
        : sourceValue;

    return sourceValue * (1 - amount) +
      averaged * amount;

  }



  getPaletteTint(){

    const color =
      this.paletteColor;

    const match =
      /^#?([0-9a-f]{6})$/i.exec(
        color || ""
      );

    if(!match){
      return {
        r:255,
        g:0,
        b:255
      };
    }

    const value =
      Number.parseInt(
        match[1],
        16
      );

    return {
      r:(value >> 16) & 255,
      g:(value >> 8) & 255,
      b:value & 255
    };

  }



  getBreakupMask(x,y,sourceValue,dotBreakup,lineMode){

    if(
      dotBreakup <= 0 &&
      lineMode === "solid"
    ){
      return 1;
    }

    const cell =
      Math.sin(x * 0.37 + y * 0.19) *
      Math.sin(x * 0.11 - y * 0.29 + sourceValue * 8);

    const grain =
      cell * 0.5 + 0.5;

    if(lineMode === "dotted"){

      const dot =
        Math.sin(x * 0.42) *
        Math.sin(y * 0.42);

      const dotMask =
        dot > 0.18
          ? 1
          : 0;

      return dotBreakup <= 0
        ? dotMask
        : dotMask * (grain > dotBreakup * 0.72 ? 1 : 0);

    }

    if(lineMode === "broken"){
      return grain > dotBreakup
        ? 1
        : 0;
    }

    return grain > dotBreakup
      ? 1
      : 0;

  }



  getSignalTearOffset(y,sourceValue,signalTear){

    if(signalTear <= 0){
      return 0;
    }

    const rowBand =
      Math.floor(
        y / 11
      );

    const tearSeed =
      Math.sin(
        rowBand * 12.9898 +
        sourceValue * 18.233
      ) *
      43758.5453;

    const tearNoise =
      tearSeed -
      Math.floor(tearSeed);

    const gate =
      tearNoise >
      1 - signalTear * 0.45
        ? 1
        : 0;

    if(!gate){
      return 0;
    }

    return (
      tearNoise - 0.5
    ) *
    signalTear *
    90;

  }



  getNoiseValue(x,y,sourceValue){

    const seed =
      Math.sin(
        x * 12.9898 +
        y * 78.233 +
        sourceValue * 37.719
      ) *
      43758.5453;

    return seed -
      Math.floor(seed);

  }



  getWarpOffset(x,y,sourceValue,warp){

    if(warp <= 0){
      return 0;
    }

    const slowWave =
      Math.sin(
        x * 0.017 +
        y * 0.021 +
        sourceValue * 7
      );

    const crossWave =
      Math.cos(
        x * 0.009 -
        y * 0.026 +
        sourceValue * 11
      );

    return (
      slowWave * 0.7 +
      crossWave * 0.3
    ) *
    warp *
    140;

  }



  getFlowVector(x,y,w,h,sourceValue,flow,mode){

    if(flow <= 0){
      return {
        x:0,
        y:0
      };
    }

    const amount =
      flow *
      120;

    if(mode === "horizontal"){

      return {
        x:0,
        y:Math.sin(
          x * 0.01 +
          sourceValue * 4
        ) * amount
      };

    }

    if(mode === "radial"){

      const cx =
        w * 0.5;

      const cy =
        h * 0.5;

      const dx =
        x - cx;

      const dy =
        y - cy;

      const dist =
        Math.sqrt(
          dx * dx +
          dy * dy
        ) || 1;

      const wave =
        Math.sin(
          dist * 0.025 +
          sourceValue * 5
        ) * amount;

      return {
        x:dx / dist * wave,
        y:dy / dist * wave
      };

    }

    if(mode === "noise"){

      const noise =
        Math.sin(
          x * 0.037 +
          y * 0.071 +
          sourceValue * 9
        ) *
        Math.cos(
          x * 0.019 -
          y * 0.043
        );

      return {
        x:noise * amount,
        y:Math.sin(noise * 3.1) * amount * 0.55
      };

    }

    if(mode === "curl"){

      const curl =
        Math.sin(
          y * 0.018 +
          Math.cos(x * 0.016) * 3 +
          sourceValue * 6
        );

      return {
        x:curl * amount,
        y:Math.cos(
          x * 0.018 +
          curl * 2
        ) * amount * 0.72
      };

    }

    return {
      x:Math.sin(
        y * 0.01 +
        sourceValue * 4
      ) * amount,
      y:0
    };

  }



  brightnessAt(data,w,h,x,y){

    const i =
      (y * w + x) * 4;

    return (
      data[i] +
      data[i + 1] +
      data[i + 2]
    ) / 3 / 255;

  }



  getEdgeValue(data,w,h,x,y,brightness){

    const right =
      this.brightnessAt(
        data,
        w,
        h,
        Math.min(w - 1,x + 1),
        y
      );

    const down =
      this.brightnessAt(
        data,
        w,
        h,
        x,
        Math.min(h - 1,y + 1)
      );

    return Math.min(
      1,
      Math.abs(brightness - right) * 4 +
      Math.abs(brightness - down) * 4
    );

  }



  shapeSignalValue(signal,threshold,lineWidthScale,smoothWidth){

    const c =
      (signal * 0.5 + 0.5) * 255;

    const edge =
      c - threshold;

    const shapedEdge =
      edge / lineWidthScale;

    let final =
      128 +
      (
        shapedEdge /
        smoothWidth
      ) * 255;

    final =
      Math.pow(
        final / 255,
        1.8
      ) * 255;

    return Math.max(
      0,
      Math.min(
        255,
        final
      )
    );

  }



  advance(core, deltaTime){

    const motion =
      Math.max(
        0,
        Math.min(
          1,
          this.motionAmount / 100
        )
      );

    if(!motion){
      this.state.motionVelocity = 0;
      return;
    }

    const safeDelta =
      Math.min(
        Math.max(deltaTime, 0),
        1 / 24
      );

    const shapedMotion =
      0.18 +
      Math.pow(motion, 1.45) * 0.82;

    const targetVelocity =
      shapedMotion * 0.24;

    const currentVelocity =
      Number.isFinite(this.state.motionVelocity)
        ? this.state.motionVelocity
        : targetVelocity;

    const follow =
      Math.min(
        1,
        safeDelta * 7
      );

    this.state.motionVelocity =
      currentVelocity +
      (targetVelocity - currentVelocity) *
      follow;

    this.state.motionProgress =
      (
        (this.state.motionProgress || 0) +
        this.state.motionVelocity *
        safeDelta
      ) % 1;

    core.progress =
      this.state.motionProgress;

  }



  getMotionOffset(
    x,
    y,
    w,
    h,
    sourceValue,
    motionPhase,
    depth
  ){

    if(!motionPhase){
      return 0;
    }

    const nx =
      x / Math.max(1,w);

    const ny =
      y / Math.max(1,h);

    const broadBase =
      (
        nx * 1.35 +
        ny * 0.9 +
        sourceValue * 0.45
      ) *
      Math.PI *
      2;

    const fineBase =
      x * 0.014 +
      y * 0.009 +
      sourceValue * 2.8;

    const broad =
      Math.sin(
        broadBase +
        motionPhase * 0.58
      ) -
      Math.sin(
        broadBase
      );

    const fine =
      Math.sin(
        fineBase +
        motionPhase * 0.82
      ) -
      Math.sin(
        fineBase
      );

    const amount =
      3.5 +
      depth * 0.26;

    return (
      broad * 0.72 +
      fine * 0.28
    ) *
    amount;

  }



  getContourSignal({
    coordinate,
    sourceValue,
    brightness,
    contourDensity,
    depth,
    freq,
    phase,
    sourceMode,
    warpOffset
  }){

    const areaSource =
      sourceMode === "edge"
        ? brightness * 0.72 + sourceValue * 0.28
        : sourceValue;

    const bands =
      7 +
      contourDensity * 54 +
      depth * 0.05;

    const areaPhase =
      areaSource *
      bands *
      Math.PI *
      2;

    const fieldPhase =
      coordinate *
      freq *
      (
        0.18 +
        contourDensity * 0.08
      );

    const carrier =
      Math.sin(
        coordinate * freq +
        sourceValue * depth +
        phase
      );

    const contour =
      Math.sin(
        areaPhase +
        fieldPhase +
        warpOffset * 0.018 +
        phase
      );

    const contourWeight =
      0.68 +
      contourDensity * 0.24;

    const value =
      contour * contourWeight +
      carrier * (1 - contourWeight);

    return Math.max(
      -1,
      Math.min(
        1,
        value
      )
    );

  }



  /* =========================
     DRAW
  ========================== */

  draw(core, progress = 0){

    const output =
      core.outputs[
        this.outputKey
      ];

    if(!output){
      return;
    }

    const w =
      core.drawW;

    const h =
      core.drawH;



    if(
      !w ||
      !h
    ){
      return;
    }



    if(
      !core.sourcePixels
    ){
      return;
    }

    if(this.state.bypass){

      output.ctx.clearRect(
        0,
        0,
        w,
        h
      );

      output.ctx.putImageData(
        core.sourcePixels,
        0,
        0
      );

      return;

    }



    const src =

      new ImageData(

        new Uint8ClampedArray(
          core.sourcePixels.data
        ),

        w,
        h

      );



    const dst =
      new ImageData(
        w,
        h
      );



    const d =
      src.data;

    const out =
      dst.data;



    const freq =
      this.freq;

    const depth =
      this.depth;

    const angle =
      this.angle;

    const phaseOffset =
      this.phaseDrift / 100;

    const motionProgress =
      this.state.motionProgress || 0;

    const motionPhase =
      motionProgress *
      Math.PI *
      2;

    const phase =
      (
        phaseOffset +
        motionProgress
      ) *
      Math.PI *
      2;

    const sourceMode =
      this.sourceMode;

    const fmMode =
      this.fmMode;

    const contourDensity =
      sourceMode === "luminance" &&
      fmMode !== "contour"
        ? 0
        : this.contourDensity / 100;

    const lineWidthScale =
      Math.max(
        0.1,
        this.lineWidth / 50
      );

    const dotBreakup =
      this.dotBreakup / 100;

    const noiseAmount =
      this.noiseAmount / 100;

    const lineMode =
      this.lineMode;

    const linePolarity =
      this.linePolarity;

    const colorSpread =
      this.colorSpread / 100;

    const glow =
      this.glow / 100;

    const signalTear =
      this.signalTear / 100;

    const warp =
      this.warp / 100;

    const flowMode =
      this.flowMode;

    const paletteTint =
      this.getPaletteTint();



    const cos =
      Math.cos(angle);

    const sin =
      Math.sin(angle);



    for(

      let y = 0;

      y < h;

      y++

    ){

      for(

        let x = 0;

        x < w;

        x++

      ){



        const i =
          (y * w + x) * 4;



        const r =
          d[i];

        const g =
          d[i + 1];

        const b =
          d[i + 2];



        const brightness =

          (
            r +
            g +
            b
          ) / 3 / 255;

        const sourceValue =
          this.getSourceValue(
            d,
            w,
            h,
            x,
            y,
            r,
            g,
            b,
            brightness,
            sourceMode
          );

        const fmSourceValue =
          fmMode === "contour"
            ? this.getContourSourceValue(
              d,
              w,
              h,
              x,
              y,
              sourceValue,
              sourceMode,
              this.smooth
            )
            : sourceValue;



        /* =========================
           FLOW FIELD
        ========================== */

        const flowVector =
          this.getFlowVector(
            x,
            y,
            w,
            h,
            fmSourceValue,
            this.flow,
            flowMode
          );



        let coordinate =

          (
            x + flowVector.x
          ) * cos +

          (
            y + flowVector.y
          ) * sin;

        const tearOffset =
          this.getSignalTearOffset(
            y,
            fmSourceValue,
            signalTear
          );

        if(fmMode === "contour"){

          const edgeValue =
            this.getEdgeValue(
              d,
              w,
              h,
              x,
              y,
              brightness
            );

          const densityScale =
            1 + contourDensity * 5;

          const contourFlow =
            (
              flowVector.x * cos +
              flowVector.y * sin
            ) *
            0.8;

          coordinate =
            fmSourceValue *
            2400 *
            densityScale +
            edgeValue *
            240 +
            contourFlow +
            (
              x * cos +
              y * sin
            ) *
            0.08;

        }

        const warpOffset =
          this.getWarpOffset(
            x,
            y,
            fmSourceValue,
            warp
          );

        const motionOffset =
          this.getMotionOffset(
            x,
            y,
            w,
            h,
            fmSourceValue,
            motionPhase,
            depth
          );

        coordinate +=
          warpOffset +
          tearOffset +
          motionOffset;



        /* =========================
           FM SIGNAL
        ========================== */

        const signalPhase =
          fmSourceValue * depth *
          (1 + contourDensity * 4) +

          phase;

        const v =
          fmMode === "contour"
            ? this.getContourSignal({
              coordinate,
              sourceValue:fmSourceValue,
              brightness,
              contourDensity,
              depth,
              freq,
              phase,
              sourceMode,
              warpOffset:warpOffset + motionOffset
            })
            : Math.sin(
              coordinate * freq +
              signalPhase
            );



        /* =========================
           THRESHOLD
        ========================== */


        const smoothWidth =
          Math.max(
            0.001,
            this.smooth
          ) * 120;



        let final =
          this.shapeSignalValue(
            v,
            this.threshold,
            lineWidthScale,
            smoothWidth
          );



        const breakupMask =
          this.getBreakupMask(
            x,
            y,
            fmSourceValue,
            dotBreakup,
            lineMode
          );

        final *=
          breakupMask;

        if(noiseAmount > 0){

          const noiseValue =
            this.getNoiseValue(
              x,
              y,
              fmSourceValue
            );

          const noiseLift =
            (
              noiseValue - 0.5
            ) *
            noiseAmount *
            190;

          final =
            Math.max(
              0,
              Math.min(
                255,
                final + noiseLift
              )
            );

        }



        /* =========================
           COLORIZE
        ========================== */

        let fr =
          final;

        let fg =
          final;

        let fb =
          final;

        if(colorSpread > 0){

          const channelOffset =
            colorSpread *
            18;

          if(fmMode === "contour"){

            fr =
              this.shapeSignalValue(
                this.getContourSignal({
                  coordinate:coordinate - channelOffset,
                  sourceValue:fmSourceValue,
                  brightness,
                  contourDensity,
                  depth,
                  freq,
                  phase:phase - colorSpread * 0.42,
                  sourceMode,
                  warpOffset
                }),
                this.threshold,
                lineWidthScale,
                smoothWidth
              ) *
              breakupMask;

            fb =
              this.shapeSignalValue(
                this.getContourSignal({
                  coordinate:coordinate + channelOffset,
                  sourceValue:fmSourceValue,
                  brightness,
                  contourDensity,
                  depth,
                  freq,
                  phase:phase + colorSpread * 0.42,
                  sourceMode,
                  warpOffset
                }),
                this.threshold,
                lineWidthScale,
                smoothWidth
              ) *
              breakupMask;

          }else{

            fr =
              this.shapeSignalValue(
                Math.sin(
                  (coordinate - channelOffset) * freq +
                  signalPhase
                ),
                this.threshold,
                lineWidthScale,
                smoothWidth
              ) *
              breakupMask;

            fb =
              this.shapeSignalValue(
                Math.sin(
                  (coordinate + channelOffset) * freq +
                  signalPhase
                ),
                this.threshold,
                lineWidthScale,
                smoothWidth
              ) *
              breakupMask;

          }

          if(noiseAmount > 0){

            const noiseValue =
              this.getNoiseValue(
                x,
                y,
                fmSourceValue
              );

            const noiseLift =
              (
                noiseValue - 0.5
              ) *
              noiseAmount *
              190;

            fr =
              Math.max(
                0,
                Math.min(
                  255,
                  fr + noiseLift
                )
              );

            fb =
              Math.max(
                0,
                Math.min(
                  255,
                  fb + noiseLift
                )
              );

          }

        }



        const fmBlendMask =
          Math.max(
            fr,
            fg,
            fb
          ) / 255;

        if(linePolarity === "dark"){

          fr =
            255 - fr;

          fg =
            255 - fg;

          fb =
            255 - fb;

        }

        if(
          this.colorize > 0
        ){


          fr =

            fr *
            (1 - this.colorize) +

            paletteTint.r *
            this.colorize;



          fg =

            fg *
            (1 - this.colorize) +

            paletteTint.g *
            this.colorize;



          fb =

            fb *
            (1 - this.colorize) +

            paletteTint.b *
            this.colorize;

        }

        if(glow > 0){

          const glowLift =
            Math.pow(
              final / 255,
              2
            ) *
            glow *
            115;

          fr =
            Math.min(
              255,
              fr + glowLift
            );

          fg =
            Math.min(
              255,
              fg + glowLift
            );

          fb =
            Math.min(
              255,
              fb + glowLift
            );

        }



        /* =========================
           BLEND
        ========================== */

        const blend =
          this.blendMode === "line"
            ? this.blend * fmBlendMask
            : this.blend;



        out[i] =

          r * (1 - blend) +

          fr * blend;



        out[i + 1] =

          g * (1 - blend) +

          fg * blend;



        out[i + 2] =

          b * (1 - blend) +

          fb * blend;



        out[i + 3] =
          255;

      }

    }



    /* =========================
       TEMP BUFFER
    ========================== */

    core.tempBuffer.ctx.clearRect(

      0,
      0,

      w,
      h

    );



    core.tempBuffer.ctx.putImageData(

      dst,

      0,
      0

    );



    /* =========================
       OUTPUT
    ========================== */

    output.ctx.clearRect(

      0,
      0,

      w,
      h

    );



    output.ctx.drawImage(

      core.tempBuffer.canvas,

      0,
      0

    );

  }



  serialize(){

    return {
      type:this.outputKey,
      ...this.state
    };

  }



  deserialize(data = {}){

    Object.assign(
      this.state,
      data
    );

  }

}
