import { rgbState }
from "./rgbState.js";



export class RgbSplit{

  constructor(){

    this.state =
      rgbState;

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



  wrap(value,max){

    return (
      (value % max) +
      max
    ) % max;

  }



  sample(data,w,h,x,y,channel,mode){

    if(mode === "wrap"){

      x = this.wrap(x,w);
      y = this.wrap(y,h);

    }else{

      x = this.clamp(x,0,w - 1);
      y = this.clamp(y,0,h - 1);

    }

    const x0 =
      Math.floor(x);

    const y0 =
      Math.floor(y);

    const x1 =
      mode === "wrap"
        ? this.wrap(x0 + 1,w)
        : this.clamp(x0 + 1,0,w - 1);

    const y1 =
      mode === "wrap"
        ? this.wrap(y0 + 1,h)
        : this.clamp(y0 + 1,0,h - 1);

    const tx =
      x - x0;

    const ty =
      y - y0;

    const i00 =
      (y0 * w + x0) * 4 + channel;

    const i10 =
      (y0 * w + x1) * 4 + channel;

    const i01 =
      (y1 * w + x0) * 4 + channel;

    const i11 =
      (y1 * w + x1) * 4 + channel;

    const a =
      data[i00] * (1 - tx) +
      data[i10] * tx;

    const b =
      data[i01] * (1 - tx) +
      data[i11] * tx;

    return (
      a * (1 - ty) +
      b * ty
    );

  }



  blurRgb(frame,w,h,radius){

    const source =
      new Uint8ClampedArray(
        frame.data
      );

    const target =
      frame.data;

    const temp =
      new Uint8ClampedArray(
        frame.data.length
      );

    const r =
      Math.min(
        8,
        Math.max(0,Math.round(radius))
      );

    if(!r){
      return;
    }

    for(let y = 0; y < h; y++){

      for(let x = 0; x < w; x++){

        let sr = 0;
        let sg = 0;
        let sb = 0;
        let count = 0;

        for(let xx = -r; xx <= r; xx++){

          const sx =
            this.clamp(x + xx,0,w - 1);

          const si =
            (y * w + sx) * 4;

          sr += source[si];
          sg += source[si + 1];
          sb += source[si + 2];
          count++;

        }

        const i =
          (y * w + x) * 4;

        temp[i] =
          sr / count;

        temp[i + 1] =
          sg / count;

        temp[i + 2] =
          sb / count;

        temp[i + 3] =
          source[i + 3];

      }

    }

    for(let y = 0; y < h; y++){

      for(let x = 0; x < w; x++){

        let sr = 0;
        let sg = 0;
        let sb = 0;
        let count = 0;

        for(let yy = -r; yy <= r; yy++){

          const sy =
            this.clamp(y + yy,0,h - 1);

          const si =
            (sy * w + x) * 4;

          sr += temp[si];
          sg += temp[si + 1];
          sb += temp[si + 2];
          count++;

        }

        const i =
          (y * w + x) * 4;

        target[i] =
          sr / count;

        target[i + 1] =
          sg / count;

        target[i + 2] =
          sb / count;

        target[i + 3] =
          source[i + 3];

      }

    }

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

    const output =
      core.outputs.rgb;

    output.ctx.clearRect(
      0,
      0,
      w,
      h
    );

    if(
      this.state.bypass ||
      this.state.amount <= 0
    ){

      output.ctx.putImageData(
        core.sourcePixels,
        0,
        0
      );

      return;

    }

    const src =
      core.sourcePixels.data;

    const frame =
      new ImageData(w,h);

    const out =
      frame.data;

    const amountNorm =
      this.state.amount / 100;

    const shift =
      Math.pow(amountNorm,2.2) * 120;

    const angle =
      this.state.angle * Math.PI / 180;

    const cx =
      Math.cos(angle);

    const cy =
      Math.sin(angle);

    const jitter =
      this.state.jitter / 100;

    const seed =
      this.state.seed +
      Math.floor(progress * 1000);

    const jr =
      (this.rand(seed + 1) - 0.5) *
      jitter *
      shift;

    const jb =
      (this.rand(seed + 2) - 0.5) *
      jitter *
      shift;

    const jg =
      (this.rand(seed + 3) - 0.5) *
      jitter *
      shift *
      0.35;

    const red =
      (this.state.redOffset / 100) *
      shift;

    const blue =
      (this.state.blueOffset / 100) *
      shift;

    const green =
      (this.state.greenBias / 50) *
      shift *
      0.25;

    const rdx =
      cx * red + jr;

    const rdy =
      cy * red;

    const bdx =
      cx * blue + jb;

    const bdy =
      cy * blue;

    const gdx =
      cx * green + jg;

    const gdy =
      cy * green;

    const leak =
      this.state.leak / 100;

    const sampleMode =
      this.state.sampleMode;

    const separationMode =
      this.state.separationMode || "linear";

    const fringeMode =
      this.state.fringeMode || "rgb";

    const centerX =
      w * 0.5;

    const centerY =
      h * 0.5;

    const maxRadius =
      Math.max(1,Math.hypot(centerX,centerY));

    for(let y = 0; y < h; y++){

      for(let x = 0; x < w; x++){

        const i =
          (y * w + x) * 4;

        let rShiftX =
          rdx;

        let rShiftY =
          rdy;

        let gShiftX =
          gdx;

        let gShiftY =
          gdy;

        let bShiftX =
          bdx;

        let bShiftY =
          bdy;

        if(separationMode === "radial"){

          const vx =
            x - centerX;

          const vy =
            y - centerY;

          const radius =
            Math.max(1,Math.hypot(vx,vy));

          const nx =
            vx / radius;

          const ny =
            vy / radius;

          const radialGain =
            0.25 +
            radius / maxRadius;

          rShiftX =
            (nx * red + jr) * radialGain;

          rShiftY =
            ny * red * radialGain;

          bShiftX =
            (nx * blue + jb) * radialGain;

          bShiftY =
            ny * blue * radialGain;

          gShiftX =
            (nx * green + jg) * radialGain;

          gShiftY =
            ny * green * radialGain;

        }else if(separationMode === "scanline"){

          const rowWave =
            Math.sin(y * 0.16 + seed * 0.017) *
            jitter *
            shift *
            0.65;

          const rowSkew =
            Math.sin((y / Math.max(1,h)) * Math.PI * 8 + angle) *
            shift *
            0.12;

          rShiftX =
            rdx + rowWave + rowSkew;

          bShiftX =
            bdx - rowWave - rowSkew;

          gShiftX =
            gdx + rowWave * 0.35;

        }

        const r =
          this.sample(src,w,h,x - rShiftX,y - rShiftY,0,sampleMode);

        const g =
          this.sample(src,w,h,x - gShiftX,y - gShiftY,1,sampleMode);

        const b =
          this.sample(src,w,h,x - bShiftX,y - bShiftY,2,sampleMode);

        const baseR =
          src[i];

        const baseG =
          src[i + 1];

        const baseB =
          src[i + 2];

        let fringeR =
          r;

        let fringeG =
          g;

        let fringeB =
          b;

        if(fringeMode === "cyan"){

          fringeR =
            r * 0.58 +
            baseR * 0.42;

          fringeG =
            Math.max(g, b * 0.72);

          fringeB =
            Math.max(b, g * 0.82);

        }else if(fringeMode === "magenta"){

          fringeR =
            Math.max(r, b * 0.72);

          fringeG =
            g * 0.58 +
            baseG * 0.42;

          fringeB =
            Math.max(b, r * 0.76);

        }else if(fringeMode === "heat"){

          fringeR =
            Math.max(r, g * 0.62);

          fringeG =
            g * 0.78 +
            r * 0.18;

          fringeB =
            b * 0.55 +
            baseB * 0.45;

        }

        out[i] =
          fringeR * (1 - leak) +
          ((fringeG + fringeB) * 0.5) * leak;

        out[i + 1] =
          fringeG * (1 - leak) +
          ((fringeR + fringeB) * 0.5) * leak;

        out[i + 2] =
          fringeB * (1 - leak) +
          ((fringeR + fringeG) * 0.5) * leak;

        out[i + 3] =
          src[i + 3];

        if(leak > 0.35){

          out[i] =
            Math.max(out[i],baseR);

          out[i + 1] =
            Math.max(out[i + 1],baseG);

          out[i + 2] =
            Math.max(out[i + 2],baseB);

        }

      }

    }

    this.blurRgb(
      frame,
      w,
      h,
      this.state.blur / 4
    );

    output.ctx.putImageData(
      frame,
      0,
      0
    );

    if(this.state.paletteColor){

      output.ctx.save();
      output.ctx.globalCompositeOperation =
        "screen";
      output.ctx.globalAlpha =
        Math.min(
          0.58,
          0.26 + leak * 0.32
        );
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
      type:"rgbSplit",
      ...this.state
    };

  }

}
