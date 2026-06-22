import { openDialogWindow }
from "../../window/dialogWindow.js";



export function bindWorkstationHelp(){

  document
    .querySelectorAll('[data-workstation-help="drift"]')
    .forEach(item => {
      item.addEventListener(
        "click",
        () => {
          openDialogWindow({
            id:"workstation-drift-help",
            title:"Drift Help",
            width:560,
            height:620,
            resizable:true,
            content:createDriftHelp()
          });
        }
      );
    });

  document
    .querySelectorAll('[data-workstation-help="ar"]')
    .forEach(item => {
      item.addEventListener(
        "click",
        () => {
          openDialogWindow({
            id:"workstation-ar-help",
            title:"AR Help",
            width:560,
            height:620,
            resizable:true,
            content:createArtifactHelp()
          });
        }
      );
    });

}



function createDriftHelp(){

  return `
    <div class="workstation-help">
      <div class="workstation-help-breadcrumb">
        Workstation / Drift
      </div>

      <h2>Drift</h2>

      <p class="workstation-help-lead">
        Drift is a keyframed color-motion effect. It does not apply one static
        filter. Instead, it moves through saved color states and blends between
        them over time.
      </p>

      <div class="workstation-help-flow">
        <span>Key 1</span>
        <b></b>
        <span>Key 2</span>
        <b></b>
        <span>Key 3</span>
      </div>

      <details class="workstation-help-section" open>
        <summary>Overview</summary>
        <p>
          Each keyframe stores a Drift look: brightness, contrast, saturation,
          hue, channel gains, gamma and the saved palette layer. During playback,
          Drift travels from Key 1 to Key 2, then onward through the sequence.
        </p>
        <p>
          The image changes smoothly because Drift calculates the in-between
          values instead of jumping instantly. This makes the effect behave like
          a small color sequencer rather than a single filter.
        </p>
      </details>

      <details class="workstation-help-section">
        <summary>Transport</summary>
        <p>
          Speed controls how fast Drift moves through the keyframe path. Phase is
          a manual position control for that path.
        </p>
        <div class="workstation-help-note">
          Speed = 0 + Phase = manual hold on one Drift position.
        </div>
        <dl class="workstation-help-terms">
          <dt>Loop Mode</dt>
          <dd>Forward plays the path in one direction. Pingpong moves back and forth. Random jumps through seeded positions.</dd>
          <dt>Duration</dt>
          <dd>Changes how much path space belongs to the selected keyframe before the next key.</dd>
        </dl>
      </details>

      <details class="workstation-help-section">
        <summary>Keyframe Memory</summary>
        <p>
          Snapshot writes the currently visible look into the selected keyframe.
          It stores the color bias values and the active palette state, so one
          keyframe can keep its own color even after another keyframe is edited.
        </p>
        <dl class="workstation-help-terms">
          <dt>Add</dt>
          <dd>Adds a new keyframe using the currently visible Drift look.</dd>
          <dt>Snapshot</dt>
          <dd>Overwrites the selected keyframe with the currently visible look.</dd>
          <dt>Delete</dt>
          <dd>Removes the selected keyframe. Drift always keeps at least one key.</dd>
          <dt>Prev / Next</dt>
          <dd>Selects the previous or next keyframe and moves Phase to its position.</dd>
          <dt>Key Dropdown</dt>
          <dd>Shows the keyframe order and its position on the Drift path.</dd>
        </dl>
      </details>

      <details class="workstation-help-section">
        <summary>Palette Editing</summary>
        <p>
          Palette has two states. When you switch between keyframes, Drift shows
          the palette saved inside the selected keyframe.
        </p>
        <p>
          When you move Palette Amount, change the blend mode, or select a
          swatch, it becomes a live edit for the next Snapshot. After Snapshot,
          the look is stored in the keyframe and the temporary edit layer can
          return to neutral.
        </p>
      </details>

      <details class="workstation-help-section">
        <summary>Recommended Workflow</summary>
        <ol>
          <li>Choose the preset closest to the intended mood.</li>
          <li>Set Speed low, or set Speed to 0 for manual editing.</li>
          <li>Use Phase, Hue and Palette to find the first look.</li>
          <li>Click Snapshot to store the look in the selected keyframe.</li>
          <li>Select another keyframe, tune the next look and Snapshot again.</li>
          <li>Use Add when you need another memory point on the path.</li>
          <li>Adjust Duration when one look should last longer.</li>
          <li>Start playback and check the transition between saved looks.</li>
        </ol>
        <div class="workstation-help-note">
          Quick route: Preset -> Phase -> Snapshot -> Next Key -> Snapshot ->
          Duration -> Speed.
        </div>
      </details>

      <details class="workstation-help-section" open>
        <summary>Presets</summary>
        <div class="workstation-help-presets">
          <article>
            <h4>Analog Fade</h4>
            <p>Warm analog breathing with subtle exposure and color movement. Gentle, slow and slightly film-like.</p>
          </article>
          <article>
            <h4>Ambient Flow</h4>
            <p>Large smooth color-flow across several vivid light states. The core ambient Drift preset.</p>
          </article>
          <article>
            <h4>VHS Mood</h4>
            <p>Warm tape color, cyan drift, multiply palette and mild instability.</p>
          </article>
          <article>
            <h4>Toxic Drift</h4>
            <p>Acid green-magenta motion with stronger saturation and sharper hue shifts.</p>
          </article>
          <article>
            <h4>City Lights</h4>
            <p>Night-neon drift through blue, warm orange and teal city-light tones.</p>
          </article>
          <article>
            <h4>Thermal Dream</h4>
            <p>A glowing thermal wash between cool and warm states.</p>
          </article>
          <article>
            <h4>Collapse</h4>
            <p>A chaotic breakdown with random movement, higher contrast and broken color jumps.</p>
          </article>
          <article>
            <h4>Indigo Night</h4>
            <p>Dark blue-violet motion. Slow, nocturnal and less aggressive.</p>
          </article>
          <article>
            <h4>Signal Bloom</h4>
            <p>A brighter signal bloom with screen palette, softer contrast and forward motion.</p>
          </article>
        </div>
      </details>

      <details class="workstation-help-section workstation-help-internal" open>
        <summary>Internal Notes / CZ</summary>
        <p>
          Tohle je interni ceska vrstva poznamek. Oficialni help je anglicky a
          strukturovany podle hesel. Ceske poznamky slouzi pro rychle hledani,
          pochopeni workflow a pozdejsi uklid pred verejnou dokumentaci.
        </p>
        <dl class="workstation-help-terms">
          <dt>Keyframy</dt>
          <dd>Keyframe je ulozeny barevny stav Driftu. Dropdown ukazuje poradi a pozici na trase, ne nazev barvy.</dd>
          <dt>Snapshot</dt>
          <dd>Snapshot zapisuje aktualne viditelny look do vybraneho keyframu. Kdyz chci dalsi pametovy bod, nejdriv Add, potom Snapshot.</dd>
          <dt>Palette</dt>
          <dd>Palette se po Snapshotu bere jako ulozena soucast keyframu. Kdyz sahnu na slider, blend nebo swatch, je to zive ladeni pro dalsi Snapshot.</dd>
          <dt>Kontrola</dt>
          <dd>Prev / Next slouzi hlavne ke kontrole ulozenych bodu. Pri prepnuti se ma ukazat opravdu ulozeny stav vybraneho keyframu.</dd>
          <dt>Problem dropdownu</dt>
          <dd>Kdyz keyframy existuji v save souboru, ale nejsou videt v panelu, je to chyba obnoveni seznamu, ne chyba pameti efektu.</dd>
          <dt>Presety</dt>
          <dd>V menu je ted deset polozek: Custom plus devet hotovych presetu. Analog Fade zustava jako jemny analogovy preset; Ambient Flow je hlavni ambientni smer Driftu s vetsim barevnym prelevanim.</dd>
        </dl>
      </details>
    </div>
  `;

}



function createArtifactHelp(){

  return `
    <div class="workstation-help">
      <div class="workstation-help-breadcrumb">
        Workstation / AR
      </div>

      <h2>AR</h2>

      <p class="workstation-help-lead">
        AR is an artifact engine for digital damage, broken compression,
        unstable tape signal and memory-based glitches.
      </p>

      <details class="workstation-help-section" open>
        <summary>Overview</summary>
        <p>
          AR does not only process the current frame. It also keeps its own
          internal image memory. Packet loss, freeze, ghosting and buffer damage
          can pull older broken image data back into the current frame.
        </p>
        <p>
          This is why the effect can feel like a failing codec or damaged video
          device instead of a flat filter.
        </p>
      </details>

      <details class="workstation-help-section">
        <summary>Global Controls</summary>
        <dl class="workstation-help-terms">
          <dt>Amount</dt>
          <dd>Controls the main AR/digital damage engine. It should not be the control that makes VHS stronger; VHS intensity belongs to the VHS faders.</dd>
          <dt>Blend</dt>
          <dd>Controls the final wet/dry mix: how much of the processed AR result is mixed with the original image.</dd>
          <dt>Seed</dt>
          <dd>Sets the random pattern used by AR: block choices, packet failures, VHS line hits, recovery noise and memory damage timing.</dd>
        </dl>
      </details>

      <details class="workstation-help-section" open>
        <summary>Memory Hold</summary>
        <p>
          Memory Hold controls whether AR is allowed to update its internal
          image memory. When you switch it on, AR captures the currently visible
          AR output as the held memory imprint.
        </p>
        <dl class="workstation-help-terms">
          <dt>Live</dt>
          <dd>The memory keeps refreshing from the current image. Glitches move with the source and older damage fades into newer frames.</dd>
          <dt>Held</dt>
          <dd>The memory stops updating. The visible moment is captured first, then buffer errors, ghosting, freeze and recovery damage keep pulling from that locked imprint.</dd>
        </dl>
        <div class="workstation-help-note">
          Use Held when a broken moment looks good. The click should not create
          a new look first; it should catch the look that is already on screen.
          Switch back to Live when the memory should breathe with the current
          image again.
        </div>
      </details>

      <details class="workstation-help-section">
        <summary>Memory Controls</summary>
        <dl class="workstation-help-terms">
          <dt>Memory</dt>
          <dd>Controls how strongly AR pulls older buffer content back into the current frame during freeze, packet loss and buffer damage.</dd>
          <dt>Ghost</dt>
          <dd>Adds a fading digital imprint of previous AR block and memory damage. It is applied before the VHS layer, so it should not ghost tape tracking lines.</dd>
          <dt>Recover</dt>
          <dd>Controls how quickly damaged blocks repair themselves and return to the current image.</dd>
          <dt>Noise</dt>
          <dd>Adds irregular recovery behavior and visible grain/sparkle inside damaged memory blocks, so repair does not happen evenly everywhere.</dd>
        </dl>
      </details>

      <details class="workstation-help-section">
        <summary>Palette Color</summary>
        <p>
          AR uses the global workstation swatches for its palette color. Select
          AR, then click a swatch in the palette strip. The Palette section shows
          the currently selected color.
        </p>
        <dl class="workstation-help-terms">
          <dt>Palette</dt>
          <dd>Controls how strongly the selected swatch color is mixed into the AR damage.</dd>
          <dt>Chroma</dt>
          <dd>Controls color-channel damage and color loss in the signal itself.</dd>
          <dt>Blend Menu</dt>
          <dd>Controls how the selected swatch color is mixed: overlay, soft light, multiply, screen or color.</dd>
        </dl>
      </details>

      <details class="workstation-help-section">
        <summary>VHS Faders</summary>
        <p>
          VHS is an analog signal layer. It should add tape wobble, line damage,
          dropouts and chroma crawl. It does not create the square macroblocks;
          those belong to Compression, Errors and Memory.
        </p>
        <p>
          VHS and digital block damage use the same Seed, but their layer
          patterns are kept independent while editing. Moving a VHS fader should
          not regenerate the macroblock pattern, and tuning Compression or
          Errors should not reshuffle VHS line placement.
        </p>
        <p>
          VHS strength comes from these faders. Global Blend still fades the
          final AR result in or out, but Global Amount should not secretly add
          more VHS.
        </p>
        <dl class="workstation-help-terms">
          <dt>Track</dt>
          <dd>Horizontal tracking wobble and unstable tape-line behavior.</dd>
          <dt>Tear</dt>
          <dd>Soft refractive tape tears: a gel-like horizontal band that bends and brightens the image around it.</dd>
          <dt>Drop</dt>
          <dd>Localized white dropout scratches, specks and grain from momentary signal loss. This should not behave like a full-width stripe every time.</dd>
          <dt>Head</dt>
          <dd>Head-switching damage near the lower part of the image, with a wider noisy band instead of clean block damage.</dd>
          <dt>Crawl</dt>
          <dd>Chroma crawl: crawling red/blue color shimmer around edges and fine horizontal color smear from weak VHS chroma detail.</dd>
          <dt>Slip</dt>
          <dd>Event knob. Local tape slip: a torn horizontal area pulls part of the picture sideways or slightly out of place, with noisy sync edges.</dd>
          <dt>Sync</dt>
          <dd>Event knob. Vertical sync roll: a local part of the picture rolls up or down with a dirty black/white sync edge.</dd>
        </dl>
      </details>

      <details class="workstation-help-section">
        <summary>TV Source</summary>
        <p>
          TV is separate from VHS. VHS is tape mechanics and tracking; TV is the
          source signal breaking up, like a weak input, unplugged camera or
          short black/white burst from a failing feed.
        </p>
        <dl class="workstation-help-terms">
          <dt>Snow</dt>
          <dd>Analog source static: stronger specks, grain and noisy rows from a weak or disconnected video input.</dd>
          <dt>Burst</dt>
          <dd>Source burst/crack: sudden black or white row flashes like a camera feed cutting, reconnecting or briefly collapsing.</dd>
        </dl>
      </details>

      <details class="workstation-help-section">
        <summary>Recommended Workflow</summary>
        <ol>
          <li>Start from a preset close to the kind of damage you want.</li>
          <li>Set Amount and Blend first, so the whole effect sits in the image.</li>
          <li>Tune Compression and Errors for codec damage.</li>
          <li>Use VHS faders for tape-like instability.</li>
          <li>Raise Memory, Ghost and Recover when the effect should keep traces of older frames.</li>
          <li>When the memory imprint looks good, switch Memory Hold to Held.</li>
          <li>Return to Live when you want the internal memory to update again.</li>
        </ol>
      </details>

      <details class="workstation-help-section workstation-help-internal" open>
        <summary>Internal Notes / CZ</summary>
        <p>
          AR ma vlastni vnitrni pamet obrazu. Neni to jen filtr nad aktualnim
          framem. Stare rozbite bloky, ghosting, freeze a recovery chyby se
          tahaji z bufferu, ktery si efekt drzi bokem.
        </p>
        <dl class="workstation-help-terms">
          <dt>Memory Hold / Live</dt>
          <dd>Live znamena, ze se pamet prubezne prepisuje aktualnim obrazem. Efekt dycha s tim, co je prave na vstupu.</dd>
          <dt>Memory Hold / Held</dt>
          <dd>Held znamena, ze se pri kliknuti nejdriv vezme aktualne viditelny AR obraz jako snapshot a ten se zamkne jako pametovy otisk.</dd>
          <dt>Proc to existuje</dt>
          <dd>Kdyz se objevi dobry rozbity moment, Held ho podrzi a necha ho dal prolezat do dalsich framu jako memory scar.</dd>
          <dt>Memory knob</dt>
          <dd>Memory knob neni zamek. Je to sila toho, jak moc se stary buffer primichava do aktualniho obrazu pri chybach, freeze a rozbitych blocich.</dd>
          <dt>Seed</dt>
          <dd>Seed patri globalne k AR, ne do Memory. Meni nahodne rozlozeni chyb, VHS linek, packet dropu, recovery noise a buffer udalosti v celem efektu.</dd>
          <dt>VHS vs ctverecky</dt>
          <dd>VHS nema vyrabet ani ridit ctverecky. Ctverecky jsou digitalni komprese, packet chyby a memory buffer. VHS je analogova vrstva pres obraz: linky, tracking, dropout, head-switch, chroma crawl, lokalni slip a sync roll. TV je zvlast pro zdrojovy snow a burst.</dd>
          <dt>Slip / utrzeny kus obrazu</dt>
          <dd>Neni to globalni posun celeho obrazu. Slip vezme lokalni oblast kolem rozbite linky a posune jen ten kus obrazu bokem nebo lehce jinam.</dd>
          <dt>Stabilita vrstev</dt>
          <dd>VHS a digitalni ctverecky musi byt stabilni vrstvy. Hybu VHS faderem = meni se jen VHS intenzita/tvar. Hybu kompresi nebo errory = nemeni se nahodne rozlozeni VHS linek.</dd>
          <dt>Ghosting</dt>
          <dd>Ghosting patri k digitalni memory vrstve. Ma drzet otisky bloku a rozbitych casti na miste pred VHS, ne ghostovat VHS linky nebo tracking pohyb.</dd>
        </dl>
      </details>
    </div>
  `;

}
