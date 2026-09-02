# For this release

## Hex map
- remove all improvement item things
  - compendium -> turn into rules since items are going bye bye
  - kingdom logic
  - will need to leave the item type/changes/context notes around so the migration can run
    remove item type in a later version

- create a log of the number of each terrain type and all improvements
- migration
- localize all strings

## Misc
- when event added, auto fill in turn with current kingdom turn
- break up utils/main file and other giant ones
- read through items and see if any rolls can be automated (ie economic boom)


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

## Building grid logic
- toggle for "can overlap" so things like cistern or magical streetlamps can be shown
  - optional list to limit to certain building types
  - must be able to handle lotless and lotted buildings
- follows building limits (ie must be next to X, cannot be next to Y, limit Z per settlement/district)

## Hex map
- optional settings
  - FOW exploration (see fow-exploration branch)