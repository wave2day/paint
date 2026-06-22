export function downloadText(text, filename, type){
  const blob =
    new Blob([text], {type});

  const url =
    URL.createObjectURL(blob);

  triggerDownload(url, filename);

  setTimeout(
    () => URL.revokeObjectURL(url),
    800
  );
}

export function downloadCanvas(canvas, filename){
  canvas.toBlob(
    blob => {
      const url =
        URL.createObjectURL(blob);

      triggerDownload(url, filename);

      setTimeout(
        () => URL.revokeObjectURL(url),
        800
      );
    },
    "image/png"
  );
}

export function triggerDownload(url, filename){
  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();
}
