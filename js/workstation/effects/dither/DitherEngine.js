import { ditherState }
from "./ditherState.js";



const BAYER_2 = [
  0,2,
  3,1
];

const BAYER_4 = [
  0,8,2,10,
  12,4,14,6,
  3,11,1,9,
  15,7,13,5
];

const BAYER_8 = [
  0,32,8,40,2,34,10,42,
  48,16,56,24,50,18,58,26,
  12,44,4,36,14,46,6,38,
  60,28,52,20,62,30,54,22,
  3,35,11,43,1,33,9,41,
  51,19,59,27,49,17,57,25,
  15,47,7,39,13,45,5,37,
  63,31,55,23,61,29,53,21
];

const BLUE_NOISE_2 = [
  1,3,
  2,0
];

const BLUE_NOISE_4 = [
  6,13,3,10,
  15,1,8,4,
  2,11,7,14,
  9,5,12,0
];

const BLUE_NOISE_8 = [
  23,55,11,47,19,51,7,43,
  63,31,39,15,59,27,35,3,
  10,46,22,54,6,42,18,50,
  38,14,62,30,34,2,58,26,
  21,53,9,45,17,49,5,41,
  61,29,37,13,57,25,33,1,
  8,44,20,52,4,40,16,48,
  36,12,60,28,32,0,56,24
];

const PALETTE_LEVELS = {
  2:2,
  4:3,
  8:4,
  16:5,
  32:6,
  64:8,
  128:12
};



export class DitherEngine{

  constructor(){

    this.state =
      ditherState;

  }



  clamp(value,min,max){

    return Math.max(
      min,
      Math.min(max,value)
    );

  }



  rand(seed){

    const x =
      Math.sin(seed) * 10000;

    return x - Math.floor(x);

  }



  levels(){

    return PALETTE_LEVELS[
      this.state.paletteSize
    ] || 5;

  }



  matrix(type = "bayer"){

    const size =
      parseInt(
        this.state.matrixSize,
        10
      ) || 4;

    if(type === "blueNoise"){

      if(size === 2){
        return {
          size:2,
          values:BLUE_NOISE_2
        };
      }

      if(size === 8){
        return {
          size:8,
          values:BLUE_NOISE_8
        };
      }

      return {
        size:4,
        values:BLUE_NOISE_4
      };

    }

    if(size === 2){
      return {
        size:2,
        values:BAYER_2
      };
    }

    if(size === 8){
      return {
        size:8,
        values:BAYER_8
      };
    }

    return {
      size:4,
      values:BAYER_4
    };

  }



  adjustColor(r,g,b){

    const contrast =
      1 + this.state.contrast / 100;

    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    if(this.state.paletteBias === "neon"){
      r *= 1.18;
      g *= 1.12;
      b *= 1.28;
    }

    if(this.state.paletteBias === "crt"){
      r *= 1.08;
      g *= 1.18;
      b *= 0.86;
    }

    if(this.state.paletteBias === "cmyk"){
      r *= 0.92;
      g *= 1.04;
      b *= 1.14;
    }

    if(this.state.paletteBias === "vapor"){
      r *= 1.28;
      g *= 0.92;
      b *= 1.24;
    }

    return [
      this.clamp(r,0,255),
      this.clamp(g,0,255),
      this.clamp(b,0,255)
    ];

  }



  luma(r,g,b){

    return r * 0.2126 +
      g * 0.7152 +
      b * 0.0722;

  }



  tonePrep(value){

    const black =
      this.clamp(
        this.state.blackPoint ?? 0,
        0,
        254
      );

    const white =
      this.clamp(
        this.state.whitePoint ?? 255,
        black + 1,
        255
      );

    const gamma =
      this.clamp(
        this.state.gamma ?? 1,
        0.25,
        3
      );

    const normalized =
      this.clamp(
        (value - black) / (white - black),
        0,
        1
      );

    return Math.pow(
      normalized,
      1 / gamma
    ) * 255;

  }



  quantize(value,levels){

    return Math.round(
      this.clamp(value,0,255) / 255 *
      (levels - 1)
    ) / (levels - 1) * 255;

  }



  quantizeRgb(r,g,b,levels){

    return [
      this.quantize(r,levels),
      this.quantize(g,levels),
      this.quantize(b,levels)
    ];

  }



  quantizeColor(r,g,b,levels){

    const mode =
      this.state.channelMode || "rgb";

    if(mode === "mono"){

      const value =
        this.luma(r,g,b) >= 128 ? 255 : 0;

      return [
        value,
        value,
        value
      ];

    }

    if(mode === "luma"){

      const y =
        this.luma(r,g,b);

      const qy =
        this.quantize(
          y,
          levels
        );

      const delta =
        qy - y;

      return [
        this.clamp(r + delta,0,255),
        this.clamp(g + delta,0,255),
        this.clamp(b + delta,0,255)
      ];

    }

    if(mode === "indexed"){

      const channelLevels =
        Math.max(
          2,
          Math.round(
            Math.cbrt(this.state.paletteSize || 16)
          )
        );

      return this.quantizeRgb(
        r,
        g,
        b,
        channelLevels
      );

    }

    return this.quantizeRgb(
      r,
      g,
      b,
      levels
    );

  }



  prepareSource(source,w,h){

    const data =
      new Float32Array(
        source.data.length
      );

    for(let i = 0; i < source.data.length; i += 4){

      let r =
        this.tonePrep(source.data[i]);

      let g =
        this.tonePrep(source.data[i + 1]);

      let b =
        this.tonePrep(source.data[i + 2]);

      const seed =
        this.state.seed + i;

      const noise =
        (this.rand(seed) - 0.5) *
        this.state.noise *
        2.55;

      [r,g,b] =
        this.adjustColor(
          r + noise,
          g + noise,
          b + noise
        );

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = source.data[i + 3];

    }

    return data;

  }



  drawOrdered(source,out,w,h,levels,type){

    const data =
      this.prepareSource(source,w,h);

    const scale =
      this.state.patternScale;

    const matrix =
      this.matrix(type);

    const maxValue =
      matrix.size * matrix.size - 1;

    for(let y = 0; y < h; y++){

      for(let x = 0; x < w; x++){

        const i =
          (y * w + x) * 4;

        const mx =
          Math.floor(x / scale) % matrix.size;

        const my =
          Math.floor(y / scale) % matrix.size;

        const threshold =
          (matrix.values[my * matrix.size + mx] / maxValue - 0.5) *
          (255 / levels);

        const q =
          this.quantizeColor(
            data[i] + threshold,
            data[i + 1] + threshold,
            data[i + 2] + threshold,
            levels
          );

        out[i] = q[0];
        out[i + 1] = q[1];
        out[i + 2] = q[2];
        out[i + 3] = data[i + 3];

      }

    }

  }



  drawBayer(source,out,w,h,levels){

    this.drawOrdered(
      source,
      out,
      w,
      h,
      levels,
      "bayer"
    );

  }



  drawBlueNoise(source,out,w,h,levels){

    this.drawOrdered(
      source,
      out,
      w,
      h,
      levels,
      "blueNoise"
    );

  }



  diffusionAmount(){

    const base =
      this.clamp(
        this.state.diffusion,
        0,
        150
      ) / 100;

    if(this.state.diffusionCurve === "soft"){
      return base * 0.7;
    }

    if(this.state.diffusionCurve === "aggressive"){
      return Math.min(
        base * 1.25,
        1.875
      );
    }

    return base;

  }



  diffuse(data,w,h,x,y,er,eg,eb,weight){

    if(
      x < 0 ||
      y < 0 ||
      x >= w ||
      y >= h
    ){
      return;
    }

    const i =
      (y * w + x) * 4;

    data[i] =
      this.clamp(
        data[i] + er * weight,
        0,
        255
      );

    data[i + 1] =
      this.clamp(
        data[i + 1] + eg * weight,
        0,
        255
      );

    data[i + 2] =
      this.clamp(
        data[i + 2] + eb * weight,
        0,
        255
      );

  }



  drawFloyd(source,out,w,h,levels){

    const data =
      this.prepareSource(source,w,h);

    const diffusion =
      this.diffusionAmount();

    for(let y = 0; y < h; y++){

      for(let x = 0; x < w; x++){

        const i =
          (y * w + x) * 4;

        const oldR =
          data[i];

        const oldG =
          data[i + 1];

        const oldB =
          data[i + 2];

        const q =
          this.quantizeColor(
            oldR,
            oldG,
            oldB,
            levels
          );

        out[i] = q[0];
        out[i + 1] = q[1];
        out[i + 2] = q[2];
        out[i + 3] = data[i + 3];

        const er =
          (oldR - q[0]) * diffusion;

        const eg =
          (oldG - q[1]) * diffusion;

        const eb =
          (oldB - q[2]) * diffusion;

        if(this.state.algorithm === "atkinson"){

          const wgt =
            1 / 8;

          this.diffuse(data,w,h,x + 1,y,er,eg,eb,wgt);
          this.diffuse(data,w,h,x + 2,y,er,eg,eb,wgt);
          this.diffuse(data,w,h,x - 1,y + 1,er,eg,eb,wgt);
          this.diffuse(data,w,h,x,y + 1,er,eg,eb,wgt);
          this.diffuse(data,w,h,x + 1,y + 1,er,eg,eb,wgt);
          this.diffuse(data,w,h,x,y + 2,er,eg,eb,wgt);

        }else{

          this.diffuse(data,w,h,x + 1,y,er,eg,eb,7 / 16);
          this.diffuse(data,w,h,x - 1,y + 1,er,eg,eb,3 / 16);
          this.diffuse(data,w,h,x,y + 1,er,eg,eb,5 / 16);
          this.diffuse(data,w,h,x + 1,y + 1,er,eg,eb,1 / 16);

        }

      }

    }

  }



  drawRandom(source,out,w,h,levels){

    const data =
      this.prepareSource(source,w,h);

    for(let i = 0; i < data.length; i += 4){

      const threshold =
        (this.rand(this.state.seed + i * 3) - 0.5) *
        (255 / levels);

      const q =
        this.quantizeColor(
          data[i] + threshold,
          data[i + 1] + threshold,
          data[i + 2] + threshold,
          levels
        );

      out[i] = q[0];
      out[i + 1] = q[1];
      out[i + 2] = q[2];
      out[i + 3] = data[i + 3];

    }

  }



  draw(core){

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

    const output =
      core.outputs.dither;

    output.ctx.clearRect(0,0,w,h);

    if(
      this.state.bypass ||
      this.state.strength <= 0
    ){

      output.ctx.putImageData(
        core.sourcePixels,
        0,
        0
      );

      return;

    }

    const dithered =
      new ImageData(w,h);

    const levels =
      this.levels();

    if(this.state.algorithm === "bayer"){
      this.drawBayer(core.sourcePixels,dithered.data,w,h,levels);
    }else if(this.state.algorithm === "blueNoise"){
      this.drawBlueNoise(core.sourcePixels,dithered.data,w,h,levels);
    }else if(
      this.state.algorithm === "floyd" ||
      this.state.algorithm === "atkinson"
    ){
      this.drawFloyd(core.sourcePixels,dithered.data,w,h,levels);
    }else{
      this.drawRandom(core.sourcePixels,dithered.data,w,h,levels);
    }

    const mix =
      this.state.strength / 100;

    const source =
      core.sourcePixels.data;

    const out =
      dithered.data;

    for(let i = 0; i < out.length; i += 4){

      out[i] =
        source[i] * (1 - mix) +
        out[i] * mix;

      out[i + 1] =
        source[i + 1] * (1 - mix) +
        out[i + 1] * mix;

      out[i + 2] =
        source[i + 2] * (1 - mix) +
        out[i + 2] * mix;

      out[i + 3] =
        source[i + 3];

    }

    output.ctx.putImageData(
      dithered,
      0,
      0
    );

    if(this.state.paletteColor){

      output.ctx.save();
      output.ctx.globalCompositeOperation =
        "overlay";
      output.ctx.globalAlpha =
        0.28;
      output.ctx.fillStyle =
        this.state.paletteColor;
      output.ctx.fillRect(
        0,
        0,
        w,
        h
      );
      output.ctx.restore();

    }

  }



  serialize(){

    return {
      type:"dither",
      ...this.state
    };

  }

}
