export function bindExport(workstation){

  if(document.body.dataset.recordBound === "1"){
    return;
  }

  document.body.dataset.recordBound =
    "1";

  document.addEventListener(
    "click",
    event => {

      const record =
        event.target.closest(
          "#record"
        );

      if(!record){
        return;
      }

      startRecording(
        workstation,
        record
      );

    }
  );

}

function startRecording(
  workstation,
  button
){

  if(
    !workstation.canvas ||
    button.classList.contains("is-recording")
  ){
    return;
  }

  const stream =
    workstation.canvas
      .captureStream(25);

  const recorder =
    new MediaRecorder(
      stream
    );

  const chunks = [];

  button.classList.add(
    "is-recording"
  );

  recorder.ondataavailable =
    event => {

      if(event.data.size > 0){
        chunks.push(
          event.data
        );
      }

    };

  recorder.onstop = () => {

    button.classList.remove(
      "is-recording"
    );

    const blob =
      new Blob(
        chunks,
        {
          type:"video/webm"
        }
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      URL.createObjectURL(
        blob
      );

    link.download =
      "glitch-export.webm";

    link.click();

  };

  recorder.start();

  setTimeout(
    () => {
      recorder.stop();
    },
    10000
  );

}
