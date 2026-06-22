import {
  artifactDefaults
} from "./artifactState.js";

export class ArtifactEngine{
  constructor(){
    this.state = {
      ...artifactDefaults
    };

    this.stale =
      null;

    this.reference =
      null;

    this.ghost =
      null;

    this.motionMap =
      null;

    this.motionKey =
      "";

    this.recoveryMap =
      null;

    this.recoveryKey =
      "";

    this.collapseEnergy =
      this.state.collapseEnergy || 0;

    this.frameIndex =
      0;

    this.lastSize =
      "";

    this.outBuffer =
      null;

    this.nextStaleBuffer =
      null;

    this.nextReferenceBuffer =
      null;

    this.nextGhostBuffer =
      null;

    this.signalBuffer =
      null;

    this.nextRecoveryBuffer =
      null;

    this.transientTrimTimer =
      null;
  }

  resetBuffer(){
    this.stale =
      null;

    this.reference =
      null;

    this.ghost =
      null;

    this.motionMap =
      null;

    this.motionKey =
      "";

    this.recoveryMap =
      null;

    this.recoveryKey =
      "";

    this.collapseEnergy =
      0;

    this.state.collapseEnergy =
      0;

    this.frameIndex =
      0;

    this.lastSize =
      "";

    this.outBuffer =
      null;

    this.nextStaleBuffer =
      null;

    this.nextReferenceBuffer =
      null;

    this.nextGhostBuffer =
      null;

    this.signalBuffer =
      null;

    this.nextRecoveryBuffer =
      null;

    if(this.transientTrimTimer){
      clearTimeout(
        this.transientTrimTimer
      );

      this.transientTrimTimer =
        null;
    }
  }

  captureMemoryHold(core){
    const output =
      core?.outputs?.ar;

    const w =
      core?.drawW || 0;

    const h =
      core?.drawH || 0;

    if(!output || !w || !h){
      return false;
    }

    ensureCanvas(output.canvas,w,h);

    const frame =
      output.ctx.getImageData(0,0,w,h);

    const data =
      new Uint8ClampedArray(frame.data);

    this.stale =
      data;

    this.reference =
      new Uint8ClampedArray(data);

    this.ghost =
      new Uint8ClampedArray(data);

    this.lastSize =
      `${w}x${h}`;

    return true;
  }

  draw(core){
    const output =
      core.outputs.ar;

    const source =
      core.sourcePixels;

    const w =
      core.drawW;

    const h =
      core.drawH;

    if(!output || !source || !w || !h){
      return;
    }

    ensureCanvas(output.canvas,w,h);

    output.ctx.clearRect(0,0,w,h);

    if(this.state.bypass || this.state.amount <= 0 || this.state.blend <= 0){
      output.ctx.putImageData(source,0,0);
      this.scheduleTransientBufferTrim();
      return;
    }

    const sizeKey =
      `${w}x${h}`;

    if(this.lastSize !== sizeKey || !this.stale || this.stale.length !== source.data.length){
      this.stale =
        new Uint8ClampedArray(source.data);

      this.reference =
        new Uint8ClampedArray(source.data);

      this.ghost =
        new Uint8ClampedArray(source.data);

      this.lastSize =
        sizeKey;
    }

    if(!this.reference || this.reference.length !== source.data.length){
      this.reference =
        new Uint8ClampedArray(source.data);
    }

    if(!this.ghost || this.ghost.length !== source.data.length){
      this.ghost =
        new Uint8ClampedArray(source.data);
    }

    this.frameIndex +=
      1;

    const src =
      source.data;

    const out =
      getUint8Buffer(this,"outBuffer",src.length);

    out.set(src);

    let nextStale =
      null;

    const amount =
      severity(this.state.amount / 100);

    const rawCompression =
      clamp(this.state.compression / 100,0,1);

    const bitrate =
      clamp(this.state.bitrate / 100,0,1);

    const boundary =
      Math.pow(this.state.boundary / 100,1.4) *
      amount;

    const rawPacketLoss =
      clamp(this.state.packetLoss / 100,0,1);

    const rawPacketDrop =
      clamp((this.state.packetDrop || 0) / 100,0,1);

    const updateFailure =
      Math.pow(clamp((this.state.updateFailure || 0) / 100,0,1),1.35);

    const freeze =
      this.state.freezeAmount / 100;

    const chromaLoss =
      Math.pow(this.state.chromaLoss / 100,1.3) *
      amount;

    const drift =
      Math.pow(this.state.blockDrift / 100,2.2) *
      this.state.blockSize *
      3;

    const rawDecodeError =
      clamp(this.state.decodeError / 100,0,1);

    const bufferDamage =
      clamp((this.state.bufferDamage ?? this.state.bufferReuse ?? 0) / 100,0,1);

    const baseRecovery =
      clamp(this.state.recovery / 100,0,1);

    this.collapseEnergy =
      updateCollapseEnergy({
        previous:this.collapseEnergy ?? this.state.collapseEnergy ?? 0,
        mode:this.state.mode,
        packetLoss:rawPacketLoss,
        decodeError:rawDecodeError,
        bufferDamage,
        recovery:baseRecovery,
        amount
      });

    this.state.collapseEnergy =
      this.collapseEnergy;

    const collapse =
      this.collapseEnergy;

    const ringing =
      Math.pow(clamp((this.state.ringing || 0) / 100,0,1),1.25) *
      (0.25 + amount + (1 - bitrate) * 0.65 + collapse * 0.45);

    const bufferRepeat =
      Math.pow(clamp((this.state.bufferRepeat || 0) / 100,0,1),1.35) *
      (0.35 + amount + collapse * 0.7);

    const ghosting =
      Math.pow(clamp((this.state.ghosting || 0) / 100,0,1),1.25) *
      (0.35 + amount + collapse * 0.5);

    const chromaOffset =
      Math.pow(
        clamp((this.state.chromaOffset ?? this.state.chromaLoss * 0.45) / 100,0,1),
        1.2
      ) *
      (0.25 + amount + collapse * 0.45);

    const chromaBleed =
      Math.pow(
        clamp((this.state.chromaBleed ?? this.state.chromaLoss * 0.55) / 100,0,1),
        1.15
      ) *
      (0.35 + amount + collapse * 0.35);

    const chromaSmear =
      Math.pow(
        clamp((this.state.chromaSmear ?? this.state.chromaLoss * 0.35) / 100,0,1),
        1.2
      ) *
      (0.25 + amount + collapse * 0.75);

    const compression =
      Math.pow(clamp(rawCompression + collapse * 0.38,0,1),1.7);

    const packetLoss =
      Math.pow(clamp(rawPacketLoss + collapse * 0.45,0,1),2) *
      (0.25 + amount * 1.15 + collapse * 0.85);

    const packetDrop =
      Math.pow(clamp(rawPacketDrop + collapse * 0.35,0,1),1.55) *
      (0.35 + amount + collapse * 0.75);

    const decodeError =
      Math.pow(clamp(rawDecodeError + collapse * 0.42,0,1),2) *
      (0.3 + amount + collapse * 0.7);

    const bufferReuse =
      Math.pow(
        Math.max(bufferDamage,this.state.bufferReuse / 100),
        1.6
      ) *
      amount;

    const recovery =
      clamp(
        baseRecovery * (1 - bufferDamage * 0.72) * (1 - collapse * 0.62),
        0,
        1
      );

    const recoveryNoise =
      Math.pow(clamp((this.state.recoveryNoise || 0) / 100,0,1),1.25) *
      (0.25 + amount + collapse * 0.65);

    const tracking =
      Math.pow(clamp((this.state.tracking || 0) / 100,0,1),1.45);

    const tearing =
      Math.pow(clamp((this.state.tearing || 0) / 100,0,1),1.35);

    const dropout =
      Math.pow(clamp((this.state.dropout || 0) / 100,0,1),1.35) *
      1.15;

    const headSwitch =
      Math.pow(clamp((this.state.headSwitch || 0) / 100,0,1),1.2) *
      (0.62 + tracking * 0.25);

    const chromaCrawl =
      Math.pow(clamp((this.state.chromaCrawl || 0) / 100,0,1),1.1) *
      (0.86 + chromaLoss * 0.28);

    const verticalJump =
      Math.pow(clamp((this.state.verticalJump || 0) / 100,0,1),1.25) *
      (0.64 + tracking * 0.2);

    const syncRoll =
      Math.pow(clamp((this.state.syncRoll || 0) / 100,0,1),1.25) *
      (0.68 + headSwitch * 0.22 + tracking * 0.14);

    const tvSnow =
      Math.pow(clamp((this.state.tvSnow || 0) / 100,0,1),1.18) *
      (0.7 + dropout * 0.22 + headSwitch * 0.12);

    const tvBurst =
      Math.pow(clamp((this.state.tvBurst || 0) / 100,0,1),1.16) *
      (0.7 + tvSnow * 0.22 + dropout * 0.12);

    const motionCorruption =
      Math.pow(clamp((this.state.motionCorruption || 0) / 100,0,1),1.35) *
      (0.45 + amount + collapse * 0.75);

    const datamoshAmount =
      Math.pow(clamp((this.state.datamoshAmount || 0) / 100,0,1),1.2) *
      (0.35 + amount + collapse * 0.9);

    const vectorPersistence =
      clamp((this.state.vectorPersistence ?? 55) / 100,0,1);

    const motionQuality =
      clamp((this.state.motionQuality ?? 65) / 100,0,1);

    const block =
      clamp(Math.round(this.state.blockSize),4,64);

    const regionSize =
      clamp(
        Math.round((this.state.regionSize || block * 3) / block) * block,
        block,
        256
      );

    const blend =
      clamp(this.state.blend / 100,0,1);

    const palette =
      parseColor(this.state.paletteColor);

    const paletteAmount =
      Math.pow(clamp((this.state.paletteAmount || 0) / 100,0,1),1.15) *
      amount;

    const paletteBlend =
      this.state.paletteBlend || "overlay";

    const seed =
      this.state.seed || 1;

    const digitalFrame =
      0;

    const motionFrame =
      0;

    const vhsFrame =
      0;

    const signalEnergy =
      clamp(
        Math.max(
          tracking,
          tearing,
          dropout,
          headSwitch,
          chromaCrawl,
          verticalJump,
          syncRoll,
          tvSnow,
          tvBurst
        ),
        0,
        1
      );

    const holdDigitalMemory =
      this.state.memoryHold ||
      this.skipDigitalMemoryUpdateOnce === true;

    if(!holdDigitalMemory){
      nextStale =
        getUint8Buffer(this,"nextStaleBuffer",this.stale.length);

      nextStale.set(this.stale);
    }

    const recoveryCols =
      Math.ceil(w / block);

    const recoveryRows =
      Math.ceil(h / block);

    const recoveryKey =
      `${recoveryCols}x${recoveryRows}x${block}`;

    if(
      this.recoveryKey !== recoveryKey ||
      !this.recoveryMap ||
      this.recoveryMap.length !== recoveryCols * recoveryRows
    ){
      this.recoveryMap =
        new Float32Array(recoveryCols * recoveryRows);

      this.recoveryKey =
        recoveryKey;
    }

    const nextRecoveryMap =
      holdDigitalMemory
        ? null
        : getFloat32Buffer(this,"nextRecoveryBuffer",this.recoveryMap.length);

    if(nextRecoveryMap){
      nextRecoveryMap.set(this.recoveryMap);
    }

    for(let by = 0; by < h; by += block){
      for(let bx = 0; bx < w; bx += block){
        processBlock({
          src,
          stale:this.stale,
          reference:this.reference,
          nextStale,
          out,
          w,
          h,
          bx,
          by,
          block,
          amount,
          compression,
          bitrate,
          boundary,
          ringing,
          packetLoss,
          packetDrop,
          regionSize,
          updateFailure,
          freeze,
          chromaLoss,
          chromaOffset,
          chromaBleed,
          chromaSmear,
          drift,
          decodeError,
          bufferDamage,
          bufferRepeat,
          bufferReuse,
          recovery,
          recoveryNoise,
          recoveryMap:this.recoveryMap,
          nextRecoveryMap,
          recoveryCols,
          collapse,
          blend,
          palette,
          paletteAmount,
          paletteBlend,
          seed,
          frameIndex:digitalFrame
        });
      }
    }

    if(motionCorruption > 0 || datamoshAmount > 0){
      const motionState =
        applyMotionDamage({
          src,
          reference:this.reference,
          out,
          w,
          h,
          block,
          motionCorruption,
          datamoshAmount,
          vectorPersistence,
          motionQuality,
          collapse,
          blend,
          seed,
          frameIndex:motionFrame,
          previousMap:this.motionMap,
          previousKey:this.motionKey
        });

      this.motionMap =
        motionState.map;

      this.motionKey =
        motionState.key;
    }else{
      this.motionMap =
        null;

      this.motionKey =
        "";
    }

    if(!holdDigitalMemory){
      this.recoveryMap =
        nextRecoveryMap;
    }

    const nextGhost =
      applyGhosting({
        src,
        out,
        ghost:this.ghost,
        w,
        h,
        amount,
        ghosting,
        recovery,
        palette,
        paletteAmount,
        paletteBlend,
        blend,
        nextGhostBuffer:this.nextGhostBuffer
      });

    if(!holdDigitalMemory){
      const previousGhost =
        this.ghost;

      this.ghost =
        nextGhost;

      this.nextGhostBuffer =
        previousGhost;
    }

    applySignalDamage({
      src,
      out,
      w,
      h,
      amount:signalEnergy,
      tracking,
      tearing,
      dropout,
      headSwitch,
      chromaCrawl,
      verticalJump,
      syncRoll,
      tvSnow,
      tvBurst,
      chromaLoss,
      palette,
      paletteAmount,
      paletteBlend,
      blend,
      seed,
      frameIndex:vhsFrame,
      signalBuffer:getUint8Buffer(this,"signalBuffer",src.length)
    });

    if(!holdDigitalMemory){
      const previousStale =
        this.stale;

      this.stale =
        nextStale;

      this.nextStaleBuffer =
        previousStale;
    }

    if(!holdDigitalMemory){
      const nextReference =
        getUint8Buffer(this,"nextReferenceBuffer",out.length);

      nextReference.set(out);

      const previousReference =
        this.reference;

      this.reference =
        nextReference;

      this.nextReferenceBuffer =
        previousReference;
    }

    this.skipDigitalMemoryUpdateOnce =
      false;

    output.ctx.putImageData(
      new ImageData(out,w,h),
      0,
      0
    );

    this.scheduleTransientBufferTrim();
  }

  scheduleTransientBufferTrim(){
    if(this.transientTrimTimer){
      clearTimeout(
        this.transientTrimTimer
      );
    }

    this.transientTrimTimer =
      setTimeout(
        () => {
          this.outBuffer =
            null;

          this.nextStaleBuffer =
            null;

          this.nextReferenceBuffer =
            null;

          this.nextGhostBuffer =
            null;

          this.signalBuffer =
            null;

          this.nextRecoveryBuffer =
            null;

          this.transientTrimTimer =
            null;
        },
        1600
      );
  }

  serialize(){
    return {
      type:"artifact",
      version:"2.27-tv-section-burst",
      ...this.state
    };
  }

  deserialize(data = {}){
    Object.assign(
      this.state,
      artifactDefaults,
      data
    );
  }
}

function processBlock(config){
  const {
    src,
    stale,
    reference,
    nextStale,
    out,
    w,
    h,
    bx,
    by,
    block,
    amount,
    compression,
    bitrate,
    boundary,
    ringing,
    packetLoss,
    packetDrop,
    regionSize,
    updateFailure,
    freeze,
    chromaLoss,
    chromaOffset,
    chromaBleed,
    chromaSmear,
    drift,
    decodeError,
    bufferDamage,
    bufferRepeat,
    bufferReuse,
    recovery,
    recoveryNoise,
    recoveryMap,
    nextRecoveryMap,
    recoveryCols,
    collapse,
    blend,
    palette,
    paletteAmount,
    paletteBlend,
    seed,
    frameIndex
  } = config;

  const bw =
    Math.min(block,w - bx);

  const bh =
    Math.min(block,h - by);

  const random =
    hash01(
      seed,
      Math.floor(bx / Math.max(regionSize,1)),
      Math.floor(by / Math.max(regionSize,1)),
      Math.floor(frameIndex / 3)
    );

  const blockCol =
    Math.floor(bx / block);

  const blockRow =
    Math.floor(by / block);

  const recoveryIndex =
    blockRow * recoveryCols + blockCol;

  const recoveryHold =
    recoveryMap
      ? recoveryMap[recoveryIndex] || 0
      : 0;

  const hardDrop =
    hash01(
      seed + 43,
      Math.floor(bx / Math.max(regionSize,1)),
      Math.floor(by / Math.max(regionSize,1)),
      Math.floor(frameIndex / 4)
    ) < packetDrop;

  const failedUpdate =
    recoveryHold > 0.05 &&
    hash01(seed + 47,bx / block,by / block,Math.floor(frameIndex / 2)) <
      updateFailure * (0.45 + recoveryHold * 0.55);

  const frozen =
    random < packetLoss ||
    hardDrop ||
    failedUpdate;

  const reused =
    !frozen &&
    hash01(seed + 53,bx / block,by / block,Math.floor(frameIndex / 5)) <
      bufferReuse + recoveryHold * 0.22;

  const corrupt =
    hash01(seed + 79,bx / block,by / block,Math.floor(frameIndex / 4)) <
    decodeError + recoveryHold * 0.18;

  const referenceLoss =
    hash01(seed + 83,bx / block,by / block,Math.floor(frameIndex / 6)) <
    decodeError * (0.35 + collapse * 0.75);

  const bufferOverread =
    hash01(seed + 87,bx / block,by / block,Math.floor(frameIndex / 5)) <
    bufferDamage * (0.25 + collapse * 0.55);

  const bufferRepeatHit =
    hash01(seed + 89,bx / block,by / block,Math.floor(frameIndex / 6)) <
    bufferRepeat * (0.28 + collapse * 0.5);

  const dx =
    Math.round((hash01(seed + 17,bx,by,frameIndex) * 2 - 1) * drift);

  const dy =
    Math.round((hash01(seed + 31,bx,by,frameIndex) * 2 - 1) * drift);

  const mean =
    getBlockMean(src,w,h,bx,by,bw,bh);

  const levels =
    Math.max(
      5,
      Math.round(256 - compression * amount * (196 + (1 - bitrate) * 56))
    );

  for(let y = 0; y < bh; y += 1){
    for(let x = 0; x < bw; x += 1){
      const px =
        bx + x;

      const py =
        by + y;

      const i =
        (py * w + px) * 4;

      const sampleX =
        clamp(px + dx,0,w - 1);

      const sampleY =
        clamp(py + dy,0,h - 1);

      const si =
        (sampleY * w + sampleX) * 4;

      const overreadX =
        clamp(
          px + dx + Math.round((hash01(seed + 101,bx,by,1) * 2 - 1) * block * (1 + collapse * 3)),
          0,
          w - 1
        );

      const overreadY =
        clamp(
          py + dy + Math.round((hash01(seed + 103,bx,by,2) * 2 - 1) * block * (1 + collapse * 2)),
          0,
          h - 1
        );

      const oi =
        (overreadY * w + overreadX) * 4;

      let r =
        src[si];

      let g =
        src[si + 1];

      let b =
        src[si + 2];

      r = mix(r,mean.r,compression * amount * 0.6);
      g = mix(g,mean.g,compression * amount * 0.6);
      b = mix(b,mean.b,compression * amount * 0.6);

      r = quantize(r,levels);
      g = quantize(g,levels);
      b = quantize(b,levels);

      if(corrupt){
        const corruptMode =
          Math.floor(hash01(seed + 91,bx,by,frameIndex) * 5);

        if(corruptMode === 0){
          r = quantize(255 - r,levels);
          g = quantize(g * 0.55,levels);
          b = quantize(255 - b,levels);
        }else if(corruptMode === 1){
          r = mean.b;
          g = mean.r;
          b = mean.g;
        }else if(corruptMode === 2){
          r = reference[oi];
          g = reference[oi + 1];
          b = reference[oi + 2];
        }else if(corruptMode === 3){
          const neighbor =
            x > 0
              ? i - 4
              : y > 0
                ? i - w * 4
                : i;

          r = out[neighbor];
          g = out[neighbor + 1];
          b = out[neighbor + 2];
        }else{
          r = mean.r * 0.25;
          g = mean.g * 0.25;
          b = mean.b * 0.25;
        }
      }

      if(referenceLoss){
        const referenceMix =
          0.25 + decodeError * 0.55 + collapse * 0.25;

        r = mix(r,reference[oi],referenceMix);
        g = mix(g,reference[oi + 1],referenceMix);
        b = mix(b,reference[oi + 2],referenceMix);
      }

      const luma =
        r * 0.299 + g * 0.587 + b * 0.114;

      const chroma =
        applyChromaCodec({
          src,
          w,
          h,
          px,
          py,
          bx,
          by,
          block,
          luma,
          r,
          g,
          b,
          mean,
          chromaLoss,
          chromaOffset,
          chromaBleed,
          chromaSmear,
          seed,
          frameIndex,
          collapse
        });

      r =
        chroma.r;

      g =
        chroma.g;

      b =
        chroma.b;

      if(ringing > 0){
        const ringed =
          applyRinging({
            src,
            w,
            h,
            px,
            py,
            r,
            g,
            b,
            ringing,
            bitrate,
            block,
            seed,
            frameIndex
          });

        r =
          ringed.r;

        g =
          ringed.g;

        b =
          ringed.b;
      }

      if(x === 0 || y === 0 || x === bw - 1 || y === bh - 1){
        const edge =
          boundary * 34;

        r = clamp(r - edge,0,255);
        g = clamp(g - edge,0,255);
        b = clamp(b - edge,0,255);
      }

      if(frozen || reused){
        const memoryAmount =
          frozen
            ? clamp(freeze + recoveryHold * 0.36 + (hardDrop ? 0.24 : 0),0,1)
            : clamp(bufferReuse + recoveryHold * 0.22,0,1);

        const repeatX =
          clamp(
            bx -
              block *
                (1 + Math.floor(hash01(seed + 109,bx,by,frameIndex) * 3)) +
              (x % block),
            0,
            w - 1
          );

        const repeatY =
          clamp(
            by -
              block *
                Math.floor(hash01(seed + 113,bx,by,frameIndex) * 2) +
              (y % block),
            0,
            h - 1
          );

        const repeatIndex =
          (repeatY * w + repeatX) * 4;

        const memoryIndex =
          bufferRepeatHit
            ? repeatIndex
            : bufferOverread
              ? oi
              : i;

        r = mix(r,stale[memoryIndex],memoryAmount);
        g = mix(g,stale[memoryIndex + 1],memoryAmount);
        b = mix(b,stale[memoryIndex + 2],memoryAmount);
      }

      if(paletteAmount > 0){
        const tinted =
          blendPalette(
            r,
            g,
            b,
            palette,
            paletteBlend,
            paletteAmount
          );

        r =
          tinted.r;

        g =
          tinted.g;

        b =
          tinted.b;
      }

      if(recoveryNoise > 0){
        const noiseContext =
          clamp(
            recoveryHold * 0.72 +
            (frozen ? 0.58 : 0) +
            (reused ? 0.38 : 0) +
            (corrupt ? 0.32 : 0) +
            bufferDamage * 0.28 +
            collapse * 0.24,
            0,
            1
          );

        if(noiseContext > 0){
          const grain =
            hash01(seed + 541,px,py,frameIndex) * 2 - 1;

          const pepper =
            hash01(seed + 547,px >> 1,py >> 1,frameIndex);

          const noiseMix =
            clamp(recoveryNoise * noiseContext,0,0.9);

          const grainValue =
            grain * 72 * noiseMix;

          r = clamp(r + grainValue,0,255);
          g = clamp(g + grainValue * 0.78,0,255);
          b = clamp(b + grainValue * 0.55,0,255);

          if(pepper < noiseMix * 0.12){
            const spark =
              pepper < noiseMix * 0.045
                ? 235
                : 18;

            r = mix(r,spark,noiseMix * 0.72);
            g = mix(g,spark,noiseMix * 0.58);
            b = mix(b,spark,noiseMix * 0.42);
          }
        }
      }

      out[i] =
        mix(src[i],r,blend);

      out[i + 1] =
        mix(src[i + 1],g,blend);

      out[i + 2] =
        mix(src[i + 2],b,blend);

      out[i + 3] =
        src[i + 3];

      const staleMix =
        frozen
          ? 0.06 + recovery * 0.18
          : 0.25 + recovery * 0.55;

      if(nextStale){
        nextStale[i] =
          mix(stale[i],out[i],staleMix);

        nextStale[i + 1] =
          mix(stale[i + 1],out[i + 1],staleMix);

        nextStale[i + 2] =
          mix(stale[i + 2],out[i + 2],staleMix);

        nextStale[i + 3] =
          src[i + 3];
      }
    }
  }

  if(nextRecoveryMap){
    const repairNoise =
      recoveryNoise *
      (hash01(seed + 503,bx / block,by / block,frameIndex) - 0.35) *
      0.16;

    const damage =
      (frozen ? 0.22 + freeze * 0.3 : 0) +
      (hardDrop ? 0.35 : 0) +
      (failedUpdate ? 0.18 : 0) +
      (corrupt ? 0.12 : 0) +
      (reused ? 0.08 : 0) +
      collapse * 0.08 +
      Math.max(0,repairNoise);

    nextRecoveryMap[recoveryIndex] =
      clamp(
        recoveryHold + damage - (0.045 + recovery * 0.18 - repairNoise),
        0,
        1
      );
  }
}

function getBlockMean(data,w,h,bx,by,bw,bh){
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for(let y = 0; y < bh; y += 1){
    for(let x = 0; x < bw; x += 1){
      const i =
        ((by + y) * w + bx + x) * 4;

      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    }
  }

  return {
    r:r / count,
    g:g / count,
    b:b / count
  };
}

function applyRinging({
  src,
  w,
  h,
  px,
  py,
  r,
  g,
  b,
  ringing,
  bitrate,
  block,
  seed,
  frameIndex
}){
  const center =
    (py * w + px) * 4;

  const nearX =
    Math.min(w - 1,px + 1);

  const nearY =
    Math.min(h - 1,py + 1);

  const xIndex =
    (py * w + nearX) * 4;

  const yIndex =
    (nearY * w + px) * 4;

  const luma =
    src[center] * 0.299 +
    src[center + 1] * 0.587 +
    src[center + 2] * 0.114;

  const xLuma =
    src[xIndex] * 0.299 +
    src[xIndex + 1] * 0.587 +
    src[xIndex + 2] * 0.114;

  const yLuma =
    src[yIndex] * 0.299 +
    src[yIndex + 1] * 0.587 +
    src[yIndex + 2] * 0.114;

  const edge =
    clamp((Math.abs(luma - xLuma) + Math.abs(luma - yLuma)) / 255,0,1);

  if(edge <= 0.02){
    return {
      r,
      g,
      b
    };
  }

  const phase =
    ((px + py) % Math.max(2,Math.round(block / 2))) /
    Math.max(2,Math.round(block / 2));

  const wave =
    Math.sin(
      phase * Math.PI * 2 +
      frameIndex * 0.19 +
      seed * 0.003
    );

  const halo =
    edge *
    ringing *
    (1 - bitrate * 0.65) *
    wave *
    54;

  return {
    r:clamp(r + halo,0,255),
    g:clamp(g + halo * 0.82,0,255),
    b:clamp(b - halo * 0.38,0,255)
  };
}

function applyChromaCodec(config){
  const {
    src,
    w,
    h,
    px,
    py,
    bx,
    by,
    block,
    luma,
    r,
    g,
    b,
    mean,
    chromaLoss,
    chromaOffset,
    chromaBleed,
    chromaSmear,
    seed,
    frameIndex,
    collapse
  } = config;

  if(
    chromaLoss <= 0 &&
    chromaOffset <= 0 &&
    chromaBleed <= 0 &&
    chromaSmear <= 0
  ){
    return {
      r,
      g,
      b
    };
  }

  const cell =
    clamp(
      Math.round(block * (0.35 + chromaLoss * 1.7 + chromaBleed * 0.9)),
      2,
      Math.max(2,block * 2)
    );

  const direction =
    hash01(seed + 401,bx / block,by / block,Math.floor(frameIndex / 5)) < 0.5
      ? -1
      : 1;

  const offset =
    Math.round(
      direction *
      block *
      (chromaOffset * 0.9 + chromaSmear * 0.55 + collapse * 0.35)
    );

  const smear =
    Math.round(
      Math.sin(frameIndex * 0.41 + by * 0.037 + seed * 0.001) *
      block *
      chromaSmear *
      1.8
    );

  const cellX =
    bx + Math.floor((px - bx) / cell) * cell + Math.floor(cell / 2);

  const cellY =
    by + Math.floor((py - by) / cell) * cell + Math.floor(cell / 2);

  const sx =
    clamp(cellX + offset + smear,0,w - 1);

  const sy =
    clamp(cellY + Math.round(offset * 0.18),0,h - 1);

  const si =
    (sy * w + sx) * 4;

  const sampleLuma =
    src[si] * 0.299 +
    src[si + 1] * 0.587 +
    src[si + 2] * 0.114;

  const meanLuma =
    mean.r * 0.299 +
    mean.g * 0.587 +
    mean.b * 0.114;

  const sampleChroma = {
    r:src[si] - sampleLuma,
    g:src[si + 1] - sampleLuma,
    b:src[si + 2] - sampleLuma
  };

  const meanChroma = {
    r:mean.r - meanLuma,
    g:mean.g - meanLuma,
    b:mean.b - meanLuma
  };

  const originalChroma = {
    r:r - luma,
    g:g - luma,
    b:b - luma
  };

  const bleed =
    clamp(chromaBleed + collapse * 0.22,0,1);

  const keep =
    clamp(1 - chromaLoss * 0.92,0,1);

  const codecChroma = {
    r:mix(sampleChroma.r,meanChroma.r,bleed),
    g:mix(sampleChroma.g,meanChroma.g,bleed),
    b:mix(sampleChroma.b,meanChroma.b,bleed)
  };

  return {
    r:clamp(luma + mix(codecChroma.r,originalChroma.r,keep),0,255),
    g:clamp(luma + mix(codecChroma.g,originalChroma.g,keep),0,255),
    b:clamp(luma + mix(codecChroma.b,originalChroma.b,keep),0,255)
  };
}

function applyMotionDamage(config){
  const {
    src,
    reference,
    out,
    w,
    h,
    block,
    motionCorruption,
    datamoshAmount,
    vectorPersistence,
    motionQuality,
    collapse,
    blend,
    seed,
    frameIndex,
    previousMap,
    previousKey
  } = config;

  const motionBlock =
    clamp(
      Math.round(block * (1.25 + (1 - motionQuality) * 2.5)),
      block,
      128
    );

  const cols =
    Math.ceil(w / motionBlock);

  const rows =
    Math.ceil(h / motionBlock);

  const key =
    `${cols}x${rows}x${motionBlock}`;

  const map =
    previousKey === key &&
    previousMap &&
    previousMap.length === cols * rows * 2
      ? new Float32Array(previousMap)
      : new Float32Array(cols * rows * 2);

  if(motionCorruption <= 0 && datamoshAmount <= 0){
    return {
      map,
      key
    };
  }

  const copy =
    new Uint8ClampedArray(out);

  const maxVector =
    motionBlock * (0.4 + datamoshAmount * 2.4 + collapse * 1.4);

  for(let row = 0; row < rows; row += 1){
    for(let col = 0; col < cols; col += 1){
      const cell =
        row * cols + col;

      const mi =
        cell * 2;

      const hit =
        hash01(seed + 307,col,row,Math.floor(frameIndex / 4)) <
        motionCorruption + datamoshAmount * 0.28 + collapse * 0.18;

      const targetX =
        hit
          ? (hash01(seed + 311,col,row,frameIndex) * 2 - 1) * maxVector
          : Math.sin((row + seed * 0.01) * 0.6 + frameIndex * 0.18) *
            maxVector *
            datamoshAmount *
            0.18;

      const targetY =
        hit
          ? (hash01(seed + 313,col,row,frameIndex) * 2 - 1) * maxVector * 0.7
          : Math.cos((col + seed * 0.01) * 0.54 + frameIndex * 0.14) *
            maxVector *
            datamoshAmount *
            0.12;

      map[mi] =
        mix(targetX,map[mi],vectorPersistence);

      map[mi + 1] =
        mix(targetY,map[mi + 1],vectorPersistence);

      const bx =
        col * motionBlock;

      const by =
        row * motionBlock;

      const bw =
        Math.min(motionBlock,w - bx);

      const bh =
        Math.min(motionBlock,h - by);

      const referenceMix =
        clamp(
          datamoshAmount * 0.72 +
          motionCorruption * 0.22 +
          collapse * 0.18,
          0,
          0.92
        );

      if(referenceMix <= 0.01){
        continue;
      }

      for(let y = 0; y < bh; y += 1){
        for(let x = 0; x < bw; x += 1){
          const px =
            bx + x;

          const py =
            by + y;

          const i =
            (py * w + px) * 4;

          const sx =
            clamp(Math.round(px - map[mi]),0,w - 1);

          const sy =
            clamp(Math.round(py - map[mi + 1]),0,h - 1);

          const si =
            (sy * w + sx) * 4;

          let r =
            mix(copy[i],reference[si],referenceMix);

          let g =
            mix(copy[i + 1],reference[si + 1],referenceMix);

          let b =
            mix(copy[i + 2],reference[si + 2],referenceMix);

          if(hit){
            const smearX =
              clamp(Math.round(px - map[mi] * 1.6),0,w - 1);

            const smearI =
              (sy * w + smearX) * 4;

            const smearMix =
              clamp(datamoshAmount * 0.28 + collapse * 0.18,0,0.55);

            r = mix(r,reference[smearI],smearMix);
            g = mix(g,reference[smearI + 1],smearMix);
            b = mix(b,reference[smearI + 2],smearMix);
          }

          out[i] =
            mix(src[i],r,blend);

          out[i + 1] =
            mix(src[i + 1],g,blend);

          out[i + 2] =
            mix(src[i + 2],b,blend);
        }
      }
    }
  }

  return {
    map,
    key
  };
}

function applySignalDamage(config){
  const {
    src,
    out,
    w,
    h,
    amount,
    tracking,
    tearing,
    dropout,
    headSwitch,
    chromaCrawl,
    verticalJump,
    syncRoll,
    tvSnow,
    tvBurst,
    chromaLoss,
    palette,
    paletteAmount,
    paletteBlend,
    blend,
    seed,
    frameIndex,
    signalBuffer
  } = config;

  if(
    tracking <= 0 &&
    tearing <= 0 &&
    dropout <= 0 &&
    headSwitch <= 0 &&
    chromaCrawl <= 0 &&
    verticalJump <= 0 &&
    syncRoll <= 0 &&
    tvSnow <= 0 &&
    tvBurst <= 0
  ){
    return;
  }

  const signal =
    signalBuffer && signalBuffer.length === src.length
      ? signalBuffer
      : new Uint8ClampedArray(src.length);

  signal.set(src);

  if(verticalJump > 0){
    applySliceSlip({
      src,
      signal,
      out,
      w,
      h,
      amount,
      verticalJump,
      dropout,
      blend,
      seed,
      frameIndex
    });
  }

  if(syncRoll > 0){
    applySyncRoll({
      src,
      signal,
      out,
      w,
      h,
      amount,
      syncRoll,
      headSwitch,
      dropout,
      blend,
      seed,
      frameIndex
    });
  }

  if(tvSnow > 0 || tvBurst > 0){
    applyTvSnow({
      signal,
      out,
      w,
      h,
      amount,
      tvSnow,
      tvBurst,
      dropout,
      blend,
      seed,
      frameIndex
    });
  }

  const maxShift =
    Math.round(w * (0.008 + tearing * 0.055));

  const chromaShift =
    Math.round(1 + tracking * 8 + chromaCrawl * 13);

  for(let y = 0; y < h; y += 1){
    const rowNoise =
      hash01(seed + 211,Math.floor(y / 4),frameIndex,0);

    const trackingWave =
      Math.sin(y * 0.045 + frameIndex * 0.7 + seed * 0.001) *
      tracking;

    const tearHit =
      rowNoise < tearing * 0.32;

    const lineHit =
      hash01(seed + 233,y,frameIndex,1) < tracking * 0.18;

    const dropoutHit =
      hash01(seed + 251,Math.floor(y / 2),Math.floor(frameIndex / 3),2) <
      dropout * 0.38;

    const headZone =
      y > h * (0.82 - headSwitch * 0.12);

    const headHit =
      headZone &&
      hash01(seed + 257,y,Math.floor(frameIndex / 2),3) <
        headSwitch * 0.72;

    const crawlWave =
      Math.sin(y * 0.33 + frameIndex * 1.7 + seed * 0.002) *
      chromaCrawl;

    if(
      !tearHit &&
      !lineHit &&
      !dropoutHit &&
      !headHit &&
      Math.abs(trackingWave) < 0.015 &&
      Math.abs(crawlWave) < 0.012
    ){
      continue;
    }

    const holdRows =
      tearHit || headHit
        ? 1 + Math.floor(hash01(seed + 239,y,frameIndex,2) * 8 * (0.4 + tearing + headSwitch))
        : 1;

    const wideBand =
      tearHit ||
      dropoutHit ||
      headHit ||
      lineHit;

    const bandRadius =
      wideBand
        ? Math.ceil(
          1 +
          tearing * (tearHit ? 8 : 1) +
          dropout * (dropoutHit ? 5 : 0) +
          headSwitch * (headHit ? 10 : 0) +
          tracking * (lineHit ? 3 : 0)
        )
        : 0;

    const shift =
      headHit
        ? Math.round((hash01(seed + 263,y,frameIndex,4) * 2 - 1) * w * headSwitch * 0.18)
        : tearHit
        ? Math.round((hash01(seed + 241,y,frameIndex,3) * 2 - 1) * maxShift)
        : Math.round(trackingWave * maxShift * 0.35);

    const signalMix =
      clamp(
        blend *
        (
          0.16 +
          tracking * 0.26 +
          tearing * (tearHit ? 0.42 : 0.12) +
          headSwitch * (headHit ? 0.48 : 0.08) +
          dropout * (dropoutHit ? 0.36 : 0.06) +
          chromaCrawl * 0.32
        ),
        0,
        0.82
      );

    const bandCenter =
      y + holdRows * 0.5;

    const bandTop =
      wideBand
        ? Math.max(0,y - bandRadius)
        : y;

    const bandBottom =
      wideBand
        ? Math.min(h,y + holdRows + bandRadius)
        : y + 1;

    const dropoutCenter =
      dropoutHit
        ? Math.floor(hash01(seed + 289,y,frameIndex,5) * w)
        : 0;

    const dropoutHalf =
      dropoutHit
        ? Math.round(
          w *
          (
            0.1 +
            dropout * 0.32 +
            hash01(seed + 291,y,frameIndex,6) * 0.18
          )
        )
        : 0;

    for(let yy = bandTop; yy < bandBottom; yy += 1){
      const distance =
        Math.abs(yy - bandCenter);

      const bandProfile =
        clamp(1 - distance / Math.max(1,bandRadius + holdRows * 0.5),0,1);

      const softProfile =
        bandProfile * bandProfile * (3 - 2 * bandProfile);

      const gelWarp =
        Math.sin(
          yy * 0.19 +
          frameIndex * 0.85 +
          seed * 0.004
        ) *
        (tearHit ? tearing * 12 : 0) *
        softProfile;

      const verticalWarp =
        Math.round(
          Math.sin(
            yy * 0.41 +
            frameIndex * 1.1 +
            seed * 0.003
          ) *
          (headHit ? headSwitch * 5 : tearHit ? tearing * 3 : 0) *
          softProfile
        );

      for(let x = 0; x < w; x += 1){
        const i =
          (yy * w + x) * 4;

        const wrappedDistance =
          dropoutHit
            ? Math.min(
              Math.abs(x - dropoutCenter),
              w - Math.abs(x - dropoutCenter)
            )
            : 0;

        const dropoutLocal =
          dropoutHit
            ? clamp(1 - wrappedDistance / Math.max(1,dropoutHalf),0,1)
            : 0;

        const shimmer =
          (hash01(seed + 281,x >> 2,yy,frameIndex) * 2 - 1) *
          (dropoutHit ? dropout * 5 * dropoutLocal : tracking * 1.5) *
          softProfile;

        const sx =
          wrap(
            x +
            shift +
            Math.round(gelWarp + shimmer),
            w
          );

        const sy =
          clamp(yy + verticalWarp,0,h - 1);

        const si =
          (sy * w + sx) * 4;

        const cx =
          wrap(
            x +
            shift +
            Math.round(gelWarp * 1.35) +
            chromaShift,
            w
          );

        const ci =
          (sy * w + cx) * 4;

        let r =
          signal[si];

        let g =
          signal[si + 1];

        let b =
          mix(
            signal[si + 2],
            signal[ci + 2],
            chromaLoss * 0.75 + tracking * 0.45 + chromaCrawl * 0.52
          );

        if(chromaCrawl > 0){
          const leftX =
            wrap(x - chromaShift,w);

          const rightX =
            wrap(x + chromaShift,w);

          const left =
            (sy * w + leftX) * 4;

          const right =
            (sy * w + rightX) * 4;

          const edge =
            clamp(
              (
                Math.abs(signal[left] - signal[right]) +
                Math.abs(signal[left + 1] - signal[right + 1]) +
                Math.abs(signal[left + 2] - signal[right + 2])
              ) / 540,
              0,
              1
            );

          const dot =
            (
              ((x + yy + Math.floor(seed % 7)) & 1) === 0
                ? 1
                : -1
            ) *
            (0.35 + edge * 0.65);

          const crawlMix =
            clamp(
              chromaCrawl *
              (0.18 + edge * 0.74 + Math.abs(crawlWave) * 0.22),
              0,
              0.78
            );

          const red =
            mix(signal[si],signal[right],crawlMix);

          const blue =
            mix(signal[si + 2],signal[left + 2],crawlMix);

          r = mix(r,red + dot * chromaCrawl * 30,crawlMix);
          g = mix(g,g - dot * chromaCrawl * 10,crawlMix * 0.45);
          b = mix(b,blue - dot * chromaCrawl * 28,crawlMix);
        }

        if(tearHit){
          const glow =
            18 + amount * 28 + tearing * 48;

          r = clamp(r + glow * softProfile,0,255);
          g = clamp(g + glow * softProfile * 0.9,0,255);
          b = clamp(b + glow * softProfile * (0.65 + chromaCrawl * 0.35),0,255);
        }

        if(lineHit || headHit){
          const line =
            headHit
              ? 24 + amount * 42
              : 12 + amount * 30;

          r = clamp(r - line * softProfile,0,255);
          g = clamp(g - line * softProfile,0,255);
          b = clamp(b - line * softProfile,0,255);
        }

        if(dropoutHit && dropoutLocal > 0){
          const speck =
            hash01(seed + 271,x,yy,frameIndex);

          if(speck > 0.32 - dropout * 0.24 * dropoutLocal){
            const value =
              190 + speck * 65;

            const dropoutMix =
              clamp(
                dropout * dropoutLocal * softProfile * (0.58 + speck * 0.62),
                0,
                0.96
              );

            r = mix(r,value,dropoutMix);
            g = mix(g,value,dropoutMix * 0.9);
            b = mix(b,value,dropoutMix * 0.72);
          }else if(speck < 0.12 + dropout * 0.12 * dropoutLocal){
            const holeMix =
              clamp(dropout * dropoutLocal * softProfile * 0.58,0,0.82);

            r = mix(r,18 + speck * 32,holeMix);
            g = mix(g,16 + speck * 28,holeMix);
            b = mix(b,14 + speck * 24,holeMix);
          }
        }

        if(paletteAmount > 0 && tearHit){
          const tinted =
            blendPalette(
              r,
              g,
              b,
              palette,
              paletteBlend,
              paletteAmount * 0.65
            );

          r =
            tinted.r;

          g =
            tinted.g;

          b =
            tinted.b;
        }

        out[i] =
          mix(
            out[i],
            r,
            signalMix *
            (0.3 + softProfile * 0.7) *
            (dropoutHit ? 0.38 + dropoutLocal * 0.62 : 1)
          );

        out[i + 1] =
          mix(
            out[i + 1],
            g,
            signalMix *
            (0.3 + softProfile * 0.7) *
            (dropoutHit ? 0.38 + dropoutLocal * 0.62 : 1)
          );

        out[i + 2] =
          mix(
            out[i + 2],
            b,
            signalMix *
            (0.3 + softProfile * 0.7) *
            (dropoutHit ? 0.38 + dropoutLocal * 0.62 : 1)
          );
      }
    }
  }
}

function applySliceSlip(config){
  const {
    src,
    signal,
    out,
    w,
    h,
    amount,
    verticalJump,
    dropout,
    blend,
    seed,
    frameIndex
  } = config;

  const slipCount =
    1 + Math.floor(verticalJump * 3 + hash01(seed + 601,0,frameIndex,0) * 2);

  const slipMix =
    clamp(blend * (0.14 + verticalJump * 0.68),0,0.86);

  for(let slip = 0; slip < slipCount; slip += 1){
    const center =
      Math.floor(
        h *
        (
          0.12 +
          hash01(seed + 603,slip,frameIndex,0) * 0.76
        )
      );

    const halfHeight =
      clamp(
        Math.round(
          h *
          (
            0.012 +
            verticalJump * 0.055 +
            hash01(seed + 607,slip,frameIndex,1) * 0.035
          )
        ),
        1,
        Math.max(1,Math.round(h * 0.16))
      );

    const top =
      Math.max(0,center - halfHeight);

    const bottom =
      Math.min(h,center + halfHeight);

    const horizontalOffset =
      Math.round(
        (hash01(seed + 611,slip,frameIndex,2) * 2 - 1) *
        w *
        (0.025 + verticalJump * 0.16)
      );

    const verticalOffset =
      Math.round(
        (hash01(seed + 613,slip,frameIndex,3) * 2 - 1) *
        h *
        verticalJump *
        0.035
      );

    const segmentCenter =
      Math.floor(hash01(seed + 617,slip,frameIndex,4) * w);

    const segmentHalf =
      Math.round(
        w *
        (
          0.22 +
          verticalJump * 0.26 +
          hash01(seed + 619,slip,frameIndex,5) * 0.22
        )
      );

    for(let y = top; y < bottom; y += 1){
      const edgeDistance =
        Math.min(y - top,bottom - 1 - y);

      const verticalProfile =
        clamp(
          1 - edgeDistance / Math.max(1,halfHeight * 0.72),
          0,
          1
        );

      const bodyProfile =
        1 - verticalProfile * 0.42;

      const wave =
        Math.sin(y * 0.18 + seed * 0.004 + slip * 1.7) *
        verticalJump *
        10;

      for(let x = 0; x < w; x += 1){
        const wrappedDistance =
          Math.min(
            Math.abs(x - segmentCenter),
            w - Math.abs(x - segmentCenter)
          );

        const segmentProfile =
          clamp(1 - wrappedDistance / Math.max(1,segmentHalf),0,1);

        if(segmentProfile <= 0){
          continue;
        }

        const i =
          (y * w + x) * 4;

        const sx =
          wrap(
            x -
            horizontalOffset -
            Math.round(wave * segmentProfile),
            w
          );

        const sy =
          clamp(y - verticalOffset,0,h - 1);

        const si =
          (sy * w + sx) * 4;

        let r =
          src[si];

        let g =
          src[si + 1];

        let b =
          src[si + 2];

        if(verticalProfile > 0.28){
          const noise =
            hash01(seed + 621,x >> 1,y,slip);

          const seamValue =
            noise > 0.58
              ? 205 + noise * 50
              : 18 + noise * 42;

          const seamMix =
            clamp(
              (verticalProfile - 0.18) *
              (0.42 + verticalJump * 0.42 + dropout * 0.18),
              0,
              0.92
            );

          r = mix(r,seamValue,seamMix);
          g = mix(g,seamValue * 0.9,seamMix * 0.88);
          b = mix(b,seamValue * (0.68 + noise * 0.2),seamMix * 0.72);
        }

        const pixelMix =
          slipMix *
          segmentProfile *
          bodyProfile;

        signal[i] =
          mix(signal[i],r,pixelMix);

        signal[i + 1] =
          mix(signal[i + 1],g,pixelMix);

        signal[i + 2] =
          mix(signal[i + 2],b,pixelMix);

        signal[i + 3] =
          src[si + 3];

        out[i] =
          mix(out[i],r,pixelMix);

        out[i + 1] =
          mix(out[i + 1],g,pixelMix);

        out[i + 2] =
          mix(out[i + 2],b,pixelMix);
      }
    }
  }
}

function applySyncRoll(config){
  const {
    src,
    signal,
    out,
    w,
    h,
    amount,
    syncRoll,
    headSwitch,
    dropout,
    blend,
    seed,
    frameIndex
  } = config;

  const center =
    Math.floor(
      h *
      (
        0.12 +
        hash01(seed + 701,0,frameIndex,0) * 0.74
      )
    );

  const height =
    clamp(
      Math.round(
        h *
        (
          0.035 +
          syncRoll * 0.22 +
          hash01(seed + 703,0,frameIndex,1) * 0.08
        )
      ),
      2,
      Math.max(2,Math.round(h * 0.42))
    );

  const top =
    Math.max(0,center - Math.floor(height * 0.35));

  const bottom =
    Math.min(h,top + height);

  const rollOffset =
    Math.round(
      (
        syncRoll * h * 0.18 +
        1 +
        hash01(seed + 707,0,frameIndex,2) * h * syncRoll * 0.12
      ) *
      (
        hash01(seed + 709,0,frameIndex,3) < 0.5
          ? -1
          : 1
      )
    );

  const horizontalTug =
    Math.round(
      (hash01(seed + 711,0,frameIndex,4) * 2 - 1) *
      w *
      (0.008 + syncRoll * 0.045)
    );

  const syncMix =
    clamp(blend * (0.18 + syncRoll * 0.7),0,0.9);

  for(let y = top; y < bottom; y += 1){
    const local =
      (y - top) / Math.max(1,bottom - top - 1);

    const edge =
      Math.max(
        1 - local / 0.16,
        1 - (1 - local) / 0.16,
        0
      );

    const body =
      Math.sin(local * Math.PI);

    const rowJitter =
      Math.round(
        Math.sin(y * 0.37 + seed * 0.003) *
        syncRoll *
        5 *
        body
      );

    const sy =
      wrap(y - Math.round(rollOffset * body),h);

    for(let x = 0; x < w; x += 1){
      const i =
        (y * w + x) * 4;

      const sx =
        wrap(
          x -
          horizontalTug -
          rowJitter,
          w
        );

      const si =
        (sy * w + sx) * 4;

      let r =
        src[si];

      let g =
        src[si + 1];

      let b =
        src[si + 2];

      if(edge > 0){
        const noise =
          hash01(seed + 713,x >> 1,y,frameIndex);

        const brightLine =
          noise > 0.48
            ? 218 + noise * 37
            : 10 + noise * 42;

        const lineMix =
          clamp(
            edge *
            (0.36 + syncRoll * 0.46 + headSwitch * 0.18 + dropout * 0.12),
            0,
            0.94
          );

        r = mix(r,brightLine,lineMix);
        g = mix(g,brightLine * 0.9,lineMix * 0.86);
        b = mix(b,brightLine * 0.68,lineMix * 0.7);
      }

      signal[i] =
        mix(signal[i],r,syncMix * body);

      signal[i + 1] =
        mix(signal[i + 1],g,syncMix * body);

      signal[i + 2] =
        mix(signal[i + 2],b,syncMix * body);

      signal[i + 3] =
        src[si + 3];

      out[i] =
        mix(out[i],r,syncMix * (0.35 + body * 0.65));

      out[i + 1] =
        mix(out[i + 1],g,syncMix * (0.35 + body * 0.65));

      out[i + 2] =
        mix(out[i + 2],b,syncMix * (0.35 + body * 0.65));
    }
  }
}

function applyTvSnow(config){
  const {
    signal,
    out,
    w,
    h,
    amount,
    tvSnow,
    tvBurst,
    dropout,
    blend,
    seed,
    frameIndex
  } = config;

  const tvEnergy =
    clamp(Math.max(tvSnow,tvBurst),0,1);

  const snowMix =
    clamp(blend * (0.12 + tvSnow * 0.76 + tvBurst * 0.2),0,0.9);

  const burstRows =
    1 + Math.floor(tvSnow * 5 + tvBurst * 7);

  const burstCenters =
    [];

  for(let n = 0; n < burstRows; n += 1){
    if(
      hash01(seed + 801,n,frameIndex,0) <
      clamp(tvSnow * 0.45 + tvBurst * 0.72,0,0.96)
    ){
      burstCenters.push(
        Math.floor(hash01(seed + 803,n,frameIndex,1) * h)
      );
    }
  }

  for(let y = 0; y < h; y += 1){
    let rowBurst =
      0;

    for(let n = 0; n < burstCenters.length; n += 1){
      const distance =
        Math.abs(y - burstCenters[n]);

      rowBurst =
        Math.max(
          rowBurst,
          clamp(1 - distance / Math.max(1,2 + tvSnow * 9 + tvBurst * 13),0,1)
        );
    }

    const rowStatic =
      hash01(seed + 809,y >> 1,frameIndex,2) <
      clamp(tvSnow * 0.42 + tvBurst * 0.2,0,0.9);

    const burstPolarity =
      hash01(seed + 817,y >> 1,frameIndex,3) > 0.46
        ? 248
        : 10;

    for(let x = 0; x < w; x += 1){
      const i =
        (y * w + x) * 4;

      const speck =
        hash01(seed + 811,x,y,frameIndex);

      const fine =
        (speck * 2 - 1) *
        118 *
        (tvSnow + tvBurst * 0.32);

      const hit =
        speck > 1 - tvEnergy * (0.22 + rowBurst * 0.32) ||
        speck < tvEnergy * (0.07 + rowBurst * 0.16);

      let r =
        signal[i];

      let g =
        signal[i + 1];

      let b =
        signal[i + 2];

      if(hit || rowStatic || rowBurst > 0){
        const value =
          rowBurst > 0.55 && tvBurst > 0
            ? mix(
                hit
                  ? speck > 0.5
                    ? 250
                    : 6
                  : 120 + fine,
                burstPolarity,
                clamp(rowBurst * (0.35 + tvBurst * 0.55),0,0.9)
              )
            : hit
            ? speck > 0.5
              ? 220 + speck * 35
              : 8 + speck * 38
            : 128 + fine;

        const localMix =
          clamp(
            snowMix *
            (
              0.32 +
              rowBurst * (0.7 + tvBurst * 0.22) +
              (rowStatic ? 0.22 : 0) +
              dropout * 0.12
            ),
            0,
            0.92
          );

        r = mix(r,value,localMix);
        g = mix(g,value * (0.92 + speck * 0.05),localMix * 0.92);
        b = mix(b,value * (0.82 + speck * 0.08),localMix * 0.82);
      }else{
        r = clamp(r + fine * snowMix * 0.35,0,255);
        g = clamp(g + fine * snowMix * 0.28,0,255);
        b = clamp(b + fine * snowMix * 0.2,0,255);
      }

      signal[i] =
        r;

      signal[i + 1] =
        g;

      signal[i + 2] =
        b;

      out[i] =
        mix(out[i],r,snowMix);

      out[i + 1] =
        mix(out[i + 1],g,snowMix);

      out[i + 2] =
        mix(out[i + 2],b,snowMix);
    }
  }
}

function applyGhosting(config){
  const {
    src,
    out,
    ghost,
    w,
    h,
    amount,
    ghosting,
    recovery,
    palette,
    paletteAmount,
    paletteBlend,
    blend,
    nextGhostBuffer
  } = config;

  const nextGhost =
    nextGhostBuffer && nextGhostBuffer.length === ghost.length
      ? nextGhostBuffer
      : new Uint8ClampedArray(ghost.length);

  nextGhost.set(ghost);

  if(ghosting <= 0){
    nextGhost.set(out);
    return nextGhost;
  }

  const persistence =
    clamp(ghosting * 0.82 * (1 - recovery * 0.28),0,0.94);

  const imprint =
    clamp(0.05 + amount * 0.12 + ghosting * 0.12 + recovery * 0.08,0.05,0.32);

  for(let y = 0; y < h; y += 1){
    for(let x = 0; x < w; x += 1){
      const i =
        (y * w + x) * 4;

      let r =
        mix(out[i],ghost[i],persistence);

      let g =
        mix(out[i + 1],ghost[i + 1],persistence);

      let b =
        mix(out[i + 2],ghost[i + 2],persistence);

      if(paletteAmount > 0){
        const tinted =
          blendPalette(
            r,
            g,
            b,
            palette,
            paletteBlend,
            paletteAmount * ghosting * 0.32
          );

        r =
          tinted.r;

        g =
          tinted.g;

        b =
          tinted.b;
      }

      out[i] =
        mix(src[i],r,blend);

      out[i + 1] =
        mix(src[i + 1],g,blend);

      out[i + 2] =
        mix(src[i + 2],b,blend);

      nextGhost[i] =
        mix(ghost[i],out[i],imprint);

      nextGhost[i + 1] =
        mix(ghost[i + 1],out[i + 1],imprint);

      nextGhost[i + 2] =
        mix(ghost[i + 2],out[i + 2],imprint);

      nextGhost[i + 3] =
        out[i + 3];
    }
  }

  return nextGhost;
}

function ensureCanvas(canvas,w,h){
  if(canvas.width !== w){
    canvas.width =
      w;
  }

  if(canvas.height !== h){
    canvas.height =
      h;
  }
}

function getUint8Buffer(owner,key,length){
  if(!owner[key] || owner[key].length !== length){
    owner[key] =
      new Uint8ClampedArray(length);
  }

  return owner[key];
}

function getFloat32Buffer(owner,key,length){
  if(!owner[key] || owner[key].length !== length){
    owner[key] =
      new Float32Array(length);
  }

  return owner[key];
}

function severity(value){
  return Math.pow(
    clamp(value,0,1),
    1.35
  );
}

function updateCollapseEnergy({
  mode,
  packetLoss,
  decodeError,
  bufferDamage,
  recovery,
  amount
}){
  const collapseMode =
    mode === "digital-collapse";

  const ceiling =
    collapseMode
      ? 1
      : 0.42;

  const target =
    packetLoss * 0.34 +
    decodeError * 0.3 +
    bufferDamage * 0.28 +
    amount * (collapseMode ? 0.34 : 0.08) -
    recovery * (collapseMode ? 0.16 : 0.24);

  return clamp(
    target,
    0,
    ceiling
  );
}

function quantize(value,levels){
  const step =
    255 / Math.max(1,levels - 1);

  return Math.round(value / step) * step;
}

function parseColor(value){
  const hex =
    String(value || "#ffffff")
      .replace("#","")
      .trim();

  if(!/^[0-9a-f]{6}$/i.test(hex)){
    return {
      r:255,
      g:255,
      b:255
    };
  }

  return {
    r:parseInt(hex.slice(0,2),16),
    g:parseInt(hex.slice(2,4),16),
    b:parseInt(hex.slice(4,6),16)
  };
}

function blendPalette(r,g,b,palette,mode,amount){
  let target;

  if(mode === "multiply"){
    target = {
      r:r * palette.r / 255,
      g:g * palette.g / 255,
      b:b * palette.b / 255
    };
  }else if(mode === "screen"){
    target = {
      r:255 - (255 - r) * (255 - palette.r) / 255,
      g:255 - (255 - g) * (255 - palette.g) / 255,
      b:255 - (255 - b) * (255 - palette.b) / 255
    };
  }else if(mode === "soft-light"){
    target = {
      r:softLightChannel(r,palette.r),
      g:softLightChannel(g,palette.g),
      b:softLightChannel(b,palette.b)
    };
  }else if(mode === "color"){
    target =
      colorChannel(r,g,b,palette);
  }else{
    target = {
      r:overlayChannel(r,palette.r),
      g:overlayChannel(g,palette.g),
      b:overlayChannel(b,palette.b)
    };
  }

  return {
    r:mix(r,target.r,amount),
    g:mix(g,target.g,amount),
    b:mix(b,target.b,amount)
  };
}

function overlayChannel(base,blend){
  const a =
    base / 255;

  const b =
    blend / 255;

  const value =
    a < 0.5
      ? 2 * a * b
      : 1 - 2 * (1 - a) * (1 - b);

  return clamp(value * 255,0,255);
}

function softLightChannel(base,blend){
  const a =
    base / 255;

  const b =
    blend / 255;

  const value =
    (1 - 2 * b) * a * a + 2 * b * a;

  return clamp(value * 255,0,255);
}

function colorChannel(r,g,b,palette){
  const luma =
    r * 0.299 + g * 0.587 + b * 0.114;

  const paletteLuma =
    palette.r * 0.299 + palette.g * 0.587 + palette.b * 0.114;

  return {
    r:clamp(luma + palette.r - paletteLuma,0,255),
    g:clamp(luma + palette.g - paletteLuma,0,255),
    b:clamp(luma + palette.b - paletteLuma,0,255)
  };
}

function mix(a,b,t){
  return a + (b - a) * clamp(t,0,1);
}

function clamp(value,min,max){
  return Math.max(
    min,
    Math.min(max,value)
  );
}

function wrap(value,size){
  return ((value % size) + size) % size;
}

function hash01(seed,a,b,c){
  const x =
    Math.sin(seed * 12.9898 + a * 78.233 + b * 37.719 + c * 19.913) *
    43758.5453;

  return x - Math.floor(x);
}
