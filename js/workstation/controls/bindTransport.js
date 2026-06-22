export function bindTransport(
  workstation
){

  const start =
    document.getElementById(
      "start"
    );

  const stop =
    document.getElementById(
      "stop"
    );

  if(
    !start ||
    !stop
  ){
    return;
  }



  start.onclick = () => {

    if(
      !workstation.core.images.length
    ){
      return;
    }

    if(
      workstation.running
    ){
      return;
    }

    workstation.running =
      true;

    workstation.lastFrameTime =
      performance.now();

    loop(
      workstation
    );

  };



  stop.onclick = () => {

    stopTransport(
      workstation
    );

  };

}



export function loop(

  workstation

){

  if(
    !workstation.running
  ){
    return;
  }



  const now =
    performance.now();



  const deltaTime =

    (
      now -
      workstation.lastFrameTime
    ) / 1000;



  workstation.lastFrameTime =
    now;



  const speed =
    getTransportSpeed(
      workstation
    );



  const mode =
    workstation?.effects?.mode;

  const module =
    mode
      ? workstation?.effects?.modules?.[mode]
      : null;

  if(typeof module?.advance === "function"){

    module.advance(
      workstation.core,
      deltaTime
    );

  }else{

    workstation.core.progress +=

      speed *
      deltaTime *
      60;



    if(
      workstation.core.progress > 1
    ){

      workstation.core.progress =
        0;

    }

  }



  workstation.queueRender();



  workstation.raf =

    requestAnimationFrame(
      () => {

        loop(
          workstation
        );

      }
    );

}



function getTransportSpeed(
  workstation
){

  const mode =
    workstation?.effects?.mode;

  const module =
    mode
      ? workstation?.effects?.modules?.[mode]
      : null;

  if(
    module?.state &&
    Number.isFinite(module.state.speed)
  ){
    return module.state.speed;
  }

  const speed =
    document.getElementById(
      "speed"
    );

  if(speed){
    const value =
      parseFloat(
        speed.value
      );

    if(Number.isFinite(value)){
      return value;
    }
  }

  return 0.004;

}



export function stopTransport(
  workstation
){

  workstation.running =
    false;



  if(
    workstation.raf
  ){

    cancelAnimationFrame(
      workstation.raf
    );

  }

}
