import { feedbackState }
from "./feedbackState.js?v=feedback-transform-direct-1";

import { createBuffer }
from "../../core/buffers/createBuffer.js";

import { getPaletteColors }
from "../../palette/colors.js";

const RESPONSE_PROFILES = {
  classic:{
    blurExp:2,
    colorMode:"classic"
  },
  balanced:{
    blurExp:1.8,
    colorMode:"smooth",
    colorSizeExp:1.15,
    colorMixGain:1.1,
    minColors:3
  },
  soft:{
    blurExp:2.7,
    blurGain:.62,
    colorMode:"fine",
    colorMixGain:.9,
    lowStart:.66,
    lowColors:8,
    minColors:2
  }
};



export class FeedbackEngine{

  constructor(){

    this.state =
      feedbackState;

    this.readBuffer =
      createBuffer();

    this.writeBuffer =
      createBuffer();

    this.transformBuffer =
      createBuffer();

    this.initialized =
      false;

    this.frameIndex =
      0;

  }



  clamp(value, min = 0, max = 255){

    return Math.max(
      min,
      Math.min(max, value)
    );

  }



  lerp(a, b, t){

    return (
      a * (1 - t) +
      b * t
    );

  }



  responseProfile(){

    return RESPONSE_PROFILES[
      this.state.responseProfile
    ] || RESPONSE_PROFILES.balanced;

  }



  hash(x){

    const s =
      Math.sin(x * 12.9898 + this.state.seed * 78.233) *
      43758.5453;

    return s - Math.floor(s);

  }



  getNoise(index, amount, x, y, width){

    const mode =
      this.state.noiseMode || "grain";

    const frame =
      this.frameIndex * 31;

    if(mode === "color"){
      const row =
        Math.floor(y / 2);

      const rowPhase =
        this.hash(row * 97 + frame);

      const line =
        (
          rowPhase > 0.62
            ? this.hash(row * 193 + frame + 17) - 0.5
            : 0
        ) *
        amount *
        2.7;

      const crawl =
        Math.sin(
          (x / Math.max(1, width)) * Math.PI * 10 +
          this.frameIndex * 0.42 +
          rowPhase * 6.28
        ) *
        amount *
        0.42;

      const chroma =
        amount *
        1.35;

      return [
        line + crawl + (this.hash(index + frame) - 0.5) * chroma,
        line * 0.35 - crawl * 0.45 + (this.hash(index + frame + 101) - 0.5) * chroma * 0.7,
        -line + crawl * 0.55 + (this.hash(index + frame + 211) - 0.5) * chroma
      ];
    }

    if(mode === "speckle"){
      const gate =
        this.hash(index + frame);

      if(gate > 0.16){
        return [
          0,
          0,
          0
        ];
      }

      const spike =
        (
          this.hash(index + frame + 317) > 0.5
            ? 1
            : -1
        ) *
        amount *
        2.2;

      return [
        spike,
        spike,
        spike
      ];
    }

    const grain =
      (
        this.hash(index + frame) * 0.65 +
        this.hash(index + frame + 409) * 0.35 -
        0.5
      ) *
      amount *
      1.45;

    return [
      grain,
      grain,
      grain
    ];

  }



  ensureBuffers(w, h, sourcePixels){

    const sizeChanged =
      this.readBuffer.canvas.width !== w ||
      this.readBuffer.canvas.height !== h;

    if(sizeChanged){
      [
        this.readBuffer,
        this.writeBuffer,
        this.transformBuffer
      ].forEach(buffer => {
        buffer.canvas.width = w;
        buffer.canvas.height = h;
      });

      this.initialized =
        false;
    }

    if(!this.initialized){
      this.readBuffer.ctx.clearRect(
        0,
        0,
        w,
        h
      );

      this.initialized =
        true;
    }

  }



  clear(){

    [
      this.readBuffer,
      this.writeBuffer,
      this.transformBuffer
    ].forEach(buffer => {
      buffer.ctx.clearRect(
        0,
        0,
        buffer.canvas.width,
        buffer.canvas.height
      );
    });

    this.initialized =
      true;

  }



  reset(){

    Object.assign(
      this.state,
      {
        mix:35,
        memory:55,
        speed:0.004,
        injection:45,
        decayCurve:50,
        blur:2,
        shiftX:0,
        shiftY:0,
        scale:0,
        rotation:0,
        rgbMemoryDrift:0,
        paletteLoss:0,
        noiseInject:0,
        noiseMode:"grain",
        responseProfile:"balanced",
        freeze:false,
        presetName:"Ghost Trail"
      }
    );

    this.clear();

  }



  mapParams(){

    const s =
      this.state;

    const mixV =
      s.mix / 100;

    const memoryV =
      s.memory / 100;

    const speed =
      this.clamp(
        s.speed || 0.004,
        0.001,
        0.02
      );

    const speedRatio =
      this.clamp(
        speed / 0.004,
        0.25,
        5
      );

    const injectionV =
      s.injection / 100;

    const blurV =
      s.blur / 50;

    const profile =
      this.responseProfile();

    return {
      responseProfile:profile,
      speedRatio,
      mix:Math.pow(mixV, 1.4),
      decay:
        Math.pow(
          0.80 +
          Math.pow(memoryV, 2.6) *
          0.199,
          speedRatio
        ),
      injection:
        Math.pow(injectionV, 1.2),
      blur:
        Math.pow(blurV, profile.blurExp) *
        (profile.blurGain || 1) *
        50,
      decayGamma:
        this.lerp(
          0.5,
          2.5,
          s.decayCurve / 100
        ),
      rgbDrift:
        Math.pow(
          s.rgbMemoryDrift / 100,
          0.6
        ) *
        40,
      paletteLoss:
        this.clamp(
          s.paletteLoss / 100,
          0,
          1
        ),
      noise:
        Math.pow(
          s.noiseInject / 100,
          0.55
        ) *
        64
    };

  }



  transformMemory(w, h, progress, params){

    const ctx =
      this.transformBuffer.ctx;

    const s =
      this.state;

    const blur =
      params.blur;

    const speedRatio =
      params.speedRatio;

    ctx.save();

    ctx.clearRect(
      0,
      0,
      w,
      h
    );

    const usesFramedTransform =
      Math.abs(s.scale) > 0.001 ||
      Math.abs(s.rotation) > 0.001;

    if(usesFramedTransform){
      const pad =
        Math.max(
          24,
          Math.round(
            Math.min(w, h) * 0.06
          )
        );

      ctx.save();
      ctx.filter =
        `blur(${Math.max(10, blur * 1.4)}px)`;
      ctx.globalAlpha =
        0.72;
      ctx.drawImage(
        this.readBuffer.canvas,
        -pad,
        -pad,
        w + pad * 2,
        h + pad * 2
      );
      ctx.restore();
    }

    ctx.filter =
      blur > 0
        ? `blur(${blur}px)`
        : "none";

    ctx.translate(
      w / 2,
      h / 2
    );

    if(Math.abs(s.rotation) > 0.001){
      ctx.rotate(
        (s.rotation * speedRatio * Math.PI) /
        180
      );
    }

    if(Math.abs(s.scale) > 0.001){
      const scale =
        Math.pow(
          1 +
          s.scale / 100,
          speedRatio
        );

      ctx.scale(
        scale,
        scale
      );
    }

    const x =
      s.shiftX * speedRatio;

    const y =
      s.shiftY * speedRatio;

    ctx.drawImage(
      this.readBuffer.canvas,
      -w / 2 + x,
      -h / 2 + y
    );

    ctx.restore();

    ctx.filter =
      "none";

  }



  sampleChannel(data, w, h, x, y, channel){

    const sx =
      Math.max(
        0,
        Math.min(
          w - 1,
          Math.round(x)
        )
      );

    const sy =
      Math.max(
        0,
        Math.min(
          h - 1,
          Math.round(y)
        )
      );

    return data[
      (sy * w + sx) * 4 + channel
    ];

  }



  sampleAlpha(data, w, h, x, y){

    return (
      this.sampleChannel(
        data,
        w,
        h,
        x,
        y,
        3
      ) / 255
    );

  }



  quantizeToPalette(r, g, b, palette, size, wrap = false){

    if(!palette.length){
      return [
        r,
        g,
        b
      ];
    }

    if(
      wrap &&
      size >= 256
    ){
      return [
        r,
        g,
        b
      ];
    }

    const limit =
      Math.max(
        1,
        Math.min(
          size,
          palette.length
        )
      );

    let best =
      palette[0];

    let bestDistance =
      Infinity;

    for(let i = 0; i < limit; i++){
      const color =
        palette[i];

      const dr =
        r - color[0];

      const dg =
        g - color[1];

      const db =
        b - color[2];

      const distance =
        dr * dr +
        dg * dg +
        db * db;

      if(distance < bestDistance){
        bestDistance =
          distance;
        best =
          color;
      }
    }

    return best;

  }



  getPalette(){

    return getPaletteColors()
      .map(color => {
        const hex =
          color.replace("#", "");

        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16)
        ];
      });

  }



  draw(core, progress = 0){

    const w =
      core.drawW;

    const h =
      core.drawH;

    if(
      !w ||
      !h ||
      !core.sourcePixels
    ){
      return;
    }

    if(!core.outputs.feedback){
      return;
    }

    this.ensureBuffers(
      w,
      h,
      core.sourcePixels
    );

    const params =
      this.mapParams();

    this.transformMemory(
      w,
      h,
      progress,
      params
    );

    const input =
      core.sourcePixels.data;

    const memory =
      this.transformBuffer.ctx.getImageData(
        0,
        0,
        w,
        h
      );

    const memoryData =
      memory.data;

    const next =
      new ImageData(
        w,
        h
      );

    const out =
      new ImageData(
        w,
        h
      );

    const nextData =
      next.data;

    const outData =
      out.data;

    const palette =
      this.getPalette();

    const paletteSize =
      this.mapPaletteSize(
        palette,
        params
      );

    for(let y = 0; y < h; y++){
      for(let x = 0; x < w; x++){
        const i =
          (y * w + x) * 4;

        const drift =
          params.rgbDrift;

        let mr =
          this.sampleChannel(
            memoryData,
            w,
            h,
            x - drift,
            y,
            0
          );

        let mg =
          memoryData[i + 1];

        let mb =
          this.sampleChannel(
            memoryData,
            w,
            h,
            x + drift,
            y,
            2
          );

        const memoryAlpha =
          Math.pow(
            (
              this.sampleAlpha(
                memoryData,
                w,
                h,
                x - drift,
                y
              ) +
              memoryData[i + 3] / 255 +
              this.sampleAlpha(
                memoryData,
                w,
                h,
                x + drift,
                y
              )
            ) / 3,
            1.6
          );

        mr *= memoryAlpha;
        mg *= memoryAlpha;
        mb *= memoryAlpha;

        mr =
          255 *
          Math.pow(
            this.clamp(mr / 255, 0, 1),
            params.decayGamma
          ) *
          params.decay;

        mg =
          255 *
          Math.pow(
            this.clamp(mg / 255, 0, 1),
            params.decayGamma
          ) *
          params.decay;

        mb =
          255 *
          Math.pow(
            this.clamp(mb / 255, 0, 1),
            params.decayGamma
          ) *
          params.decay;

        let nr =
          mr +
          input[i] *
          params.injection;

        let ng =
          mg +
          input[i + 1] *
          params.injection;

        let nb =
          mb +
          input[i + 2] *
          params.injection;

        if(params.noise > 0){
          const noise =
            this.getNoise(
              i,
              params.noise,
              x,
              y,
              w
            );

          nr += noise[0];
          ng += noise[1];
          nb += noise[2];
        }

        nr =
          this.clamp(nr);

        ng =
          this.clamp(ng);

        nb =
          this.clamp(nb);

        if(params.paletteLoss > 0){
          const colorLoss =
            this.quantizeToPalette(
              nr,
              ng,
              nb,
              palette,
              paletteSize,
              params.responseProfile.colorMode === "classic"
            );

          const lossMix =
            params.responseProfile.colorMode === "classic"
              ? 1
              : Math.min(
                  1,
                  params.paletteLoss *
                  params.responseProfile.colorMixGain
                );

          nr =
            this.lerp(
              nr,
              colorLoss[0],
              lossMix
            );

          ng =
            this.lerp(
              ng,
              colorLoss[1],
              lossMix
            );

          nb =
            this.lerp(
              nb,
              colorLoss[2],
              lossMix
            );
        }

        nextData[i] =
          nr;

        nextData[i + 1] =
          ng;

        nextData[i + 2] =
          nb;

        nextData[i + 3] =
          255;

        outData[i] =
          this.lerp(
            input[i],
            nr,
            params.mix
          );

        outData[i + 1] =
          this.lerp(
            input[i + 1],
            ng,
            params.mix
          );

        outData[i + 2] =
          this.lerp(
            input[i + 2],
            nb,
            params.mix
          );

        outData[i + 3] =
          255;
      }
    }

    if(!this.state.freeze){
      this.writeBuffer.ctx.putImageData(
        next,
        0,
        0
      );

      [
        this.readBuffer,
        this.writeBuffer
      ] =
        [
          this.writeBuffer,
          this.readBuffer
        ];
    }

    const output =
      core.outputs.feedback;

    output.ctx.clearRect(
      0,
      0,
      w,
      h
    );

    output.ctx.putImageData(
      out,
      0,
      0
    );

    this.frameIndex++;

  }



  mapPaletteSize(palette, params){

    const profile =
      params.responseProfile;

    if(profile.colorMode === "classic"){
      return Math.max(
        2,
        Math.round(
          this.lerp(
            256,
            2,
            Math.pow(params.paletteLoss, 1.8)
          )
        )
      );
    }

    if(profile.colorMode === "fine"){
      const lowStart =
        profile.lowStart || .66;

      const lowColors =
        Math.min(
          profile.lowColors,
          palette.length
        );

      const minPaletteSize =
        Math.min(
          profile.minColors,
          palette.length
        );

      if(params.paletteLoss < lowStart){
        const t =
          params.paletteLoss / lowStart;

        return Math.max(
          lowColors,
          Math.round(
            this.lerp(
              palette.length,
              lowColors,
              Math.pow(t, .75)
            )
          )
        );
      }

      const t =
        (params.paletteLoss - lowStart) /
        (1 - lowStart);

      return Math.max(
        minPaletteSize,
        Math.round(
          this.lerp(
            lowColors,
            minPaletteSize,
            Math.pow(t, 1.25)
          )
        )
      );
    }

    const minPaletteSize =
      Math.min(
        profile.minColors,
        palette.length
      );

    return Math.max(
      1,
      Math.round(
        this.lerp(
          palette.length,
          minPaletteSize,
          Math.pow(
            params.paletteLoss,
            profile.colorSizeExp
          )
        )
      )
    );

  }

}
