# For current release

## District stuff
- terrain type for each district border

## General stuff
- refactor settlements hbs file to make it less huge
- all missing localization strings
- scrollbars for
  - lotless buildings in districts
  - unassigned items for settlements
- convert all html styles into css classes

## Documentation
- explain that max base value and purchase limit should be assumed to be percentage
  increases/decreases and the percentages are all added up before being applied
  example: change value of 50 should equate to a 50% increase, -30 should be a 30% decrease
           the overall effect is a 20% increase
- update settlement delete string to say that all associated buildings and features will be
  deleted too
- doc for right clicking buildings in grid to get context menu




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

## Settlement Features
- add magic item availability (see impoverished disadvantage)
- add a toggle for buildings providing magic items (as currently is) or base for settlement of given size

## Building logic
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
