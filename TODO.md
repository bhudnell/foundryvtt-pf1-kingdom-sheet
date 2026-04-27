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
- read through items and see if any rolls can be automated (ie economic boom)

## Change editor dialog
- maybe I can clean this up to hide unused fields
  - type
  - priority?
  - operator?

## Building grid logic
- toggle for "can overlap" so things like cistern or magical streetlamps can be shown
  - optional list to limit to certain building types
  - must be able to handle lotless and lotted buildings
- follows building limits (ie must be next to X, cannot be next to Y, limit Z per settlement/district)

## Settlement actor
- create a simple settlement sheet
  - cant be linked to kingdoms
    - only link if settlementActor.getFlag('core', 'sheetClass') !== moduleId.settlementLiteSheet
  - wont use buildings for data