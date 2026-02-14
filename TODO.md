# For future releases

## Misc
- clean up compendium extraction (especially journals)
- add `description.unidentified` to itemBaseModel and break description out like system items
- Auto Unrest (on drop and continuous)
  - add settings for each type
  - add handling for each type
  - add default continuous changes for vacancies
- Print control DC on economy/loyalty/stability checks
- other optional rules: https://aonprd.com/Rules.aspx?ID=1547
  - abandoned buildings
  - deities and holy sites
  - special edicts

## Change editor dialog
- maybe I can clean this up to hide unused fields
  - type
  - priority?
  - operator?

## Settlement Features (changes)
- add magic item availability (see impoverished disadvantage)

## Building grid logic
- toggle for "can overlap" so things like cistern or magical streetlamps can be shown
  - optional list to limit to certain building types
  - must be able to handle lotless and lotted buildings
- follows building limits (ie must be next to X, cannot be next to Y, limit Z per settlement/district)

## Settlement actor
- break settlements out into their own actor types
  - current settlements tab will become settlement actor sheet
  - new settlements tab will just show the settlements' contrbutions to kingdom stats,
    maybe some other info too
- buildings and settlement feature items should lose the settlementId data
- how to break up settings and how will that all work
- add a toggle for buildings providing magic items (as currently is) or base for settlement of given size
  - could be called "simple settlement"
  - wouldnt allow the settlement to be linked to a kingdom?

## Settlement and Army actors
- add a "kingdom id" field
- when any actor is deleted, ensure any existing links are removed
- when dragged onto a kingdom
  - if linked
    - error saying this actor has already been linked to a kingdom
  - if no link (hasnt been added to a kingdom yet)
    - create the proxy item on the parent
    - add the parent's id to the "kingdom id" field
- on settlement/army sheet add a button
  - if linked
    - button opens a dialog with all owned kingdoms to select the kingdom to link
      - if only 1 owned kingdom, auto link when clicked
  - if unlinked
    - button unlinks from the kingdom (see below)
- unlinking logic
  - on kingdom
    - delete the proxy item
  - on settlement/army
    - unset the "kingdom id" field



what to do with defense?
settlement attributes           -> settlement         -> settlement attributes
settlement attributes (defense) -> kingdom/settlement -> settlement attributes