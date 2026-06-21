# Help Window Structure

Use the Workstation Drift help as the baseline for every in-app Help window.

## Rule

Every Help window should use the same internal structure:

1. Breadcrumb: `Area / Feature`
2. H2 title: the feature name
3. Lead paragraph: what the feature is for
4. Optional visual flow row when the feature has a sequence
5. `details.workstation-help-section` blocks for the actual content
6. Definition lists for controls and terms
7. Ordered lists for recommended workflows
8. `workstation-help-note` for one important warning or shortcut
9. Final `workstation-help-internal` section for CZ/internal notes

## Tone

The public help text is English, concise and structured by feature concepts.
The final internal section can be Czech and should capture product decisions,
implementation notes and wording reminders.

## Dialog Defaults

Use a resizable dialog around `560 x 620` for documentation-style help. Keep the
content inside `.workstation-help` until the shared help component is renamed.

## Do Not

Do not make one-off small beige help cards for app documentation. If a Help item
opens a dialog, it should follow this same document-style structure.
