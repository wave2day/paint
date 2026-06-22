import { openDialogWindow }
from "../../window/dialogWindow.js";



export function openGalleryHelpDialog(){
  const content =
    document.createElement("div");

  content.className =
    "workstation-help";

  content.innerHTML = `
    <div class="workstation-help-breadcrumb">
      Gallery / Library
    </div>

    <h2>Gallery</h2>

    <p class="workstation-help-lead">
      Gallery is the image library for saved outputs, wallpapers and imported
      references. It is meant to behave like a small desktop file browser, not
      like a separate editor.
    </p>

    <details class="workstation-help-section" open>
      <summary>Overview</summary>
      <p>
        The left side chooses a library or collection. The center browser shows
        the images in the current location. The lower preview panel shows the
        selected image, its source and the available actions.
      </p>
      <p>
        Gallery keeps navigation, browsing and image actions separate so that
        organizing files does not interrupt the selected image workflow.
      </p>
    </details>

    <details class="workstation-help-section" open>
      <summary>Library Order</summary>
      <p>
        Drag library items in the left list to change their order. The first
        library becomes the starting library the next time Gallery opens.
      </p>
      <div class="workstation-help-note">
        Reordering changes the browser preference only. It does not move or
        rename the image files.
      </div>
    </details>

    <details class="workstation-help-section">
      <summary>View Controls</summary>
      <dl class="workstation-help-terms">
        <dt>Grid</dt>
        <dd>Shows image thumbnails as a visual board for scanning by look.</dd>
        <dt>List</dt>
        <dd>Shows compact rows with thumbnail, name, type, date and size.</dd>
        <dt>Small / Large</dt>
        <dd>Changes browser density without changing the selected image.</dd>
        <dt>Panel</dt>
        <dd>Shows or hides the lower preview and action panel.</dd>
        <dt>Full</dt>
        <dd>Expands Gallery into its fullscreen browser mode.</dd>
      </dl>
    </details>

    <details class="workstation-help-section">
      <summary>Import And Refresh</summary>
      <p>
        Import Images adds selected files to Gallery. Import Folder adds images
        from a chosen folder. Refresh Project Folders reloads built-in project
        folders such as wallpapers and saved Glitch outputs.
      </p>
      <dl class="workstation-help-terms">
        <dt>Search</dt>
        <dd>Filters the visible list by filename.</dd>
        <dt>Sort</dt>
        <dd>Orders the current result by name, date or size.</dd>
      </dl>
    </details>

    <details class="workstation-help-section">
      <summary>Recommended Workflow</summary>
      <ol>
        <li>Put the most used library first in the left list.</li>
        <li>Use Grid when choosing by image mood or color.</li>
        <li>Use List when checking names, dates or output batches.</li>
        <li>Select an image and use the preview panel for actions.</li>
        <li>Send finished images to Workstation or mark useful references as favorites.</li>
      </ol>
    </details>

    <details class="workstation-help-section workstation-help-internal" open>
      <summary>Internal Notes / CZ</summary>
      <p>
        Tohle je interni ceska vrstva poznamek. Oficialni help zustava anglicky
        a strukturovany podle stejnych bloku jako Workstation help.
      </p>
      <dl class="workstation-help-terms">
        <dt>Poradi knihoven</dt>
        <dd>Uzivatel ma chytit polozku vlevo a pretahnout ji nahoru nebo dolu. Prvni polozka je startovni knihovna.</dd>
        <dt>List</dt>
        <dd>List nema byt velky prazdny pruh. Ma byt hustsi prehled se jmenem, typem, datem a velikosti.</dd>
        <dt>Help pravidlo</dt>
        <dd>Kazdy help pouziva breadcrumb, lead, details sekce, pojmy/workflow a dole interni CZ poznamky.</dd>
      </dl>
    </details>
  `;

  openDialogWindow({
    id:"gallery-help",
    title:"Gallery Help",
    content,
    left:330,
    top:160,
    width:560,
    height:620,
    resizable:true
  });
}
