import {
  driftKeyframes,
  driftState
}
from "./driftState.js";



export class DriftEngine{

  constructor(){

    this.state =
      driftState;

    this.loopDirection =
      1;

    this.randomHold =
      0;

    this.randomIndex =
      0;

    this.motionLook =
      null;

  }



  advance(
    core,
    deltaTime
  ){

    if(!core){
      return;
    }

    const step =
      this.state.speed *
      deltaTime *
      60;

    if(step <= 0){
      return;
    }

    if(this.state.loopMode === "pingpong"){
      core.progress +=
        step *
        this.loopDirection;

      if(core.progress >= 1){
        core.progress =
          1;

        this.loopDirection =
          -1;

        this.state.direction =
          this.loopDirection;
      }

      if(core.progress <= 0){
        core.progress =
          0;

        this.loopDirection =
          1;

        this.state.direction =
          this.loopDirection;
      }

      this.state.progress =
        core.progress;

      return;
    }

    if(this.state.loopMode === "random"){
      this.randomHold +=
        step;

      if(this.randomHold >= 1){
        this.randomHold =
          0;

        this.randomIndex +=
          1;

        core.progress =
          this.seededRandom(
            this.state.seed +
            this.randomIndex * 101.13
          );
      }else{
        core.progress =
          this.wrap01(
            core.progress +
            step * 0.28
          );
      }

      this.state.progress =
        core.progress;

      return;
    }

    core.progress =
      this.wrap01(
        core.progress +
        step
      );

    this.state.progress =
      core.progress;

  }



  currentLook(progress){

    const keyframes =
      this.validKeyframes();

    if(keyframes.length === 1){
      return {
        ...keyframes[0]
      };
    }

    const p =
      this.clamp(
        progress,
        0,
        1
      );

    let index =
      0;

    for(
      let i = 0;
      i < keyframes.length - 1;
      i += 1
    ){
      if(
        p >= keyframes[i].position &&
        p <= keyframes[i + 1].position
      ){
        index =
          i;

        break;
      }
    }

    if(p >= keyframes[keyframes.length - 1].position){
      index =
        keyframes.length - 2;
    }

    const A =
      keyframes[index];

    const B =
      keyframes[index + 1];

    const segmentLength =
      Math.max(
        0.0001,
        B.position - A.position
      );

    const mix =
      this.easeByMode(
        (p - A.position) / segmentLength,
        this.state.morphSmooth
      );

    return {
      brightness:this.lerp(A.brightness, B.brightness, mix),
      contrast:this.lerp(A.contrast, B.contrast, mix),
      saturation:this.lerp(A.saturation, B.saturation, mix),
      hue:this.lerpHue(A.hue, B.hue, mix),
      redGain:this.lerp(A.redGain, B.redGain, mix),
      greenGain:this.lerp(A.greenGain, B.greenGain, mix),
      blueGain:this.lerp(A.blueGain, B.blueGain, mix),
      gamma:this.lerp(A.gamma, B.gamma, mix),
      paletteAmount:this.lerp(
        A.paletteAmount,
        B.paletteAmount,
        mix
      ),
      paletteBlend:mix < 0.5
        ? A.paletteBlend
        : B.paletteBlend,
      paletteColor:this.mixColor(
        A.paletteColor,
        B.paletteColor,
        mix
      )
    };

  }



  resetMotion(){

    this.motionLook =
      null;

    this.loopDirection =
      1;

    this.randomHold =
      0;

    this.randomIndex =
      0;

    this.state.direction =
      this.loopDirection;

  }



  draw(
    core,
    progress = 0
  ){

    if(
      !core.images.length ||
      !core.sourcePixels
    ){
      return;
    }

    if(this.state.bypass){
      this.copySourceToDriftOutput(core);
      return;
    }

    const effectiveProgress =
      this.state.speed <= 0.0001
        ? this.state.phase
        : this.wrap01(
            progress +
            this.state.phase
          );

    const look =
      this.applyMotion(
        this.applyBias(
          this.currentLook(
            effectiveProgress
          ),
          effectiveProgress
        ),
        effectiveProgress
      );

    const amount =
      Math.pow(
        this.clamp(
          this.state.amount / 100,
          0,
          1
        ),
        2
      );

    if(amount <= 0){
      this.copySourceToDriftOutput(core);
      return;
    }

    const frame =
      new ImageData(
        new Uint8ClampedArray(
          core.sourcePixels.data
        ),
        core.drawW,
        core.drawH
      );

    const d =
      frame.data;

    const rad =
      look.hue *
      Math.PI / 180;

    const cos =
      Math.cos(rad);

    const sin =
      Math.sin(rad);

    for(
      let i = 0;
      i < d.length;
      i += 4
    ){

      const originalR =
        d[i];

      const originalG =
        d[i + 1];

      const originalB =
        d[i + 2];

      let r =
        originalR * look.brightness;

      let g =
        originalG * look.brightness;

      let b =
        originalB * look.brightness;

      const nr =
        (.299 + .701 * cos + .168 * sin) * r +
        (.587 - .587 * cos + .330 * sin) * g +
        (.114 - .114 * cos - .497 * sin) * b;

      const ng =
        (.299 - .299 * cos - .328 * sin) * r +
        (.587 + .413 * cos + .035 * sin) * g +
        (.114 - .114 * cos + .292 * sin) * b;

      const nb =
        (.299 - .300 * cos + 1.250 * sin) * r +
        (.587 - .588 * cos - 1.050 * sin) * g +
        (.114 + .886 * cos - .203 * sin) * b;

      r =
        (nr * look.redGain - 128) *
        look.contrast + 128;

      g =
        (ng * look.greenGain - 128) *
        look.contrast + 128;

      b =
        (nb * look.blueGain - 128) *
        look.contrast + 128;

      const gray =
        (r + g + b) / 3;

      r =
        gray +
        (r - gray) *
        look.saturation;

      g =
        gray +
        (g - gray) *
        look.saturation;

      b =
        gray +
        (b - gray) *
        look.saturation;

      r =
        255 *
        Math.pow(
          this.clamp(r / 255, 0, 1),
          1 / look.gamma
        );

      g =
        255 *
        Math.pow(
          this.clamp(g / 255, 0, 1),
          1 / look.gamma
        );

      b =
        255 *
        Math.pow(
          this.clamp(b / 255, 0, 1),
          1 / look.gamma
        );

      d[i] =
        this.clamp(
          this.lerp(
            originalR,
            r,
            amount
          ),
          0,
          255
        );

      d[i + 1] =
        this.clamp(
          this.lerp(
            originalG,
            g,
            amount
          ),
          0,
          255
        );

      d[i + 2] =
        this.clamp(
          this.lerp(
            originalB,
            b,
            amount
          ),
          0,
          255
        );

    }

    core.tempBuffer.ctx.clearRect(
      0,
      0,
      core.drawW,
      core.drawH
    );

    core.tempBuffer.ctx.putImageData(
      frame,
      0,
      0
    );

    this.applyPalette(
      core,
      look
    );

    core.outputs.drift.ctx.clearRect(
      0,
      0,
      core.drawW,
      core.drawH
    );

    core.outputs.drift.ctx.drawImage(
      core.tempBuffer.canvas,
      0,
      0
    );

  }



  applyBias(
    look,
    progress
  ){

    const saturationGain =
      1 +
      this.state.saturationBias / 100;

    const contrastGain =
      1 +
      this.state.contrastBias / 140;

    const brightnessOffset =
      this.state.brightnessBias / 255;

    return {
      ...look,
      brightness:
        this.clamp(
          look.brightness +
          brightnessOffset,
          0.15,
          2.2
        ),
      contrast:
        this.clamp(
          look.contrast * contrastGain,
          0.1,
          3.0
        ),
      saturation:
        this.clamp(
          look.saturation * saturationGain,
          0,
          4
        ),
      hue:
        look.hue +
        this.state.hueBias,
      redGain:look.redGain,
      greenGain:look.greenGain,
      blueGain:look.blueGain,
      gamma:
        this.clamp(
          look.gamma *
          this.state.gammaBias,
          0.35,
          3.4
        )
    };

  }



  applyMotion(
    look,
    progress
  ){

    const jitter =
      this.clamp(
        this.state.jitter / 100,
        0,
        1
      );

    const driftNoise =
      Math.pow(
        this.clamp(
          this.state.driftNoise / 100,
          0,
          1
        ),
        2
      );

    const noise =
      this.smoothNoise(
        progress * 7.0 +
        this.state.phase * 3.0 +
        this.state.seed * 0.017
      );

    const slowNoise =
      this.smoothNoise(
        progress * 2.1 +
        this.state.seed * 0.009 +
        4.2
      );

    const noisyLook = {
      ...look,
      brightness:
        this.clamp(
          look.brightness *
          (
            1 +
            slowNoise *
            driftNoise *
            0.08
          ),
          0.15,
          2.2
        ),
      hue:
        look.hue +
        noise *
        jitter *
        24 +
        slowNoise *
        driftNoise *
        18,
      contrast:
        look.contrast *
        (
          1 +
          noise *
          jitter *
          0.18 +
          slowNoise *
          driftNoise *
          0.12
        ),
      saturation:
        this.clamp(
          look.saturation *
          (
            1 +
            noise *
            jitter *
            0.16 +
            slowNoise *
            driftNoise *
            0.2
          ),
          0,
          4
        ),
      gamma:
        this.clamp(
          look.gamma +
          noise *
          jitter *
          0.18,
          0.35,
          3.4
        )
    };

    const momentum =
      this.clamp(
        this.state.momentum / 100,
        0,
        1
      );

    if(
      momentum <= 0 ||
      !this.motionLook
    ){
      this.motionLook =
        noisyLook;

      return noisyLook;
    }

    const alpha =
      1 -
      momentum *
      0.86;

    this.motionLook =
      this.mixLook(
        this.motionLook,
        noisyLook,
        alpha
      );

    return this.motionLook;

  }



  applyPalette(
    core,
    look = {}
  ){

    const useLivePalette =
      this.state.paletteEditActive === true;

    const liveAmount =
      this.clamp(
        this.state.paletteAmount / 100,
        0,
        1
      );

    const amount =
      useLivePalette
        ? liveAmount
        : this.clamp(
            this.safeNumber(
              look.paletteAmount,
              0
            ) / 100,
            0,
            1
          );

    if(amount <= 0){
      return;
    }

    const ctx =
      core.tempBuffer.ctx;

    ctx.save();

    ctx.globalAlpha =
      amount;

    ctx.globalCompositeOperation =
      this.canvasBlendMode(
        useLivePalette
          ? this.state.paletteBlend
          : look.paletteBlend
      );

    ctx.fillStyle =
      useLivePalette
        ? this.state.paletteColor
        : look.paletteColor;

    ctx.fillRect(
      0,
      0,
      core.drawW,
      core.drawH
    );

    ctx.restore();

  }



  easeByMode(
    t,
    mode
  ){

    const x =
      this.clamp(t, 0, 1);

    if(mode === "linear"){
      return x;
    }

    if(mode === "sine"){
      return (
        0.5 -
        0.5 *
        Math.cos(
          Math.PI * x
        )
      );
    }

    if(mode === "exponential"){
      return Math.pow(
        x,
        2.6
      );
    }

    return (
      x *
      x *
      (3 - 2 * x)
    );

  }



  mixLook(A, B, t){

    return {
      brightness:this.lerp(A.brightness, B.brightness, t),
      contrast:this.lerp(A.contrast, B.contrast, t),
      saturation:this.lerp(A.saturation, B.saturation, t),
      hue:this.lerpHue(A.hue, B.hue, t),
      redGain:this.lerp(A.redGain, B.redGain, t),
      greenGain:this.lerp(A.greenGain, B.greenGain, t),
      blueGain:this.lerp(A.blueGain, B.blueGain, t),
      gamma:this.lerp(A.gamma, B.gamma, t),
      paletteAmount:this.lerp(
        this.safeNumber(A.paletteAmount, 0),
        this.safeNumber(B.paletteAmount, 0),
        t
      ),
      paletteBlend:t < 0.5
        ? A.paletteBlend
        : B.paletteBlend,
      paletteColor:this.mixColor(
        A.paletteColor,
        B.paletteColor,
        t
      )
     };

   }



  mixColor(A, B, t){

    const a =
      this.hexToRgb(A);

    const b =
      this.hexToRgb(B);

    return this.rgbToHex(
      Math.round(this.lerp(a.r, b.r, t)),
      Math.round(this.lerp(a.g, b.g, t)),
      Math.round(this.lerp(a.b, b.b, t))
    );

  }



  lerpHue(A, B, t){

    const start =
      this.safeNumber(A, 0);

    const end =
      this.safeNumber(B, 0);

    const delta =
      ((end - start + 540) % 360) - 180;

    return start + delta * t;

  }



  hexToRgb(value){

    const hex =
      typeof value === "string"
        ? value.replace("#", "").trim()
        : "";

    const normalized =
      hex.length === 3
        ? hex.split("").map(char => char + char).join("")
        : hex;

    const int =
      Number.parseInt(
        normalized.length === 6
          ? normalized
          : "ffffff",
        16
      );

    return {
      r:(int >> 16) & 255,
      g:(int >> 8) & 255,
      b:int & 255
    };

  }



  rgbToHex(r, g, b){

    return `#${
      [r, g, b]
        .map(value => this.clamp(
          value,
          0,
          255
        ).toString(16).padStart(2, "0"))
        .join("")
    }`;

  }



  smoothNoise(value){

    return (
      Math.sin(value * 12.9898) *
      0.55 +
      Math.sin(value * 4.1414 + 2.1) *
      0.32 +
      Math.sin(value * 1.618 + 4.8) *
      0.13
    );

  }



  seededRandom(value){

    return this.wrap01(
      Math.sin(value * 43758.5453) *
      143758.5453
    );

  }



  canvasBlendMode(mode){

    if(mode === "soft-light"){
      return "soft-light";
    }

    if(mode === "multiply"){
      return "multiply";
    }

    if(mode === "screen"){
      return "screen";
    }

    if(mode === "color"){
      return "color";
    }

    return "overlay";

  }



  wrap01(value){

    return (
      (value % 1) +
      1
    ) % 1;

  }



  lerp(a, b, t){

    return (
      a * (1 - t) +
      b * t
    );

  }



  clamp(x, min, max){

    return Math.max(
      min,
      Math.min(max, x)
    );

  }



  validKeyframes(){

    const keyframes =
      Array.isArray(this.state.keyframes) &&
      this.state.keyframes.length
        ? this.state.keyframes
        : driftKeyframes;

    const normalized =
      keyframes
        .map(keyframe => ({
          position:this.safeNumber(keyframe.position, NaN),
          duration:Math.max(
            0.1,
            this.safeNumber(keyframe.duration, 1)
          ),
          brightness:this.safeNumber(keyframe.brightness, 1),
          contrast:this.safeNumber(keyframe.contrast, 1),
          saturation:this.safeNumber(keyframe.saturation, 1),
          hue:this.safeNumber(keyframe.hue, 0),
          redGain:this.safeNumber(keyframe.redGain, 1),
          greenGain:this.safeNumber(keyframe.greenGain, 1),
          blueGain:this.safeNumber(keyframe.blueGain, 1),
          gamma:this.safeNumber(keyframe.gamma, 1),
          paletteAmount:this.safeNumber(keyframe.paletteAmount, 0),
          paletteBlend:typeof keyframe.paletteBlend === "string"
            ? keyframe.paletteBlend
            : "overlay",
          paletteColor:typeof keyframe.paletteColor === "string"
            ? keyframe.paletteColor
            : "#ffffff"
        }));

    if(
      normalized.length === 1 ||
      normalized.every(keyframe => Number.isFinite(keyframe.position))
    ){
      return normalized
        .map(keyframe => ({
          ...keyframe,
          position:this.clamp(
            keyframe.position,
            0,
            1
          )
        }))
        .sort((a, b) => a.position - b.position);
    }

    const totalDuration =
      normalized
        .slice(0, -1)
        .reduce(
          (sum, keyframe) => sum + keyframe.duration,
          0
        ) || 1;

    let cursor =
      0;

    return normalized
      .map((keyframe, index) => {
        if(index === 0){
          return {
            ...keyframe,
            position:0
          };
        }

        if(index === normalized.length - 1){
          return {
            ...keyframe,
            position:1
          };
        }

        cursor +=
          normalized[index - 1].duration;

        return {
          ...keyframe,
          position:this.clamp(
            cursor / totalDuration,
            0,
            1
          )
        };
      });

  }



  safeNumber(value, fallback){

    return Number.isFinite(value)
      ? value
      : fallback;

  }



  copySourceToDriftOutput(core){

    const frame =
      new ImageData(
        new Uint8ClampedArray(
          core.sourcePixels.data
        ),
        core.drawW,
        core.drawH
      );

    core.outputs.drift.ctx.clearRect(
      0,
      0,
      core.drawW,
      core.drawH
    );

    core.outputs.drift.ctx.putImageData(
      frame,
      0,
      0
    );

  }



  serialize(){

    return {
      type:"drift",
      version:2,
      ...JSON.parse(
        JSON.stringify(
          this.state
        )
      ),
      direction:this.loopDirection,
      randomHold:this.randomHold,
      randomIndex:this.randomIndex
    };

  }



  deserialize(data = {}){

    const next =
      JSON.parse(
        JSON.stringify(
          data || {}
        )
      );

    delete next.type;

    const hasStoredPositions =
      Array.isArray(next.keyframes) &&
      next.keyframes.length > 1 &&
      next.keyframes.every(keyframe => Number.isFinite(keyframe.position));

    const hasMissingDurations =
      Array.isArray(next.keyframes) &&
      next.keyframes.some(keyframe => !Number.isFinite(keyframe.duration));

    Object.assign(
      this.state,
      next
    );

    if(
      !Array.isArray(this.state.keyframes) ||
      !this.state.keyframes.length
    ){
      this.state.keyframes =
        driftKeyframes.map(keyframe => ({ ...keyframe }));
    }

    this.state.keyframes =
      this.validKeyframes();

    if(
      hasStoredPositions &&
      hasMissingDurations
    ){
      this.applyPositionDurations(
        this.state.keyframes
      );
    }

    this.state.selectedKeyframe =
      Math.round(
        this.clamp(
          this.safeNumber(
            this.state.selectedKeyframe,
            0
          ),
          0,
          Math.max(
            0,
            this.state.keyframes.length - 1
          )
        )
      );

    this.state.paletteEditActive =
      this.state.paletteEditActive === true;

    this.loopDirection =
      next.direction === -1
        ? -1
        : 1;

    this.randomHold =
      this.safeNumber(
        next.randomHold,
        0
      );

    this.randomIndex =
      this.safeNumber(
        next.randomIndex,
        0
      );

    this.motionLook =
      null;

  }



  applyPositionDurations(keyframes){

    if(keyframes.length <= 1){
      if(keyframes[0]){
        keyframes[0].duration =
          1;
      }

      return;
    }

    const scale =
      Math.max(
        1,
        keyframes.length - 1
      );

    keyframes
      .forEach((keyframe, index) => {
        if(index >= keyframes.length - 1){
          keyframe.duration =
            this.safeNumber(
              keyframe.duration,
              1
            );

          return;
        }

        const next =
          keyframes[index + 1];

        keyframe.duration =
          Math.max(
            0.1,
            (
              (next.position || 0) -
              (keyframe.position || 0)
            ) * scale
          );
      });

  }

}
