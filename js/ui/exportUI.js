export function bindExport(ui) {

  const record =
    document.getElementById("record");

  if (!record) return;

  record.onclick = () => {

    if (!ui.engine.images.length) {
      return;
    }

    const stream =
      ui.engine.canvas.captureStream(25);

    const recorder =
      new MediaRecorder(stream);

    const chunks = [];

    recorder.ondataavailable = (e) => {

      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {

      const blob =
        new Blob(chunks, {
          type: "video/webm"
        });

      const link =
        document.createElement("a");

      link.href =
        URL.createObjectURL(blob);

      link.download =
        "export.webm";

      link.click();
    };

    recorder.start();

    setTimeout(() => {
      recorder.stop();
    }, 10000);
  };
}
