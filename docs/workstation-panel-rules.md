# Workstation panel rules

Internal layout rules for effect blocks in the workstation toolbar.

## Effect block titles

- Every draggable effect block must have one visible `.section-title` at the top.
- The title is uppercase via CSS, not manually retyped in uppercase.
- The title must keep a fixed breathing space before the first control. This is defined by `--effect-title-bottom-gap` in `css/workstation/panels/common.css`.
- Do not override title spacing inside individual panels unless the shared rule is wrong for every panel.

## Knob label ownership

- A knob label belongs visually to the knob above it.
- When one knob row sits above another knob row, the gap must leave clear air under the upper row labels.
- Do not center the label geometrically between the upper and lower knobs. That makes the label ambiguous.
- Prefer a slight visual bias toward the knob above: the label should read as attached to its own knob, with enough space before the next row starts.
- Current reference: Feedback primary knobs use a `16px` row gap, giving a clear but not exaggerated separation.

## Control order

- Section title comes first.
- Primary knobs or the main module controls come next.
- Presets and secondary selects should sit after the primary controls when the section is mainly knob-driven.
- Switchers that modify one specific knob/control should be centered under that control, not floated as a separate unrelated row.

## Single source of truth

- Shared behavior and spacing belongs in shared widget/panel CSS first.
- Avoid copying behavior variables into every panel. For example, slide switcher travel is defined by the shared switcher widget, not by per-panel overrides.
